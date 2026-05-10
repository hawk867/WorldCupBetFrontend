export interface RankingEntryResponse {
  userId: number;
  fullName: string;
  totalPoints: number;
  exactCount: number;
  winnerCount: number;
  position: number;
}

export interface RankingUpdateMessage {
  entries: RankingEntryResponse[];
}
