export type Profile = {
  id: string;
  full_name: string;
  cedula: string;
  whatsapp: string;
  email: string | null;
  favorite_team: string | null;
  validation_code: string;
  is_validated: boolean;
  is_admin: boolean;
  total_points: number;
  exact_predictions: number;
  created_at: string;
  validated_at: string | null;
};

export type Team = {
  id: number;
  code: string;
  name: string;
  flag_emoji: string | null;
  group_letter: string | null;
};

export type Match = {
  id: number;
  match_number: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  stage: 'group' | 'round_16' | 'quarter' | 'semi' | 'third_place' | 'final';
  group_letter: string | null;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'live' | 'finished';
  predictions_close_at: string;
  created_at: string;
  updated_at: string;
};

export type MatchWithTeams = Match & {
  home_team: Team;
  away_team: Team;
};

export type Prediction = {
  id: number;
  user_id: string;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  is_calculated: boolean;
  created_at: string;
  updated_at: string;
};

export type ValidationCode = {
  id: number;
  code: string;
  generated_by_admin: string | null;
  used_by_user: string | null;
  is_used: boolean;
  notes: string | null;
  created_at: string;
  used_at: string | null;
};

export type LeaderboardEntry = {
  id: string;
  full_name: string;
  total_points: number;
  exact_predictions: number;
  rank: number;
};
