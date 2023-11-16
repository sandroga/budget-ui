import { Component } from '@angular/core';
import { filter, finalize, from } from 'rxjs';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../shared/service/toast.service';
import { ExpenseService } from '../expense.service';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
})
export class ExpenseModalComponent {
  readonly expenseForm: FormGroup;
  submitting = false;

  constructor(
    private readonly actionSheetService: ActionSheetService,
    private readonly expenseService: ExpenseService,
    private readonly formBuilder: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly toastService: ToastService,
  ) {
    this.expenseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
    });
  }

  save(): void {
    this.submitting = true;
    this.expenseService
      .upsertExpense(this.expenseForm.value)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Expense saved');
          this.modalCtrl.dismiss(null, 'refresh');
        },
        error: (error) => this.toastService.displayErrorToast('Could not save category', error),
      });
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this expense?'))
      .pipe(filter((action) => action === 'delete'))
      .subscribe(() => this.modalCtrl.dismiss(null, 'delete'));
  }

  async showExpenseModal(): Promise<void> {
    const expenseModal = await this.modalCtrl.create({ component: ExpenseModalComponent });
    await expenseModal.present();
    const { role } = await expenseModal.onWillDismiss();
    console.log('role', role);
  }
}
