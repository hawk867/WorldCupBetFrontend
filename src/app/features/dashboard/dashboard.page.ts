import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { MatchResponse, MatchStatus, MatchUpdateMessage } from '../../core/models/match.model';
import { MatchCardComponent } from './components/match-card.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatchCardComponent, SpinnerComponent],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-primary dark:text-white">Partidos</h1>
      </div>

      <!-- Filter bar -->
      <div class="mb-6 space-y-4">
        <!-- Status tabs -->
        <div class="flex flex-wrap gap-2">
          @for (tab of statusTabs; track tab.value) {
            <button
              (click)="selectedStatus.set(tab.value)"
              [class]="selectedStatus() === tab.value
                ? 'bg-primary dark:bg-accent text-white'
                : 'bg-card dark:bg-card-dark text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Stage filter -->
        <select
          (change)="onStageChange($event)"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-card dark:bg-card-dark text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent-light outline-none"
        >
          <option value="">Todas las etapas</option>
          @for (stage of stages(); track stage) {
            <option [value]="stage">{{ stage }}</option>
          }
        </select>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <app-spinner size="lg" />
        </div>
      } @else {
        <!-- Grouped matches -->
        @for (group of groupedMatches(); track group.date) {
          <div class="mb-6">
            <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {{ formatDate(group.date) }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (match of group.matches; track match.id) {
                <app-match-card [match]="match" />
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-slate-500 dark:text-slate-400">
            <p class="text-lg">No hay partidos para mostrar</p>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly ws = inject(WebSocketService);
  private subscriptions: Subscription[] = [];

  protected readonly matches = signal<MatchResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly selectedStatus = signal<MatchStatus | ''>('');
  protected readonly selectedStage = signal('');

  protected readonly statusTabs = [
    { label: 'Todos', value: '' as const },
    { label: 'Programados', value: 'SCHEDULED' as const },
    { label: 'En Vivo', value: 'LIVE' as const },
    { label: 'Finalizados', value: 'FINISHED' as const },
  ];

  protected readonly stages = computed(() => {
    const allStages = this.matches().map(m => m.stage);
    return [...new Set(allStages)];
  });

  protected readonly filteredMatches = computed(() => {
    let result = this.matches();
    const status = this.selectedStatus();
    const stage = this.selectedStage();

    if (status) {
      result = result.filter(m => m.status === status);
    }
    if (stage) {
      result = result.filter(m => m.stage === stage);
    }
    return result;
  });

  protected readonly groupedMatches = computed(() => {
    const filtered = this.filteredMatches();
    const groups = new Map<string, MatchResponse[]>();

    for (const match of filtered) {
      const date = match.kickoffAt.split('T')[0];
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(match);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, matches]) => ({ date, matches }));
  });

  async ngOnInit(): Promise<void> {
    await this.loadMatches();
    this.ws.connect();
    this.subscribeToLiveMatches();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
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

  private subscribeToLiveMatches(): void {
    const sub = this.ws.subscribe<MatchUpdateMessage>('/topic/matches').subscribe(update => {
      this.matches.update(matches =>
        matches.map(m => m.id === update.matchId
          ? { ...m, status: update.status, homeGoals: update.homeGoals, awayGoals: update.awayGoals, homePenalties: update.homePenalties, awayPenalties: update.awayPenalties, wentToPenalties: update.wentToPenalties }
          : m
        )
      );
    });
    this.subscriptions.push(sub);
  }

  onStageChange(event: Event): void {
    this.selectedStage.set((event.target as HTMLSelectElement).value);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
