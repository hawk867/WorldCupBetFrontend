import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div class="w-full max-w-md">
        <div class="bg-card dark:bg-card-dark rounded-xl shadow-2xl p-8">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-primary dark:text-white">Cambiar Contraseña</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Actualiza tu contraseña de acceso</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                type="password"
                formControlName="currentPassword"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                formControlName="newPassword"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
              />
              @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
                <p class="text-xs text-red-500 mt-1">Mínimo 8 caracteres</p>
              }
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
              />
              @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <p class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full py-2.5 px-4 rounded-lg bg-primary dark:bg-accent text-white font-semibold hover:bg-primary/90 dark:hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <app-spinner size="sm" />
                <span>Guardando...</span>
              } @else {
                <span>Cambiar Contraseña</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PasswordChangePage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: [this.passwordMatchValidator] });

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { currentPassword, newPassword } = this.form.getRawValue();
      await this.api.put('/auth/password', { currentPassword, newPassword });
      this.notification.success('Contraseña actualizada correctamente');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      if (err?.status === 401) {
        this.errorMessage.set('La contraseña actual es incorrecta.');
      } else {
        this.errorMessage.set('Error al cambiar la contraseña. Intenta nuevamente.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
