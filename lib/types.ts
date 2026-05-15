export type Participant = {
  id: string;
  token: string;
  display_name: string;
  emoji: string;
  color: string;
  joined_at: string;
};

export type Spritz = {
  id: string;
  participant_id: string;
  consumed_at: string;
  location: string | null;
  note: string | null;
  deleted_at: string | null;
};

export type LeaderboardRow = {
  participant: Participant;
  count: number;
  rank: number;
};
