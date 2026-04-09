export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'coach' | 'player' | 'assistant_coach'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'coach' | 'player' | 'assistant_coach'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'coach' | 'player' | 'assistant_coach'
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          position: string | null
          skill_level: number | null
          disability_status: string | null
          strengths: string[] | null
          weaknesses: string[] | null
          is_assistant_coach_candidate: boolean
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          position?: string | null
          skill_level?: number | null
          disability_status?: string | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          is_assistant_coach_candidate?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          position?: string | null
          skill_level?: number | null
          disability_status?: string | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          is_assistant_coach_candidate?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          venue: string
          type: 'training' | 'friendly' | 'competitive' | 'social'
          max_players: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          venue: string
          type: 'training' | 'friendly' | 'competitive' | 'social'
          max_players?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          venue?: string
          type?: 'training' | 'friendly' | 'competitive' | 'social'
          max_players?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          event_id: string
          player_id: string
          status: 'yes' | 'no' | 'maybe'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          player_id: string
          status: 'yes' | 'no' | 'maybe'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          player_id?: string
          status?: 'yes' | 'no' | 'maybe'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_metrics: {
        Row: {
          id: string
          player_id: string
          event_id: string | null
          recorded_by: string | null
          passing_accuracy: number | null
          tackling_success: number | null
          endurance: number | null
          leadership_score: number | null
          notes: string | null
          match_rating: number | null
          minutes_played: number | null
          distance_ran_km: number | null
          passes_completed: number | null
          goals: number | null
          assists: number | null
          chances_created: number | null
          diving: number | null
          positioning: number | null
          penalties: number | null
          long_pass: number | null
          short_pass: number | null
          leadership: number | null
          dribbling: number | null
          heading: number | null
          interception: number | null
          progressive_pass: number | null
          safe_pass: number | null
          shooting: number | null
          defensive_actions: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          player_id: string
          event_id?: string | null
          recorded_by?: string | null
          passing_accuracy?: number | null
          tackling_success?: number | null
          endurance?: number | null
          leadership_score?: number | null
          notes?: string | null
          match_rating?: number | null
          minutes_played?: number | null
          distance_ran_km?: number | null
          passes_completed?: number | null
          goals?: number | null
          assists?: number | null
          chances_created?: number | null
          diving?: number | null
          positioning?: number | null
          penalties?: number | null
          long_pass?: number | null
          short_pass?: number | null
          leadership?: number | null
          dribbling?: number | null
          heading?: number | null
          interception?: number | null
          progressive_pass?: number | null
          safe_pass?: number | null
          shooting?: number | null
          defensive_actions?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          event_id?: string | null
          recorded_by?: string | null
          passing_accuracy?: number | null
          tackling_success?: number | null
          endurance?: number | null
          leadership_score?: number | null
          notes?: string | null
          match_rating?: number | null
          minutes_played?: number | null
          distance_ran_km?: number | null
          passes_completed?: number | null
          goals?: number | null
          assists?: number | null
          chances_created?: number | null
          diving?: number | null
          positioning?: number | null
          penalties?: number | null
          long_pass?: number | null
          short_pass?: number | null
          leadership?: number | null
          dribbling?: number | null
          heading?: number | null
          interception?: number | null
          progressive_pass?: number | null
          safe_pass?: number | null
          shooting?: number | null
          defensive_actions?: number | null
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'coach' | 'player' | 'assistant_coach'
      event_type: 'training' | 'friendly' | 'competitive' | 'social'
      rsvp_status: 'yes' | 'no' | 'maybe'
    }
  }
}
