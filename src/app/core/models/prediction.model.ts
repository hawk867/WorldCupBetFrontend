export interface CreatePredictionRequest {
  matchId: number;
  homeGoals: number;
  awayGoals: number;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface UpdatePredictionRequest {
  homeGoals: number;
  awayGoals: number;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface PredictionResponse {
  id: number;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  homeGoals: number;
  awayGoals: number;
  homePenalties: number | null;
  awayPenalties: number | null;
  createdAt: string;
  updatedAt: string;
}
