import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatchResponse, MatchStatus } from '../../../core/models/match.model';
import { SpinnerComponent } from '../../../shared/components/spinner.component';

@Component({
  selector: 'app-admin-matches',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    <div>
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
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Partido</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Resultado</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (match of matches(); track match.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td class="px-4 py-3">
                      <div class="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {{ match.homeTeam }} vs {{ match.awayTeam }}
                      </div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">{{ match.stage }}</div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(match.status)">
                        {{ match.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      @if (match.homeGoals !== null) {
                        {{ match.homeGoals }} - {{ match.awayGoals }}
                      } @else {
                        -
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="openResultForm(match)"
                          class="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Resultado
                        </button>
                        <select
                          (change)="changeStatus(match.id, $event)"
                          class="px-2 py-1 rounded text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300"
                        >
                          <option value="">Estado...</option>
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="LIVE">LIVE</option>
                          <option value="FINISHED">FINISHED</option>
                        </select>
                        <button
                          (click)="recalculate(match.id)"
                          class="px-2 py-1 rounded text-xs font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                        >
                          Recalcular
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Inline result form -->
                  @if (editingMatchId() === match.id) {
                    <tr class="bg-blue-50 dark:bg-blue-900/10">
                      <td colspan="4" class="px-4 py-3">
                        <form [formGroup]="resultForm" (ngSubmit)="submitResult(match.id)" class="flex items-center gap-3 flex-wrap">
                          <input type="number" formControlName="homeGoals" min="0" placeholder="Local"
                            class="w-20 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-sm text-center" />
                          <span class="text-slate-500">-</span>
                          <input type="number" formControlName="awayGoals" min="0" placeholder="Visitante"
                            class="w-20 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-sm text-center" />
                          <button type="submit" [disabled]="resultForm.invalid"
                            class="px-3 py-1.5 rounded bg-primary dark:bg-accent text-white text-xs font-medium disabled:opacity-50">
                            Guardar
                          </button>
                          <button type="button" (click)="editingMatchId.set(null)"
                            class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                            Cancelar
                          </button>
                        </form>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMatchesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly matches = signal<MatchResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingMatchId = signal<number | null>(null);

  protected readonly resultForm = this.fb.nonNullable.group({
    homeGoals: [0, [Validators.required, Validators.min(0)]],
    awayGoals: [0, [Validators.required, Validators.min(0)]],
  });

  async ngOnInit(): Promise<void> {
    await this.loadMatches();
  }

  private async loadMatches(): Promise<void> {
    try {
      const matches = await this.api.get<MatchResponse[]>('/matches');
      this.matches.set(matches);
    } catch {
      // Error handled by interceptor
    } finally {
      this.loading.set(false);
    }
  }

  openResultForm(match: MatchResponse): void {
    this.editingMatchId.set(match.id);
    this.resultForm.patchValue({
      homeGoals: match.homeGoals ?? 0,
      awayGoals: match.awayGoals ?? 0,
    });
  }

  async submitResult(matchId: number): Promise<void> {
    if (this.resultForm.invalid) return;
    const { homeGoals, awayGoals } = this.resultForm.getRawValue();
    try {
      await this.api.put(`/admin/matches/${matchId}/result`, { homeGoals, awayGoals });
      this.notification.success('Resultado actualizado');
      this.editingMatchId.set(null);
      await this.loadMatches();
    } catch {
      // Error handled by interceptor
    }
  }

  async changeStatus(matchId: number, event: Event): Promise<void> {
    const status = (event.target as HTMLSelectElement).value as MatchStatus;
    if (!status) return;
    try {
      await this.api.put(`/admin/matches/${matchId}/status`, { status });
      this.notification.success('Estado actualizado');
      await this.loadMatches();
    } catch (err: any) {
      if (err?.status === 422) {
        this.notification.error('Transición de estado no válida');
      }
    }
  }

  async recalculate(matchId: number): Promise<void> {
    if (!confirm('¿Recalcular puntajes para este partido?')) return;
    try {
      await this.api.post(`/admin/matches/${matchId}/recalculate`);
      this.notification.success('Puntajes recalculados');
    } catch {
      // Error handled by interceptor
    }
  }

  getStatusClass(status: MatchStatus): string {
    switch (status) {
      case 'LIVE': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'FINISHED': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      case 'SCHEDULED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  }
}
