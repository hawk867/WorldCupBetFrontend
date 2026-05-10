import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuditLogResponse } from '../../../core/models/admin.model';
import { SpinnerComponent } from '../../../shared/components/spinner.component';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Seed button -->
      <div class="flex justify-end">
        <button
          (click)="seedData()"
          [disabled]="seeding()"
          class="px-4 py-2 rounded-lg bg-gold text-white text-sm font-medium hover:bg-gold/90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          @if (seeding()) {
            <app-spinner size="sm" />
          }
          Sembrar datos
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <input
          type="text"
          [value]="filterEntity()"
          (input)="onFilterEntityChange($event)"
          placeholder="Filtrar por entidad"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-card dark:bg-card-dark text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent-light outline-none"
        />
        <input
          type="text"
          [value]="filterEntityId()"
          (input)="onFilterEntityIdChange($event)"
          placeholder="Filtrar por ID"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-card dark:bg-card-dark text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent-light outline-none"
        />
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <app-spinner size="lg" />
        </div>
      } @else {
        <div class="bg-card dark:bg-card-dark rounded-xl shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Admin</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acción</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Entidad</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Detalles</th>
                </tr>
              </thead>
              <tbody>
                @for (log of filteredLogs(); track log.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {{ formatDate(log.createdAt) }}
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ log.adminEmail }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-xs font-medium bg-primary-light dark:bg-slate-700 text-primary dark:text-slate-300">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ log.entity }}</td>
                    <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ log.entityId }}</td>
                    <td class="px-4 py-3">
                      <button
                        (click)="toggleDetails(log.id)"
                        class="text-xs text-primary dark:text-accent-light hover:underline"
                      >
                        {{ expandedId() === log.id ? 'Ocultar' : 'Ver' }}
                      </button>
                    </td>
                  </tr>
                  @if (expandedId() === log.id) {
                    <tr class="bg-slate-50 dark:bg-slate-800/50">
                      <td colspan="6" class="px-4 py-3">
                        <pre class="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">{{ formatJson(log.details) }}</pre>
                      </td>
                    </tr>
                  }
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No hay registros de auditoría
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminAuditPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notification = inject(NotificationService);

  protected readonly logs = signal<AuditLogResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly seeding = signal(false);
  protected readonly expandedId = signal<number | null>(null);
  protected readonly filterEntity = signal('');
  protected readonly filterEntityId = signal('');

  protected readonly filteredLogs = computed(() => {
    let result = this.logs();
    const entity = this.filterEntity().toLowerCase();
    const entityId = this.filterEntityId();

    if (entity) {
      result = result.filter(l => l.entity.toLowerCase().includes(entity));
    }
    if (entityId) {
      result = result.filter(l => String(l.entityId).includes(entityId));
    }
    return result;
  });

  async ngOnInit(): Promise<void> {
    await this.loadLogs();
  }

  private async loadLogs(): Promise<void> {
    try {
      const logs = await this.api.get<AuditLogResponse[]>('/admin/audit');
      this.logs.set(logs);
    } catch {
      // Error handled by interceptor
    } finally {
      this.loading.set(false);
    }
  }

  async seedData(): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas sembrar datos? Esto puede modificar la base de datos.')) return;

    this.seeding.set(true);
    try {
      await this.api.post('/admin/seed');
      this.notification.success('Datos sembrados correctamente');
      await this.loadLogs();
    } catch {
      // Error handled by interceptor
    } finally {
      this.seeding.set(false);
    }
  }

  toggleDetails(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  onFilterEntityChange(event: Event): void {
    this.filterEntity.set((event.target as HTMLInputElement).value);
  }

  onFilterEntityIdChange(event: Event): void {
    this.filterEntityId.set((event.target as HTMLInputElement).value);
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString('es', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  formatJson(obj: Record<string, unknown>): string {
    return JSON.stringify(obj, null, 2);
  }
}
