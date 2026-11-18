export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          slot_id: string;
          status: "booked" | "cancelled";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          slot_id: string;
          status?: "booked" | "cancelled";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          slot_id?: string;
          status?: "booked" | "cancelled";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "time_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          role: "player" | "coach" | "admin";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: "player" | "coach" | "admin";
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: "player" | "coach" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      time_slots: {
        Row: {
          coach_id: string;
          court_name: string | null;
          created_at: string;
          ends_at: string;
          id: string;
          is_active: boolean;
          location: string;
          skill_level: "beginner" | "intermediate" | "advanced" | "all_levels";
          starts_at: string;
          updated_at: string;
        };
        Insert: {
          coach_id: string;
          court_name?: string | null;
          created_at?: string;
          ends_at: string;
          id?: string;
          is_active?: boolean;
          location: string;
          skill_level?: "beginner" | "intermediate" | "advanced" | "all_levels";
          starts_at: string;
          updated_at?: string;
        };
        Update: {
          coach_id?: string;
          court_name?: string | null;
          created_at?: string;
          ends_at?: string;
          id?: string;
          is_active?: boolean;
          location?: string;
          skill_level?: "beginner" | "intermediate" | "advanced" | "all_levels";
          starts_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_slots_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      available_time_slots: {
        Row: {
          coach_id: string | null;
          coach_name: string | null;
          court_name: string | null;
          ends_at: string | null;
          id: string | null;
          location: string | null;
          skill_level: "beginner" | "intermediate" | "advanced" | "all_levels" | null;
          starts_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      book_time_slot: {
        Args: {
          target_slot_id: string;
          booking_notes?: string;
        };
        Returns: {
          cancelled_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          slot_id: string;
          status: "booked" | "cancelled";
          updated_at: string;
          user_id: string;
        }[];
      };
      cancel_booking: {
        Args: {
          target_booking_id: string;
        };
        Returns: {
          cancelled_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          slot_id: string;
          status: "booked" | "cancelled";
          updated_at: string;
          user_id: string;
        }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      slot_has_active_booking: {
        Args: {
          target_slot_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "player" | "coach" | "admin";
      booking_status: "booked" | "cancelled";
      skill_level: "beginner" | "intermediate" | "advanced" | "all_levels";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
