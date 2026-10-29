export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      whatsapp_account_events: {
        Row: {
          detail: Json | null
          event: string
          id: number
          received_at: string
        }
        Insert: {
          detail?: Json | null
          event: string
          id?: never
          received_at?: string
        }
        Update: {
          detail?: Json | null
          event?: string
          id?: never
          received_at?: string
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          action: string | null
          full_name: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          full_name?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          full_name?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          caption: string | null
          direction: string
          from_number: string | null
          id: string
          media_filename: string | null
          media_id: string | null
          media_mime: string | null
          message_type: string | null
          raw: Json | null
          received_at: string
          replied_at: string | null
          reply_attempted_at: string | null
          reply_attempts: number
          reply_error: string | null
          reply_message_id: string | null
          reply_status: string
          text_body: string | null
          to_number: string | null
        }
        Insert: {
          caption?: string | null
          direction?: string
          from_number?: string | null
          id: string
          media_filename?: string | null
          media_id?: string | null
          media_mime?: string | null
          message_type?: string | null
          raw?: Json | null
          received_at?: string
          replied_at?: string | null
          reply_attempted_at?: string | null
          reply_attempts?: number
          reply_error?: string | null
          reply_message_id?: string | null
          reply_status?: string
          text_body?: string | null
          to_number?: string | null
        }
        Update: {
          caption?: string | null
          direction?: string
          from_number?: string | null
          id?: string
          media_filename?: string | null
          media_id?: string | null
          media_mime?: string | null
          message_type?: string | null
          raw?: Json | null
          received_at?: string
          replied_at?: string | null
          reply_attempted_at?: string | null
          reply_attempts?: number
          reply_error?: string | null
          reply_message_id?: string | null
          reply_status?: string
          text_body?: string | null
          to_number?: string | null
        }
        Relationships: []
      }
      whatsapp_outbound_messages: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          id: number
          provider_message_id: string | null
          read_at: string | null
          sent_at: string | null
          status: string
          status_at: string | null
          template_name: string | null
          text_body: string | null
          to_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: never
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          status_at?: string | null
          template_name?: string | null
          text_body?: string | null
          to_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: never
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          status_at?: string | null
          template_name?: string | null
          text_body?: string | null
          to_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_pending_statuses: {
        Row: {
          applied_at: string | null
          attempts: number
          errors: Json | null
          message_id: string
          next_retry_at: string
          provider_timestamp: string | null
          received_at: string
          recipient_id: string | null
          status: string
        }
        Insert: {
          applied_at?: string | null
          attempts?: number
          errors?: Json | null
          message_id: string
          next_retry_at?: string
          provider_timestamp?: string | null
          received_at?: string
          recipient_id?: string | null
          status: string
        }
        Update: {
          applied_at?: string | null
          attempts?: number
          errors?: Json | null
          message_id?: string
          next_retry_at?: string
          provider_timestamp?: string | null
          received_at?: string
          recipient_id?: string | null
          status?: string
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          attempts: number
          delivery_id: string
          event: string
          id: number
          next_retry_at: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          attempts?: number
          delivery_id: string
          event: string
          id?: never
          next_retry_at?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          attempts?: number
          delivery_id?: string
          event?: string
          id?: never
          next_retry_at?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
