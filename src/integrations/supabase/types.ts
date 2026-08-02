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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_code_card: {
        Row: {
          created_at: string
          display_order: number
          id: string
          property_name: string
          property_value: string
          updated_at: string
          value_type: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          property_name: string
          property_value?: string
          updated_at?: string
          value_type?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          property_name?: string
          property_value?: string
          updated_at?: string
          value_type?: string
          visible?: boolean
        }
        Relationships: []
      }
      about_section: {
        Row: {
          code_available: boolean
          code_coffee: string
          code_file_name: string
          code_name: string
          code_role: string
          code_skills: string[]
          description: string
          eyebrow: string
          heading: string
          heading_accent: string
          id: number
          stats: Json
          tags: string[]
          updated_at: string
        }
        Insert: {
          code_available?: boolean
          code_coffee?: string
          code_file_name?: string
          code_name?: string
          code_role?: string
          code_skills?: string[]
          description?: string
          eyebrow?: string
          heading?: string
          heading_accent?: string
          id?: number
          stats?: Json
          tags?: string[]
          updated_at?: string
        }
        Update: {
          code_available?: boolean
          code_coffee?: string
          code_file_name?: string
          code_name?: string
          code_role?: string
          code_skills?: string[]
          description?: string
          eyebrow?: string
          heading?: string
          heading_accent?: string
          id?: number
          stats?: Json
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          date: string
          display_order: number
          gradient: string | null
          id: string
          issuer: string
          link: string | null
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          date?: string
          display_order?: number
          gradient?: string | null
          id?: string
          issuer?: string
          link?: string | null
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          date?: string
          display_order?: number
          gradient?: string | null
          id?: string
          issuer?: string
          link?: string | null
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
          subject?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          courses: string[]
          created_at: string
          degree: string
          description: string | null
          display_order: number
          gpa: string | null
          id: string
          institution: string
          period: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          courses?: string[]
          created_at?: string
          degree: string
          description?: string | null
          display_order?: number
          gpa?: string | null
          id?: string
          institution: string
          period?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          courses?: string[]
          created_at?: string
          degree?: string
          description?: string | null
          display_order?: number
          gpa?: string | null
          id?: string
          institution?: string
          period?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      experience: {
        Row: {
          bullets: string[]
          company: string
          created_at: string
          display_order: number
          id: string
          is_current: boolean
          period: string
          role: string
          type: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          bullets?: string[]
          company: string
          created_at?: string
          display_order?: number
          id?: string
          is_current?: boolean
          period?: string
          role: string
          type?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          bullets?: string[]
          company?: string
          created_at?: string
          display_order?: number
          id?: string
          is_current?: boolean
          period?: string
          role?: string
          type?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          challenges: string | null
          created_at: string
          demo_url: string | null
          description: string
          display_order: number
          duration: string | null
          featured: boolean
          features: string[]
          full_description: string | null
          gallery: string[]
          github_url: string | null
          gradient: string | null
          id: string
          image_url: string | null
          published: boolean
          results: string | null
          role: string | null
          solutions: string | null
          tech_stack: string[]
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          category: string
          challenges?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          display_order?: number
          duration?: string | null
          featured?: boolean
          features?: string[]
          full_description?: string | null
          gallery?: string[]
          github_url?: string | null
          gradient?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          results?: string | null
          role?: string | null
          solutions?: string | null
          tech_stack?: string[]
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          category?: string
          challenges?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          display_order?: number
          duration?: string | null
          featured?: boolean
          features?: string[]
          full_description?: string | null
          gallery?: string[]
          github_url?: string | null
          gradient?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          results?: string | null
          role?: string | null
          solutions?: string | null
          tech_stack?: string[]
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      site_profile: {
        Row: {
          availability_status: string
          avatar_url: string | null
          bio: string
          email: string
          github_handle: string | null
          github_url: string | null
          id: number
          initials: string
          interests: string[]
          linkedin_handle: string | null
          linkedin_url: string | null
          location: string
          name: string
          phone: string | null
          resume_url: string | null
          roles: string[]
          stats: Json
          title: string
          updated_at: string
        }
        Insert: {
          availability_status?: string
          avatar_url?: string | null
          bio?: string
          email?: string
          github_handle?: string | null
          github_url?: string | null
          id?: number
          initials?: string
          interests?: string[]
          linkedin_handle?: string | null
          linkedin_url?: string | null
          location?: string
          name?: string
          phone?: string | null
          resume_url?: string | null
          roles?: string[]
          stats?: Json
          title?: string
          updated_at?: string
        }
        Update: {
          availability_status?: string
          avatar_url?: string | null
          bio?: string
          email?: string
          github_handle?: string | null
          github_url?: string | null
          id?: number
          initials?: string
          interests?: string[]
          linkedin_handle?: string | null
          linkedin_url?: string | null
          location?: string
          name?: string
          phone?: string | null
          resume_url?: string | null
          roles?: string[]
          stats?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      skills: {
        Row: {
          badge: string
          category: string
          color: string
          created_at: string
          display_order: number
          icon_slug: string
          id: string
          name: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          badge?: string
          category: string
          color?: string
          created_at?: string
          display_order?: number
          icon_slug?: string
          id?: string
          name: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          badge?: string
          category?: string
          color?: string
          created_at?: string
          display_order?: number
          icon_slug?: string
          id?: string
          name?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
