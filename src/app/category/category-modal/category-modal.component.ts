import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActionSheetService } from '../../shared/service/action-sheet.service';
import { filter, finalize, from } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../shared/service/toast.service';
import { CategoryService } from '../category.service';
import { Category } from '../../shared/domain';

[CategoryService];

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
})
export class CategoryModalComponent {
  readonly categoryForm: FormGroup;
  submitting = false;
  // Passed into the component by the ModalController, available in the ionViewWillEnter
  category: Category = {} as Category;
  constructor(
      private readonly actionSheetService: ActionSheetService,
      private readonly categoryService: CategoryService,
      private readonly formBuilder: FormBuilder,
      private readonly modalCtrl: ModalController,
      private readonly toastService: ToastService,
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
    });
  }
  ionViewWillEnter(): void {
    this.categoryForm.patchValue(this.category);
  }
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  save(): void {
    this.submitting = true;
    this.categoryService
        .upsertCategory(this.categoryForm.value)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.toastService.displaySuccessToast('Category saved');
            this.modalCtrl.dismiss(null, 'refresh');
          },
          error: (error) => this.toastService.displayErrorToast('Could not save category', error),
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
