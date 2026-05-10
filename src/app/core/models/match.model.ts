export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'ADJUSTED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';

export interface MatchResponse {
  id: number;
  stage: string;
  homeTeam: string;
  homeTeamCode: string;
  homeTeamFlagUrl: string;
  awayTeam: string;
  awayTeamCode: string;
  awayTeamFlagUrl: string;
  kickoffAt: string;
  status: MatchStatus;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  wentToPenalties: boolean;
}

export interface MatchDetailResponse {
  id: number;
  stage: { id: number; name: string; orderIdx: number };
  homeTeam: { id: number; name: string; code: string; flagUrl: string };
  awayTeam: { id: number; name: string; code: string; flagUrl: string };
  kickoffAt: string;
  status: MatchStatus;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  wentToPenalties: boolean;
  updatedAt: string;
}

export interface MatchUpdateMessage {
  matchId: number;
  status: MatchStatus;
  homeGoals: number;
  awayGoals: number;
  homePenalties: number | null;
  awayPenalties: number | null;
  wentToPenalties: boolean;
  updatedAt: string;
}
