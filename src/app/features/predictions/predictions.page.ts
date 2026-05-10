import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PredictionResponse } from '../../core/models/prediction.model';
import { SpinnerComponent } from '../../shared/components/spinner.component';

interface PredictionWithResult extends PredictionResponse {
  actualHomeGoals?: number | null;
  actualAwayGoals?: number | null;
  points?: number | null;
  classification?: 'exact' | 'winner' | 'wrong' | 'pending';
}

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-primary dark:text-white mb-6">Mis Predicciones</h1>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <app-spinner size="lg" />
        </div>
      } @else {
        <div class="space-y-3">
          @for (prediction of sortedPredictions(); track prediction.id) {
            <div
              (click)="goToMatch(prediction.matchId)"
              class="bg-card dark:bg-card-dark rounded-xl shadow-sm p-4 border-l-4 cursor-pointer hover:shadow-md transition-all"
              [class]="getBorderClass(prediction.classification)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {{ prediction.homeTeam }} vs {{ prediction.awayTeam }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ formatDate(prediction.kickoffAt) }}
                  </p>
                </div>

                <div class="text-right">
                  <div class="text-sm font-bold text-primary dark:text-white">
                    Mi predicción: {{ prediction.homeGoals }} - {{ prediction.awayGoals }}
                  </div>
                  @if (prediction.actualHomeGoals !== undefined && prediction.actualHomeGoals !== null) {
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                      Resultado: {{ prediction.actualHomeGoals }} - {{ prediction.actualAwayGoals }}
                    </div>
                  }
                </div>

                @if (prediction.points !== undefined && prediction.points !== null) {
                  <div class="ml-4 px-3 py-1 rounded-full bg-gold/10 text-gold font-bold text-sm">
                    +{{ prediction.points }}
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-500 dark:text-slate-400">
              <p class="text-lg">No tienes predicciones aún</p>
              <p class="text-sm mt-1">Ve al dashboard para hacer tus predicciones</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PredictionsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected readonly predictions = signal<PredictionWithResult[]>([]);
  protected readonly loading = signal(true);

  protected readonly sortedPredictions = computed(() => {
    return [...this.predictions()].sort((a, b) =>
      new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime()
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const predictions = await this.api.get<PredictionWithResult[]>('/predictions');
      this.predictions.set(predictions);
    } catch {
      // Error handled by interceptor
    } finally {
      this.loading.set(false);
    }
  }

  getBorderClass(classification?: string): string {
    switch (classification) {
      case 'exact': return 'border-green-500';
      case 'winner': return 'border-yellow-500';
      case 'wrong': return 'border-red-500';
      default: return 'border-slate-200 dark:border-slate-600';
    }
  }

  goToMatch(matchId: number): void {
    this.router.navigate(['/matches', matchId]);
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
