// Types générés pour Supabase Database
// Ces types correspondent aux tables de votre base de données

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceType = 'cleaning' | 'laundry' | 'ironing' | 'business_cleaning';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'twint' | 'apple_pay' | 'google_pay';
export type UserRole = 'client' | 'provider' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          service_type: ServiceType;
          address: string;
          address_details: string | null;
          latitude: number | null;
          longitude: number | null;
          home_type: string;
          home_size: string | null;
          date: string;
          time: string;
          duration: number;
          tasks: string[];
          notes: string | null;
          status: BookingStatus;
          total_price: number;
          provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_type: ServiceType;
          address: string;
          address_details?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          home_type: string;
          home_size?: string | null;
          date: string;
          time: string;
          duration: number;
          tasks?: string[];
          notes?: string | null;
          status?: BookingStatus;
          total_price: number;
          provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          service_type?: ServiceType;
          address?: string;
          address_details?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          home_type?: string;
          home_size?: string | null;
          date?: string;
          time?: string;
          duration?: number;
          tasks?: string[];
          notes?: string | null;
          status?: BookingStatus;
          total_price?: number;
          provider_id?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount: number;
          currency: string;
          method: PaymentMethod;
          status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          method: PaymentMethod;
          status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          base_price: number;
          price_unit: string;
          image_url: string | null;
          emoji: string | null;
          is_available: boolean;
          features: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          base_price: number;
          price_unit?: string;
          image_url?: string | null;
          emoji?: string | null;
          is_available?: boolean;
          features?: string[];
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          base_price?: number;
          price_unit?: string;
          image_url?: string | null;
          emoji?: string | null;
          is_available?: boolean;
          features?: string[];
        };
      };
      cities: {
        Row: {
          id: string;
          name: string;
          canton: string;
          image_url: string | null;
          is_available: boolean;
          bookings_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          canton: string;
          image_url?: string | null;
          is_available?: boolean;
          bookings_count?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          canton?: string;
          image_url?: string | null;
          is_available?: boolean;
          bookings_count?: number;
        };
      };
      city_notifications: {
        Row: {
          id: string;
          user_id: string | null;
          city_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          city_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          provider_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          provider_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
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
      booking_status: BookingStatus;
      service_type: ServiceType;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      user_role: UserRole;
    };
  };
}

// Types helpers
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export type Service = Database['public']['Tables']['services']['Row'];
export type City = Database['public']['Tables']['cities']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
