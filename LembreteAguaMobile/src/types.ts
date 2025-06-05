
export interface UserData {
  id: number;
  name: string;
  weight_kg: number;
  daily_goal_ml?: number;
  created_at?: string;
}

export interface DailyProgressData {
  user_name: string;
  user_id: number;
  date: string; // Formato YYYY-MM-DD
  daily_goal_ml: number;
  consumed_ml: number;
  remaining_ml: number;
  goal_achieved: boolean;
}

export type ScreenName = 'cadastro' | 'dashboard' | 'historico';
