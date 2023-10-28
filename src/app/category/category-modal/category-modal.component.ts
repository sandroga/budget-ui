import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ActionSheetService} from '../../shared/services/action-sheet.service';
import {filter, finalize, from} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoryService} from "../../shared/services/category.service";
import {ToastService} from "../../shared/services/toast.service";

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
})
export class CategoryModalComponent {
  readonly categoryForm: FormGroup; // Declare the FormGroup variable
  submitting = false; // Variable to track the submitting state

  constructor(
    private readonly actionSheetService: ActionSheetService,
    private readonly categoryService: CategoryService,
    private readonly formBuilder: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly toastService: ToastService
  ) {
    // Initialize the FormGroup in the constructor
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
    });
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    this.submitting = true;

    this.categoryService
      .upsertCategory(this.categoryForm.value)
      .pipe(
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: () => {
          this.toastService.displaySuccessToast('Category saved');
          this.modalCtrl.dismiss(null, 'refresh');
        },
        error: (error) => {
          this.toastService.displayErrorToast('Could not save category', error);
          // Optionally, you can handle the error in more detail or display a message to the user.
        },
      });
  }


  delete(): void {
    from(this.actionSheetService.showDeletionConfirmation('Are you sure you want to delete this category?'))
      .pipe(filter((action) => action === 'delete'))
      .subscribe({
        next: () => {
          this.modalCtrl.dismiss(null, 'delete');
        },
      });
  }
}
