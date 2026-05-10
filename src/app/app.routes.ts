import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { passwordChangeGuard } from './core/guards/password-change.guard';
import { LayoutComponent } from './shared/components/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'password-change',
    loadComponent: () => import('./features/password-change/password-change.page')
      .then(m => m.PasswordChangePage),
    canActivate: [authGuard],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, passwordChangeGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page')
          .then(m => m.DashboardPage),
      },
      {
        path: 'matches/:id',
        loadComponent: () => import('./features/match-detail/match-detail.page')
          .then(m => m.MatchDetailPage),
      },
      {
        path: 'predictions',
        loadComponent: () => import('./features/predictions/predictions.page')
          .then(m => m.PredictionsPage),
      },
      {
        path: 'ranking',
        loadComponent: () => import('./features/ranking/ranking.page')
          .then(m => m.RankingPage),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes')
          .then(m => m.adminRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
