import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-surface dark:bg-surface-dark">
      <app-navbar />
      <main class="pt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <router-outlet />
        </div>
      </main>
      <app-toast />
    </div>
  `,
})
export class LayoutComponent {}
