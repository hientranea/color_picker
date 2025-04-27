// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      colors: {
        Row: {
          id: string;
          hex_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hex_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hex_code?: string;
          created_at?: string;
        };
      };
      color_schemes: {
        Row: {
          id: string;
          code: string;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          cluster_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cluster_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cluster_id?: number;
          created_at?: string;
        };
      };
      color_scheme_colors: {
        Row: {
          color_scheme_id: string;
          color_id: string;
          position: number;
        };
        Insert: {
          color_scheme_id: string;
          color_id: string;
          position: number;
        };
        Update: {
          color_scheme_id?: string;
          color_id?: string;
          position?: number;
        };
      };
      color_scheme_categories: {
        Row: {
          color_scheme_id: string;
          category_id: string;
        };
        Insert: {
          color_scheme_id: string;
          category_id: string;
        };
        Update: {
          color_scheme_id?: string;
          category_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
