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
      customers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          customer_id: string | null
          name: string
          email: string
          phone: string
          address: string
          project_type: string
          room_length: number
          room_width: number
          ceiling_height: number
          project_timeline: string
          project_budget: string
          services: Json
          contact_method: string
          preferred_times: string[]
          additional_notes: string | null
          lead_source: string
          utm_campaign: string | null
          utm_source: string | null
          utm_medium: string | null
          gclid: string | null
          lead_score: number
          status: string
          estimated_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          name: string
          email: string
          phone: string
          address: string
          project_type: string
          room_length: number
          room_width: number
          ceiling_height: number
          project_timeline: string
          project_budget: string
          services: Json
          contact_method: string
          preferred_times: string[]
          additional_notes?: string | null
          lead_source: string
          utm_campaign?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          gclid?: string | null
          lead_score?: number
          status?: string
          estimated_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          name?: string
          email?: string
          phone?: string
          address?: string
          project_type?: string
          room_length?: number
          room_width?: number
          ceiling_height?: number
          project_timeline?: string
          project_budget?: string
          services?: Json
          contact_method?: string
          preferred_times?: string[]
          additional_notes?: string | null
          lead_source?: string
          utm_campaign?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          gclid?: string | null
          lead_score?: number
          status?: string
          estimated_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          customer_id: string
          lead_id: string | null
          name: string
          description: string
          status: string
          estimated_value: number
          actual_cost: number | null
          start_date: string | null
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          lead_id?: string | null
          name: string
          description: string
          status?: string
          estimated_value: number
          actual_cost?: number | null
          start_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          lead_id?: string | null
          name?: string
          description?: string
          status?: string
          estimated_value?: number
          actual_cost?: number | null
          start_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      project_milestones: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string
          percentage: number
          amount: number
          status: string
          due_date: string | null
          completed_date: string | null
          invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description: string
          percentage: number
          amount: number
          status?: string
          due_date?: string | null
          completed_date?: string | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string
          percentage?: number
          amount?: number
          status?: string
          due_date?: string | null
          completed_date?: string | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          project_id: string
          milestone_id: string | null
          freshbooks_invoice_id: string | null
          amount: number
          status: string
          due_date: string
          paid_date: string | null
          payment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          milestone_id?: string | null
          freshbooks_invoice_id?: string | null
          amount: number
          status?: string
          due_date: string
          paid_date?: string | null
          payment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          milestone_id?: string | null
          freshbooks_invoice_id?: string | null
          amount?: number
          status?: string
          due_date?: string
          paid_date?: string | null
          payment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          }
        ]
      }
      conversion_events: {
        Row: {
          id: string
          lead_id: string | null
          customer_id: string | null
          event_type: string
          event_value: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          customer_id?: string | null
          event_type: string
          event_value?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          customer_id?: string | null
          event_type?: string
          event_value?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      communication_logs: {
        Row: {
          id: string
          lead_id: string | null
          customer_id: string | null
          type: string
          direction: string
          content: string
          metadata: Json | null
          sent_at: string
          delivered_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          lead_id?: string | null
          customer_id?: string | null
          type: string
          direction: string
          content: string
          metadata?: Json | null
          sent_at?: string
          delivered_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string | null
          customer_id?: string | null
          type?: string
          direction?: string
          content?: string
          metadata?: Json | null
          sent_at?: string
          delivered_at?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}