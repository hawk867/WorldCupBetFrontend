import { Routes } from '@angular/router';
import { AdminLayoutPage } from './admin-layout.page';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutPage,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () => import('./users/admin-users.page').then(m => m.AdminUsersPage),
      },
      {
        path: 'matches',
        loadComponent: () => import('./matches/admin-matches.page').then(m => m.AdminMatchesPage),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/admin-audit.page').then(m => m.AdminAuditPage),
      },
    ],
  },
];
