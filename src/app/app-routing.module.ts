import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {categoriesPath, defaultPath, expensesPath, loginPath} from './shared/routes';
import {LoginComponent} from "./shared/login/login.component";
import {AuthGuard} from './guard/auth.guard'; // Stellen Sie sicher, dass dies der richtige Pfad zu Ihrem AuthGuard ist

const routes: Routes = [
  {
    path: '',
    redirectTo: defaultPath,
    pathMatch: 'full',
  },
  {
    path: categoriesPath,
    loadChildren: () => import('./category/category.module').then((m) => m.CategoryModule),
    canActivate: [AuthGuard], // Hier den AuthGuard hinzufügen
    data: { title: 'Categories | Budget UI' }, // Verwenden Sie data, um Metadaten für die Route festzulegen
  },
  {
    path: expensesPath,
    loadChildren: () => import('./expense/expense.module').then((m) => m.ExpenseModule),
    canActivate: [AuthGuard], // Hier den AuthGuard hinzufügen
    data: { title: 'Expenses | Budget UI' }, // Verwenden Sie data, um Metadaten für die Route festzulegen
  },
  {
    path: loginPath,
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: defaultPath,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
