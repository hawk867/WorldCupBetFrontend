import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CsvUploadResultResponse } from '../../../core/models/admin.model';
import { SpinnerComponent } from '../../../shared/components/spinner.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- CSV Upload Section -->
      <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold text-primary dark:text-white mb-4">Carga masiva de usuarios</h2>

        <!-- Drop zone -->
        <div
          (dragover)="onDragOver($event)"
          (dragleave)="isDragging.set(false)"
          (drop)="onDrop($event)"
          [class]="isDragging() ? 'border-primary dark:border-accent-light bg-primary/5 dark:bg-accent-light/5' : 'border-slate-300 dark:border-slate-600'"
          class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
          (click)="fileInput.click()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Arrastra un archivo CSV aquí o haz clic para seleccionar
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500">Formato: email, nombre, apellido</p>
        </div>

        <input
          #fileInput
          type="file"
          accept=".csv"
          (change)="onFileSelected($event)"
          class="hidden"
        />

        @if (selectedFile()) {
          <div class="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-sm text-slate-700 dark:text-slate-300">{{ selectedFile()!.name }}</span>
            <button
              (click)="uploadFile()"
              [disabled]="uploading()"
              class="px-4 py-2 rounded-lg bg-primary dark:bg-accent text-white text-sm font-medium hover:bg-primary/90 dark:hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              @if (uploading()) {
                <app-spinner size="sm" />
              }
              Subir
            </button>
          </div>
        }

        <!-- Upload result -->
        @if (uploadResult()) {
          <div class="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p class="text-sm font-medium text-green-700 dark:text-green-400">
              ✓ {{ uploadResult()!.createdCount }} usuarios creados
            </p>
            @if (uploadResult()!.errors.length > 0) {
              <div class="mt-3">
                <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errores:</p>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="text-left text-slate-500 dark:text-slate-400">
                        <th class="pb-1 pr-4">Fila</th>
                        <th class="pb-1 pr-4">Email</th>
                        <th class="pb-1">Razón</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (error of uploadResult()!.errors; track error.rowNumber) {
                        <tr class="text-red-600 dark:text-red-400">
                          <td class="py-0.5 pr-4">{{ error.rowNumber }}</td>
                          <td class="py-0.5 pr-4">{{ error.email }}</td>
                          <td class="py-0.5">{{ error.reason }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Password Reset Section -->
      <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold text-primary dark:text-white mb-4">Resetear contraseña</h2>
        <div class="flex gap-3">
          <input
            type="number"
            [value]="resetUserId()"
            (input)="onResetUserIdChange($event)"
            placeholder="ID del usuario"
            class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
          />
          <button
            (click)="resetPassword()"
            [disabled]="!resetUserId() || resetting()"
            class="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            @if (resetting()) {
              <app-spinner size="sm" />
            }
            Resetear
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersPage {
  private readonly api = inject(ApiService);
  private readonly notification = inject(NotificationService);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploading = signal(false);
  protected readonly uploadResult = signal<CsvUploadResultResponse | null>(null);
  protected readonly isDragging = signal(false);
  protected readonly resetUserId = signal<number | null>(null);
  protected readonly resetting = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedFile.set(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  async uploadFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.uploadResult.set(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await this.api.postMultipart<CsvUploadResultResponse>('/admin/users/upload', formData);
      this.uploadResult.set(result);
      this.notification.success(`${result.createdCount} usuarios creados correctamente`);
    } catch {
      // Error handled by interceptor
    } finally {
      this.uploading.set(false);
    }
  }

  onResetUserIdChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.resetUserId.set(value ? +value : null);
  }

  async resetPassword(): Promise<void> {
    const userId = this.resetUserId();
    if (!userId) return;

    this.resetting.set(true);
    try {
      await this.api.post(`/admin/users/${userId}/reset-password`);
      this.notification.success('Contraseña reseteada correctamente');
    } catch {
      // Error handled by interceptor
    } finally {
      this.resetting.set(false);
    }
  }
}
