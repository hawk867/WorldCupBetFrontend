import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-primary dark:text-white mb-6">Panel de Administración</h1>

      <!-- Sub-navigation tabs -->
      <div class="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        <a routerLink="users" routerLinkActive="border-primary dark:border-accent-light text-primary dark:text-accent-light"
           class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
          Usuarios
        </a>
        <a routerLink="matches" routerLinkActive="border-primary dark:border-accent-light text-primary dark:text-accent-light"
           class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
          Partidos
        </a>
        <a routerLink="audit" routerLinkActive="border-primary dark:border-accent-light text-primary dark:text-accent-light"
           class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
          Auditoría
        </a>
      </div>

      <router-outlet />
    </div>
  `,
})
export class AdminLayoutPage {}
