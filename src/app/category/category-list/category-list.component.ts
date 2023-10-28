import {Component, OnDestroy} from '@angular/core';
import {CategoryModalComponent} from '../category-modal/category-modal.component';
import {InfiniteScrollCustomEvent, ModalController, RefresherCustomEvent} from '@ionic/angular';
import {Category, CategoryCriteria} from '../../shared/domain';
import {CategoryService} from '../../shared/services/category.service'; // Importiere deinen CategoryService
import {ToastService} from '../../shared/services/toast.service'; // Importiere deinen ToastService
import {finalize} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SortOption} from '../../shared/models/sort-option.model';
import {debounce, interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnDestroy {
  readonly searchForm: FormGroup;
  readonly sortOptions: SortOption[] = [
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' },
    { label: 'Name (A-Z)', value: 'name,asc' },
    { label: 'Name (Z-A)', value: 'name,desc' },
  ];
  private readonly searchFormSubscription: Subscription;
  categories: Category[] | null = null;
  readonly initialSort = 'name,asc';
  lastPageReached = false;
  loading = false;
  searchCriteria: CategoryCriteria = { page: 0, size: 25, sort: this.initialSort };
  constructor(
    private readonly modalCtrl: ModalController,
    private readonly categoryService: CategoryService,
    private readonly toastService: ToastService,
    private readonly formBuilder: FormBuilder // Hinzugefügte Abhängigkeit
  ) {
    this.searchForm = this.formBuilder.group({
      name: [''],
      sort: [this.initialSort],
    });
    this.searchFormSubscription = this.searchForm.valueChanges
      .pipe(debounce((value) => interval(value.name?.length ? 400 : 0)))
      .subscribe((value) => {
        this.searchCriteria = { ...this.searchCriteria, ...value, page: 0 };
        this.loadCategories();
      });
  }
  ngOnDestroy(): void {
    this.searchFormSubscription.unsubscribe();
  }
  ionViewDidEnter(): void {
    this.loadCategories();
  }
  ionViewDidLeave(): void {
    this.searchFormSubscription.unsubscribe();
  }
  async openModal(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryModalComponent });
    modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'refresh') this.reloadCategories();
  }
  private loadCategories(next: () => void = () => {}): void {
    this.loading = true;
    this.categoryService
      .getCategories(this.searchCriteria)
      .pipe(
        finalize(() => {
          this.loading = false;
          next();
        }),
      )
      .subscribe({
        next: (categories) => {
          if (this.searchCriteria.page === 0 || !this.categories) this.categories = [];
          this.categories.push(...categories.content);
          this.lastPageReached = categories.last;
        },
        error: (error) => this.toastService.displayErrorToast('Could not load categories', error),
      });
  }
  loadNextCategoryPage($event: any) {
    this.searchCriteria.page++;
    this.loadCategories(() => ($event as InfiniteScrollCustomEvent).target.complete());
  }
  reloadCategories($event?: any): void {
    this.searchCriteria.page = 0;
    this.loadCategories(() => ($event ? ($event as RefresherCustomEvent).target.complete() : {}));
  }
}
