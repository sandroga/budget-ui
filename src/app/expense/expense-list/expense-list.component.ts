import { Component } from '@angular/core';
import { addMonths, set } from 'date-fns';
import { InfiniteScrollCustomEvent, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import { Expense, ExpenseCriteria } from '../../shared/domain';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService } from '../expense.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-expense-overview',
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  date = set(new Date(), { date: 1 });
  expenses: Expense[] | null = null;
  readonly initialSort = 'name,asc';
  lastPageReached = false;
  loading = false;
  searchCriteria: ExpenseCriteria = { page: 0, size: 25, sort: this.initialSort };

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly expenseService: ExpenseService,
    private readonly toastService: ToastService,
  ) {}
  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };

  private loadExpenses(next: () => void = () => {}): void {
    if (!this.searchCriteria.name) delete this.searchCriteria.name;
    this.loading = true;
    this.expenseService
      .getExpenses(this.searchCriteria)
      .pipe(
        finalize(() => {
          this.loading = false;
          next();
        }),
      )
      .subscribe({
        next: (expenses) => {
          if (this.searchCriteria.page === 0 || !this.expenses) this.expenses = [];
          this.expenses.push(...expenses.content);
          this.lastPageReached = expenses.last;
        },
        error: (error) => this.toastService.displayErrorToast('Could not load expenses', error),
      });
  }

  async openModal(expense?: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expense: expense ? { ...expense } : {} },
    });
    modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'refresh') this.reloadExpenses();
    console.log('role', role);
  }
  ionViewDidEnter(): void {
    this.loadExpenses();
  }
  loadNextExpensePage($event: any) {
    this.searchCriteria.page++;
    this.loadExpenses(() => ($event as InfiniteScrollCustomEvent).target.complete());
  }
  reloadExpenses($event?: any): void {
    this.searchCriteria.page = 0;
    this.loadExpenses(() => ($event ? ($event as RefresherCustomEvent).target.complete() : {}));
  }
}
