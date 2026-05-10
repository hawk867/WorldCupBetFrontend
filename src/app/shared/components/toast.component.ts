import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300 animate-slide-in"
          [class]="getToastClasses(toast.type)"
        >
          <span class="flex-1">{{ toast.message }}</span>
          @if (toast.type === 'error') {
            <button
              (click)="notificationService.dismiss(toast.id)"
              class="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Cerrar notificación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
})
export class ToastComponent {
  protected readonly notificationService = inject(NotificationService);

  getToastClasses(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success': return 'bg-green-600 dark:bg-green-500';
      case 'error': return 'bg-red-600 dark:bg-red-500';
      case 'info': return 'bg-blue-600 dark:bg-blue-500';
    }
  }
}
