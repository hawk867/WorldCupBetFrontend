import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/30 px-4">
      <div class="w-full max-w-md">
        <div class="bg-card dark:bg-card-dark rounded-xl shadow-2xl p-8">
          <!-- Title -->
          <div class="text-center mb-8">
            <div class="flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-primary dark:text-white">MundialFutbol <span class="text-gold">2026</span></h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ingresa a tu cuenta</p>
          </div>

          <!-- Error message -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full py-2.5 px-4 rounded-lg bg-primary dark:bg-accent text-white font-semibold hover:bg-primary/90 dark:hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <app-spinner size="sm" />
                <span>Ingresando...</span>
              } @else {
                <span>Ingresar</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
    } catch (err: any) {
      if (err?.status === 401) {
        this.errorMessage.set('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else {
        this.errorMessage.set('Error al conectar con el servidor. Intenta nuevamente.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
