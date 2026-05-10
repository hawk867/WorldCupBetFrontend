import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.addToast(message, 'success', 4000);
  }

  error(message: string): void {
    this.addToast(message, 'error', 0);
  }

  info(message: string): void {
    this.addToast(message, 'info', 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private addToast(message: string, type: Toast['type'], duration: number): void {
    const id = this.nextId++;
    this.toasts.update(toasts => [...toasts, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
