import {Component} from '@angular/core';
import {InfiniteScrollCustomEvent, ModalController, RefresherCustomEvent} from '@ionic/angular';
import {ExpenseModalComponent} from '../expense-modal/expense-modal.component';
import {FormBuilder, FormGroup} from "@angular/forms";
import {debounce, interval} from "rxjs";
import {Expense, ExpenseCriteria, SortOption} from "../../shared/domain";
import {ExpenseService} from "../expense.service";
import {ToastService} from "../../shared/service/toast.service";
import {addMonths, format} from 'date-fns'; // Importieren von addMonths und format

@Component({
  selector: 'app-expense-overview',
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  expenseGroups: any[] | undefined;
  loading = false;
  expenses: Expense[] = [];
  lastPageReached = false;
  searchCriteria: ExpenseCriteria = { page: 0, size: 25, sort: 'name,asc' };
  date = new Date(); // Aktuelles Datum
  readonly searchForm: FormGroup;
  readonly sortOptions: SortOption[] = [
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' },
    { label: 'Date (newest first)', value: 'createdAt,asc' },
    { label: 'Date (oldest first)', value: 'createdAt,asc' },
    { label: 'Name (A-Z)', value: 'name,asc' },
    { label: 'Name (Z-A)', value: 'name,desc' },
  ];
  constructor(
    private readonly modalCtrl: ModalController,
    private readonly formBuilder: FormBuilder,
    private readonly expenseService: ExpenseService,
    private readonly toastService: ToastService,
  ) {
    this.searchForm = this.formBuilder.group({ name: [], sort: ['name,asc'] });
    this.searchForm.valueChanges
      .pipe(debounce((value) => interval(value.name?.length ? 400 : 0)))
      .subscribe((value) => {
        this.searchCriteria = { ...this.searchCriteria, ...value, page: 0 };
        this.loadExpenses();
      });
    this.loadExpenses();
  }
  async openModal(expense?: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense: expense ? { ...expense } : {} },
    });
    modal.present();
    const { role } = await modal.onWillDismiss();
    console.log('role', role);
  }
  private loadExpenses(next: () => void = () => {}): void {
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    this.expenseService
      .getExpenses(this.searchCriteria)
      .subscribe({
        next: (expenses) => {
          if (this.searchCriteria.page === 0 || !this.expenses) this.expenses = [];

          this.expenses.push(...expenses.content);
          this.lastPageReached = expenses.last;
        },
        error: (error) => this.toastService.displayErrorToast('Could not load expenses', error),
        complete: () => {
          this.loading = false;
          next();
        },
      });
  }
  loadNextExpensePage($event: any) {
    this.searchCriteria.page++;
    this.loadExpenses(() => ($event as InfiniteScrollCustomEvent).target.complete());
  }
  reloadExpenses($event?: any): void {
    this.searchCriteria.page = 0;
    this.loadExpenses(() => ($event ? ($event as RefresherCustomEvent).target.complete() : {}));
  }
  // Methode zum ninzufügen von Monaten
  addMonths(number: number): void {
    this.date = addMonths(this.date, number);
    this.loadExpenses();
  }
  // Methode zum Anzeige vom aktuellen Datums im Titel
  getCurrentMonthYear(): string {
    return format(this.date, 'MMMM yyyy');
  }
}
