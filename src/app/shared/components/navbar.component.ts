import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-40 bg-primary dark:bg-card-dark shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="hidden sm:inline">MundialFutbol 2026</span>
            <span class="sm:hidden">MF 2026</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-white/20"
               class="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Dashboard
            </a>
            <a routerLink="/predictions" routerLinkActive="bg-white/20"
               class="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Predicciones
            </a>
            <a routerLink="/ranking" routerLinkActive="bg-white/20"
               class="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Ranking
            </a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="bg-white/20"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
                Admin
              </a>
            }
            <a routerLink="/password-change" routerLinkActive="bg-white/20"
               class="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Contraseña
            </a>
          </div>

          <!-- Right side: dark mode + logout -->
          <div class="flex items-center gap-2">
            <!-- Dark mode toggle -->
            <button
              (click)="toggleDarkMode()"
              class="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              [attr.aria-label]="isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
            >
              @if (isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>

            <!-- Logout -->
            <button
              (click)="auth.logout()"
              class="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>

            <!-- Mobile hamburger -->
            <button
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              class="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu dropdown -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden border-t border-white/10 bg-primary dark:bg-card-dark">
          <div class="px-4 py-3 space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-white/20" (click)="mobileMenuOpen.set(false)"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Dashboard
            </a>
            <a routerLink="/predictions" routerLinkActive="bg-white/20" (click)="mobileMenuOpen.set(false)"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Predicciones
            </a>
            <a routerLink="/ranking" routerLinkActive="bg-white/20" (click)="mobileMenuOpen.set(false)"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Ranking
            </a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="bg-white/20" (click)="mobileMenuOpen.set(false)"
                 class="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
                Admin
              </a>
            }
            <a routerLink="/password-change" routerLinkActive="bg-white/20" (click)="mobileMenuOpen.set(false)"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Cambiar Contraseña
            </a>
            <button
              (click)="auth.logout()"
              class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly isDark = signal(this.getInitialDarkMode());

  private getInitialDarkMode(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode(): void {
    const newValue = !this.isDark();
    this.isDark.set(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newValue);
  }

  constructor() {
    // Apply initial dark mode
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
