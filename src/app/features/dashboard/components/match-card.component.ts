import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchResponse } from '../../../core/models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/matches', match().id]"
       class="block bg-card dark:bg-card-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-accent-light/20">
      <!-- Status badge -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ match().stage }}</span>
        @switch (match().status) {
          @case ('SCHEDULED') {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              Programado
            </span>
          }
          @case ('LIVE') {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse">
              🔴 En Vivo
            </span>
          }
          @case ('FINISHED') {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              Finalizado
            </span>
          }
          @default {
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {{ match().status }}
            </span>
          }
        }
      </div>

      <!-- Teams and score -->
      <div class="flex items-center justify-between gap-2">
        <!-- Home team -->
        <div class="flex-1 flex items-center gap-2 min-w-0">
          <img [src]="match().homeTeamFlagUrl" [alt]="match().homeTeam" class="w-7 h-5 object-cover rounded-sm shadow-sm" />
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ match().homeTeam }}</span>
        </div>

        <!-- Score -->
        <div class="flex items-center gap-1 px-3">
          @if (match().homeGoals !== null && match().awayGoals !== null) {
            <span class="text-xl font-bold text-primary dark:text-white tabular-nums">{{ match().homeGoals }}</span>
            <span class="text-slate-400 mx-1">-</span>
            <span class="text-xl font-bold text-primary dark:text-white tabular-nums">{{ match().awayGoals }}</span>
          } @else {
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatTime(match().kickoffAt) }}</span>
          }
        </div>

        <!-- Away team -->
        <div class="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate text-right">{{ match().awayTeam }}</span>
          <img [src]="match().awayTeamFlagUrl" [alt]="match().awayTeam" class="w-7 h-5 object-cover rounded-sm shadow-sm" />
        </div>
      </div>

      <!-- Penalties if applicable -->
      @if (match().wentToPenalties && match().homePenalties !== null) {
        <div class="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Penales: {{ match().homePenalties }} - {{ match().awayPenalties }}
        </div>
      }
    </a>
  `,
})
export class MatchCardComponent {
  match = input.required<MatchResponse>();

  formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
}
