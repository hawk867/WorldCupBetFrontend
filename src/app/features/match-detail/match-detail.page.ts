import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatchDetailResponse, MatchUpdateMessage } from '../../core/models/match.model';
import { PredictionResponse, CreatePredictionRequest, UpdatePredictionRequest } from '../../core/models/prediction.model';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12">
        <app-spinner size="lg" />
      </div>
    } @else if (match()) {
      <div class="max-w-2xl mx-auto">
        <!-- Back button -->
        <button (click)="goBack()" class="mb-4 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <!-- Match header card -->
        <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-6 mb-6">
          <div class="text-center mb-4">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {{ match()!.stage.name }}
            </span>
            <!-- Status badge -->
            <div class="mt-2">
              @switch (match()!.status) {
                @case ('SCHEDULED') {
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    Programado
                  </span>
                }
                @case ('LIVE') {
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse">
                    🔴 En Vivo
                  </span>
                }
                @case ('FINISHED') {
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    Finalizado
                  </span>
                }
                @default {
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {{ match()!.status }}
                  </span>
                }
              }
            </div>
          </div>

          <!-- Teams and score -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1 text-center">
              <img [src]="match()!.homeTeam.flagUrl" [alt]="match()!.homeTeam.name" class="w-16 h-12 object-cover rounded mx-auto shadow-sm mb-2" />
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ match()!.homeTeam.name }}</p>
            </div>

            <div class="text-center px-4">
              @if (match()!.homeGoals !== null && match()!.awayGoals !== null) {
                <div class="flex items-center gap-2">
                  <span class="text-4xl font-bold text-primary dark:text-white tabular-nums">{{ match()!.homeGoals }}</span>
                  <span class="text-2xl text-slate-400">-</span>
                  <span class="text-4xl font-bold text-primary dark:text-white tabular-nums">{{ match()!.awayGoals }}</span>
                </div>
                @if (match()!.wentToPenalties) {
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Penales: {{ match()!.homePenalties }} - {{ match()!.awayPenalties }}
                  </p>
                }
              } @else {
                <p class="text-lg text-slate-500 dark:text-slate-400">
                  {{ formatDateTime(match()!.kickoffAt) }}
                </p>
              }
            </div>

            <div class="flex-1 text-center">
              <img [src]="match()!.awayTeam.flagUrl" [alt]="match()!.awayTeam.name" class="w-16 h-12 object-cover rounded mx-auto shadow-sm mb-2" />
              <p class="font-semibold text-slate-800 dark:text-slate-200">{{ match()!.awayTeam.name }}</p>
            </div>
          </div>
        </div>

        <!-- Prediction form -->
        <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-6">
          @if (match()!.status === 'SCHEDULED') {
            <h2 class="text-lg font-semibold text-primary dark:text-white mb-4">
              {{ existingPrediction() ? 'Modificar Predicción' : 'Hacer Predicción' }}
            </h2>

            <form [formGroup]="predictionForm" (ngSubmit)="submitPrediction()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {{ match()!.homeTeam.name }}
                  </label>
                  <input
                    type="number"
                    formControlName="homeGoals"
                    min="0"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-center text-lg font-bold focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {{ match()!.awayTeam.name }}
                  </label>
                  <input
                    type="number"
                    formControlName="awayGoals"
                    min="0"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-center text-lg font-bold focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Penalty inputs for knockout stages -->
              @if (isKnockout() && goalsAreTied()) {
                <div class="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
                  <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Penales (empate en tiempo regular)</p>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        formControlName="homePenalties"
                        min="0"
                        placeholder="Penales local"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        formControlName="awayPenalties"
                        min="0"
                        placeholder="Penales visitante"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-primary dark:focus:ring-accent-light focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              }

              @if (predictionForm.invalid && predictionForm.touched) {
                <p class="text-xs text-red-500">Los goles deben ser números no negativos</p>
              }

              <button
                type="submit"
                [disabled]="predictionForm.invalid || submitting()"
                class="w-full py-2.5 px-4 rounded-lg bg-primary dark:bg-accent text-white font-semibold hover:bg-primary/90 dark:hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                @if (submitting()) {
                  <app-spinner size="sm" />
                }
                <span>Guardar Predicción</span>
              </button>
            </form>

            @if (existingPrediction()) {
              <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p class="text-sm text-blue-700 dark:text-blue-400">
                  Tu predicción actual: {{ existingPrediction()!.homeGoals }} - {{ existingPrediction()!.awayGoals }}
                  @if (existingPrediction()!.homePenalties !== null) {
                    (Penales: {{ existingPrediction()!.homePenalties }} - {{ existingPrediction()!.awayPenalties }})
                  }
                </p>
              </div>
            }
          } @else {
            <div class="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p class="text-slate-500 dark:text-slate-400 font-medium">Predicciones cerradas</p>
              <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">
                No se pueden hacer predicciones para partidos en vivo o finalizados
              </p>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class MatchDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly ws = inject(WebSocketService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  protected readonly match = signal<MatchDetailResponse | null>(null);
  protected readonly existingPrediction = signal<PredictionResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);

  protected readonly predictionForm = this.fb.nonNullable.group({
    homeGoals: [0, [Validators.required, Validators.min(0)]],
    awayGoals: [0, [Validators.required, Validators.min(0)]],
    homePenalties: [null as number | null],
    awayPenalties: [null as number | null],
  });

  protected readonly isKnockout = computed(() => {
    const stage = this.match()?.stage.name?.toLowerCase() ?? '';
    return stage.includes('octavos') || stage.includes('cuartos') || stage.includes('semi') || stage.includes('final') || stage.includes('round of') || stage.includes('quarter') || stage.includes('knockout');
  });

  protected readonly goalsAreTied = computed(() => {
    const home = this.predictionForm.get('homeGoals')?.value;
    const away = this.predictionForm.get('awayGoals')?.value;
    return home !== null && away !== null && home === away;
  });

  async ngOnInit(): Promise<void> {
    const matchId = this.route.snapshot.paramMap.get('id');
    if (!matchId) return;

    await this.loadMatchData(+matchId);
    this.ws.connect();
    this.subscribeToMatch(+matchId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private async loadMatchData(matchId: number): Promise<void> {
    try {
      const [match, predictions] = await Promise.all([
        this.api.get<MatchDetailResponse>(`/matches/${matchId}`),
        this.api.get<PredictionResponse[]>(`/predictions/match/${matchId}`).catch(() => [] as PredictionResponse[]),
      ]);
      this.match.set(match);

      const prediction = predictions.length > 0 ? predictions[0] : null;
      this.existingPrediction.set(prediction);

      if (prediction) {
        this.predictionForm.patchValue({
          homeGoals: prediction.homeGoals,
          awayGoals: prediction.awayGoals,
          homePenalties: prediction.homePenalties,
          awayPenalties: prediction.awayPenalties,
        });
      }
    } catch {
      // Error handled by interceptor
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeToMatch(matchId: number): void {
    const sub = this.ws.subscribe<MatchUpdateMessage>(`/topic/matches/${matchId}`).subscribe(update => {
      this.match.update(m => m ? {
        ...m,
        status: update.status,
        homeGoals: update.homeGoals,
        awayGoals: update.awayGoals,
        homePenalties: update.homePenalties,
        awayPenalties: update.awayPenalties,
        wentToPenalties: update.wentToPenalties,
        updatedAt: update.updatedAt,
      } : m);
    });
    this.subscriptions.push(sub);
  }

  async submitPrediction(): Promise<void> {
    if (this.predictionForm.invalid) return;

    this.submitting.set(true);
    const values = this.predictionForm.getRawValue();
    const matchId = this.match()!.id;

    try {
      if (this.existingPrediction()) {
        const body: UpdatePredictionRequest = {
          homeGoals: values.homeGoals,
          awayGoals: values.awayGoals,
          homePenalties: values.homePenalties ?? undefined,
          awayPenalties: values.awayPenalties ?? undefined,
        };
        await this.api.put(`/predictions/${this.existingPrediction()!.id}`, body);
      } else {
        const body: CreatePredictionRequest = {
          matchId,
          homeGoals: values.homeGoals,
          awayGoals: values.awayGoals,
          homePenalties: values.homePenalties ?? undefined,
          awayPenalties: values.awayPenalties ?? undefined,
        };
        await this.api.post('/predictions', body);
      }
      this.notification.success('Predicción guardada correctamente');
      // Reload prediction
      const predictions = await this.api.get<PredictionResponse[]>(`/predictions/match/${matchId}`).catch(() => []);
      if (predictions.length > 0) {
        this.existingPrediction.set(predictions[0]);
      }
    } catch {
      // Error handled by interceptor
    } finally {
      this.submitting.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
