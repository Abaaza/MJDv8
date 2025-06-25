export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          admin_notes: string | null
          approved_by: string | null
          company: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          message: string | null
          phone: string | null
          requested_role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          requested_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          requested_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_matching_jobs: {
        Row: {
          client_id: string | null
          confidence_score: number | null
          created_at: string
          error_message: string | null
          id: string
          input_file_blob_key: string | null
          input_file_blob_url: string | null
          matched_items: number | null
          original_file_path: string | null
          original_filename: string
          output_file_blob_key: string | null
          output_file_blob_url: string | null
          progress: number | null
          project_name: string
          results: Json | null
          status: string
          total_items: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_blob_key?: string | null
          input_file_blob_url?: string | null
          matched_items?: number | null
          original_file_path?: string | null
          original_filename: string
          output_file_blob_key?: string | null
          output_file_blob_url?: string | null
          progress?: number | null
          project_name: string
          results?: Json | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_blob_key?: string | null
          input_file_blob_url?: string | null
          matched_items?: number | null
          original_file_path?: string | null
          original_filename?: string
          output_file_blob_key?: string | null
          output_file_blob_url?: string | null
          progress?: number | null
          project_name?: string
          results?: Json | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_matching_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          cohere_api_key: string | null
          company_name: string | null
          currency: string
          id: number
          openai_api_key: string | null
          updated_at: string
        }
        Insert: {
          cohere_api_key?: string | null
          company_name?: string | null
          currency?: string
          id: number
          openai_api_key?: string | null
          updated_at?: string
        }
        Update: {
          cohere_api_key?: string | null
          company_name?: string | null
          currency?: string
          id?: number
          openai_api_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      match_results: {
        Row: {
          combined_score: number | null
          created_at: string
          id: string
          jaccard_score: number | null
          job_id: string
          match_mode: string
          matched_description: string | null
          matched_price_item_id: string | null
          matched_rate: number | null
          original_description: string
          preprocessed_description: string
          quantity: number | null
          row_number: number
          section_header: string | null
          sheet_name: string
          similarity_score: number | null
        }
        Insert: {
          combined_score?: number | null
          created_at?: string
          id?: string
          jaccard_score?: number | null
          job_id: string
          match_mode?: string
          matched_description?: string | null
          matched_price_item_id?: string | null
          matched_rate?: number | null
          original_description: string
          preprocessed_description: string
          quantity?: number | null
          row_number: number
          section_header?: string | null
          sheet_name: string
          similarity_score?: number | null
        }
        Update: {
          combined_score?: number | null
          created_at?: string
          id?: string
          jaccard_score?: number | null
          job_id?: string
          match_mode?: string
          matched_description?: string | null
          matched_price_item_id?: string | null
          matched_rate?: number | null
          original_description?: string
          preprocessed_description?: string
          quantity?: number | null
          row_number?: number
          section_header?: string | null
          sheet_name?: string
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ai_matching_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_matched_price_item_id_fkey"
            columns: ["matched_price_item_id"]
            isOneToOne: false
            referencedRelation: "price_items"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_jobs: {
        Row: {
          client_id: string | null
          created_at: string
          error_message: string | null
          id: string
          input_file_blob_key: string | null
          input_file_blob_url: string | null
          matched_items: number | null
          original_file_path: string | null
          original_filename: string | null
          output_file_blob_key: string | null
          output_file_blob_url: string | null
          output_file_path: string | null
          progress: number | null
          project_id: string | null
          project_name: string | null
          results: Json | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_blob_key?: string | null
          input_file_blob_url?: string | null
          matched_items?: number | null
          original_file_path?: string | null
          original_filename?: string | null
          output_file_blob_key?: string | null
          output_file_blob_url?: string | null
          output_file_path?: string | null
          progress?: number | null
          project_id?: string | null
          project_name?: string | null
          results?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_file_blob_key?: string | null
          input_file_blob_url?: string | null
          matched_items?: number | null
          original_file_path?: string | null
          original_filename?: string | null
          output_file_blob_key?: string | null
          output_file_blob_url?: string | null
          output_file_path?: string | null
          progress?: number | null
          project_id?: string | null
          project_name?: string | null
          results?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matching_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      price_items: {
        Row: {
          category: string | null
          code: string | null
          created_at: string
          description: string
          full_context: string | null
          id: string
          keyword_0: string | null
          keyword_1: string | null
          keyword_10: string | null
          keyword_11: string | null
          keyword_12: string | null
          keyword_13: string | null
          keyword_14: string | null
          keyword_15: string | null
          keyword_16: string | null
          keyword_17: string | null
          keyword_18: string | null
          keyword_19: string | null
          keyword_2: string | null
          keyword_20: string | null
          keyword_21: string | null
          keyword_22: string | null
          keyword_3: string | null
          keyword_4: string | null
          keyword_5: string | null
          keyword_6: string | null
          keyword_7: string | null
          keyword_8: string | null
          keyword_9: string | null
          phrase_0: string | null
          phrase_1: string | null
          phrase_10: string | null
          phrase_2: string | null
          phrase_3: string | null
          phrase_4: string | null
          phrase_5: string | null
          phrase_6: string | null
          phrase_7: string | null
          phrase_8: string | null
          phrase_9: string | null
          rate: number | null
          ref: string | null
          subcategory: string | null
          unit: string | null
          updated_at: string
          user_id: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string
          description: string
          full_context?: string | null
          id?: string
          keyword_0?: string | null
          keyword_1?: string | null
          keyword_10?: string | null
          keyword_11?: string | null
          keyword_12?: string | null
          keyword_13?: string | null
          keyword_14?: string | null
          keyword_15?: string | null
          keyword_16?: string | null
          keyword_17?: string | null
          keyword_18?: string | null
          keyword_19?: string | null
          keyword_2?: string | null
          keyword_20?: string | null
          keyword_21?: string | null
          keyword_22?: string | null
          keyword_3?: string | null
          keyword_4?: string | null
          keyword_5?: string | null
          keyword_6?: string | null
          keyword_7?: string | null
          keyword_8?: string | null
          keyword_9?: string | null
          phrase_0?: string | null
          phrase_1?: string | null
          phrase_10?: string | null
          phrase_2?: string | null
          phrase_3?: string | null
          phrase_4?: string | null
          phrase_5?: string | null
          phrase_6?: string | null
          phrase_7?: string | null
          phrase_8?: string | null
          phrase_9?: string | null
          rate?: number | null
          ref?: string | null
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string
          description?: string
          full_context?: string | null
          id?: string
          keyword_0?: string | null
          keyword_1?: string | null
          keyword_10?: string | null
          keyword_11?: string | null
          keyword_12?: string | null
          keyword_13?: string | null
          keyword_14?: string | null
          keyword_15?: string | null
          keyword_16?: string | null
          keyword_17?: string | null
          keyword_18?: string | null
          keyword_19?: string | null
          keyword_2?: string | null
          keyword_20?: string | null
          keyword_21?: string | null
          keyword_22?: string | null
          keyword_3?: string | null
          keyword_4?: string | null
          keyword_5?: string | null
          keyword_6?: string | null
          keyword_7?: string | null
          keyword_8?: string | null
          keyword_9?: string | null
          phrase_0?: string | null
          phrase_1?: string | null
          phrase_10?: string | null
          phrase_2?: string | null
          phrase_3?: string | null
          phrase_4?: string | null
          phrase_5?: string | null
          phrase_6?: string | null
          phrase_7?: string | null
          phrase_8?: string | null
          phrase_9?: string | null
          rate?: number | null
          ref?: string | null
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          email_notifications: boolean | null
          failed_login_attempts: number | null
          id: string
          last_login: string | null
          name: string | null
          push_notifications: boolean | null
          role: string
          status: string | null
          theme: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_locked_until?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean | null
          failed_login_attempts?: number | null
          id: string
          last_login?: string | null
          name?: string | null
          push_notifications?: boolean | null
          role?: string
          status?: string | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_locked_until?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean | null
          failed_login_attempts?: number | null
          id?: string
          last_login?: string | null
          name?: string | null
          push_notifications?: boolean | null
          role?: string
          status?: string | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_system_role: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_system_role?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      pending_users: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          message: string | null
          phone: string | null
          request_id: string | null
          requested_role: string | null
          user_id: string | null
          user_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_user_access: {
        Args: {
          p_request_id: string
          p_admin_notes?: string
          p_user_role?: string
        }
        Returns: boolean
      }
      create_initial_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      reject_user_access: {
        Args: { p_request_id: string; p_admin_notes?: string }
        Returns: boolean
      }
      verify_user: {
        Args:
          | { user_id_to_verify: string; new_role?: string }
          | { user_id_to_verify: string; new_role?: string; notes?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
