import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center">
      <div
        [class]="spinnerClasses()"
        class="rounded-full border-4 border-primary-light dark:border-card-dark border-t-primary dark:border-t-accent-light animate-spin"
      ></div>
    </div>
  `,
})
export class SpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');

  spinnerClasses() {
    switch (this.size()) {
      case 'sm': return 'w-5 h-5';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
    }
  }
}
