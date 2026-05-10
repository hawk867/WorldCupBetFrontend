import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { RankingEntryResponse, RankingUpdateMessage } from '../../core/models/ranking.model';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-primary dark:text-white mb-6">Ranking</h1>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <app-spinner size="lg" />
        </div>
      } @else {
        <!-- Podium for top 3 -->
        @if (topThree().length > 0) {
          <div class="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
            <!-- 2nd place -->
            @if (topThree().length > 1) {
              <div class="flex flex-col items-center justify-end">
                <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-4 text-center w-full border-t-4 border-slate-400">
                  <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center mx-auto mb-2">
                    <span class="text-lg font-bold text-slate-600 dark:text-slate-300">2</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ topThree()[1].fullName }}</p>
                  <p class="text-lg font-bold text-primary dark:text-white">{{ topThree()[1].totalPoints }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">pts</p>
                </div>
              </div>
            }

            <!-- 1st place -->
            @if (topThree().length > 0) {
              <div class="flex flex-col items-center justify-end">
                <div class="bg-card dark:bg-card-dark rounded-xl shadow-lg p-4 text-center w-full border-t-4 border-gold transform scale-105">
                  <div class="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2">
                    <span class="text-xl font-bold text-gold">👑</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ topThree()[0].fullName }}</p>
                  <p class="text-xl font-bold text-gold">{{ topThree()[0].totalPoints }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">pts</p>
                </div>
              </div>
            }

            <!-- 3rd place -->
            @if (topThree().length > 2) {
              <div class="flex flex-col items-center justify-end">
                <div class="bg-card dark:bg-card-dark rounded-xl shadow-md p-4 text-center w-full border-t-4 border-amber-700">
                  <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                    <span class="text-lg font-bold text-amber-700 dark:text-amber-400">3</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ topThree()[2].fullName }}</p>
                  <p class="text-lg font-bold text-primary dark:text-white">{{ topThree()[2].totalPoints }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">pts</p>
                </div>
              </div>
            }
          </div>
        }

        <!-- Table for remaining -->
        @if (remaining().length > 0) {
          <div class="bg-card dark:bg-card-dark rounded-xl shadow-md overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">#</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Puntos</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">Exactas</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">Ganador</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of remaining(); track entry.userId) {
                  <tr
                    class="border-b border-slate-100 dark:border-slate-700/50 transition-colors"
                    [class]="isCurrentUser(entry.userId) ? 'bg-accent/5 dark:bg-accent-light/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'"
                  >
                    <td class="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">{{ entry.position }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {{ entry.fullName }}
                      @if (isCurrentUser(entry.userId)) {
                        <span class="ml-1 text-xs text-accent dark:text-accent-light">(Tú)</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-sm font-bold text-right text-primary dark:text-white">{{ entry.totalPoints }}</td>
                    <td class="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400 hidden sm:table-cell">{{ entry.exactCount }}</td>
                    <td class="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400 hidden sm:table-cell">{{ entry.winnerCount }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (entries().length === 0) {
          <div class="text-center py-12 text-slate-500 dark:text-slate-400">
            <p class="text-lg">No hay datos de ranking disponibles</p>
          </div>
        }
      }
    </div>
  `,
})
export class RankingPage implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly ws = inject(WebSocketService);
  private readonly auth = inject(AuthService);
  private subscriptions: Subscription[] = [];

  protected readonly entries = signal<RankingEntryResponse[]>([]);
  protected readonly loading = signal(true);

  protected readonly topThree = computed(() => this.entries().slice(0, 3));
  protected readonly remaining = computed(() => this.entries().slice(3));

  async ngOnInit(): Promise<void> {
    await this.loadRanking();
    this.ws.connect();
    this.subscribeToRanking();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private async loadRanking(): Promise<void> {
    try {
      const entries = await this.api.get<RankingEntryResponse[]>('/ranking');
      this.entries.set(entries);
    } catch {
      // Error handled by interceptor
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeToRanking(): void {
    const sub = this.ws.subscribe<RankingUpdateMessage>('/topic/ranking').subscribe(update => {
      this.entries.set(update.entries);
    });
    this.subscriptions.push(sub);
  }

  isCurrentUser(userId: number): boolean {
    return this.auth.currentUser()?.userId === userId;
  }
}
