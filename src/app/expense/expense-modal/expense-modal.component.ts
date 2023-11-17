import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryModalComponent } from '../../category/category-modal/category-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../category/category.service';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService } from '../expense.service';
import { Category, Expense } from '../../shared/domain';
import { formatISO, parseISO } from 'date-fns';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { filter, from } from 'rxjs';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
})
export class ExpenseModalComponent {
    expenseForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        categoryId: [''],
        amount: ['', [Validators.required, Validators.min(0)]],
        date: [new Date().toISOString(), Validators.required],
    });

    submitting = false;

    categories: Category[] = [];
    expense: Expense = {} as Expense;

    constructor(
        private fb: FormBuilder,
        private expenseService: ExpenseService,
        private readonly actionSheetService: ActionSheetService,
        private readonly formBuilder: FormBuilder,
        private readonly modalCtrl: ModalController,
        private readonly toastService: ToastService,
        private readonly categoryService: CategoryService
    ){}

    ngOnInit(): void {
        this.expenseForm = this.fb.group({
            name: ['', Validators.required],
            categoryId: [''], // Dies ist das Feld für die Kategorie (optional)
            amount: ['', [Validators.required, Validators.min(0)]],
            date: [new Date().toISOString(), Validators.required], // Initialwert für das Datum
        })
    }

  save(): void {
    this.submitting = true;
    this.expenseService
      .upsertExpense({
        ...this.expenseForm.value,
        date: formatISO(parseISO(this.expenseForm.value.date), { representation: 'date' }),
      })
      .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Expense saved');
          this.modalCtrl.dismiss(null, 'refresh');
        },
        error: (error) => this.toastService.displayErrorToast('Could not save category', error),
      })
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this expense?'))
      .pipe(filter((action) => action === 'delete'))
      .subscribe(() => this.modalCtrl.dismiss(null, 'delete'));
  }

  async showCategoryModal(): Promise<void> {
    const CategoryModal = await this.modalCtrl.create({ component: CategoryModalComponent });
    CategoryModal.present();
    const { role } = await CategoryModal.onWillDismiss();
    if (role === 'refresh') this.loadAllCategories();
    console.log('role', role);
  }

  private loadAllCategories(): void {
    this.categoryService.getAllCategories({ sort: 'name,asc' }).subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => this.toastService.displayErrorToast('Could not load categories', error),
    });
  }
  ionViewDidEnter(): void {
    this.loadAllCategories();
  }
}
