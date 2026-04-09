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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'players_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'rsvps_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rsvps_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'performance_metrics_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'performance_metrics_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'performance_metrics_recorded_by_fkey'
            columns: ['recorded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
