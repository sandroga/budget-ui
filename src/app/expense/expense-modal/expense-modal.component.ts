import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format, formatISO, parseISO } from 'date-fns';
import { BehaviorSubject, from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { CategoryModalComponent } from '../../category/category-modal/category-modal.component';
import { Category, Expense } from '../../shared/domain';
import { CategoryService } from '../../category/category.service';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService } from 'src/app/expense/expense.service';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
})
export class ExpenseModalComponent implements OnInit {
  categories: Category[] = [];
  expense: Expense = {} as Expense;
  expenseForm: FormGroup;
  submitting = false;

  constructor(
    private readonly actionSheetService: ActionSheetService,
    private readonly modalCtrl: ModalController,
    private readonly categoryService: CategoryService,
    private readonly toastService: ToastService,
    private readonly formBuilder: FormBuilder,
    private readonly expenseService: ExpenseService,
  ) {
    this.expenseForm = this.formBuilder.group({
      id: [],
      categoryId: [],
      name: ['', [Validators.required, Validators.maxLength(40)]],
      amount: [],
      date: [formatISO(new Date())],
    });
  }

  ngOnInit(): void {
    const { id, amount, category, date, name } = this.expense;
    if (category) this.categories.push(category);
    if (id) this.expenseForm.patchValue({ id, amount, categoryId: category?.id, date, name });
    this.loadAllCategories();
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    this.submitting = true;
    this.expenseService
      .upsertExpense({ ...this.expenseForm.value, date: format(parseISO(this.expenseForm.value.date), 'yyyy-MM-dd') })
      .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Expense saved');
          this.modalCtrl.dismiss(null, 'refresh');
          this.submitting = false;
        },
        error: (error) => {
          this.toastService.displayErrorToast('Could not save category', error);
          this.submitting = false;
        },
      });
  }

  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this expense?'))
      .pipe(
        filter((action) => action === 'delete'),
        mergeMap(() => {
          this.submitting = true;
          return this.expenseService.deleteExpense(this.expense.id!);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Expense deleted');
          this.modalCtrl.dismiss(null, 'refresh');
          this.submitting = false;
        },
        error: (error) => {
          this.toastService.displayErrorToast('Could not delete expense', error);
          this.submitting = false;
        },
      });
  }

  async showCategoryModal(): Promise<void> {
    const categoryModal = await this.modalCtrl.create({ component: CategoryModalComponent });
    categoryModal.present();
    const { role } = await categoryModal.onWillDismiss();
    if (role === 'refresh') this.loadAllCategories();
  }

  private loadAllCategories(): void {
    const pageToLoad = new BehaviorSubject<number>(0); // Hier wurde BehaviorSubject<number> hinzugefügt
    pageToLoad
      .pipe(
        mergeMap((page) => this.categoryService.getCategories({ page: page as number, size: 25, sort: 'name,asc' })),
      ) // page wurde als number explizit gekennzeichnet
      .subscribe({
        next: (categories) => {
          if (pageToLoad.value === 0) this.categories = [];
          this.categories.push(...categories.content);
          if (!categories.last) pageToLoad.next(pageToLoad.value + 1);
        },
        error: (error) => this.toastService.displayErrorToast('Could not load categories', error),
      });
  }
}
