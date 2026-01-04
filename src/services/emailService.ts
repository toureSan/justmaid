import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// =====================================================
// TYPES
// =====================================================

export type EmailType = 'confirmation' | 'reminder' | 'cancellation';

export interface ExtraService {
  id: string;
  name: string;
  price: number;
  duration?: number;
  quantity?: number;
}

export type FrequencyType = "once" | "weekly" | "biweekly" | "monthly" | "custom";

export interface BookingEmailData {
  bookingId: string;
  userEmail: string;
  userName: string;
  booking: {
    scheduled_date: string;
    scheduled_time: string;
    duration: number;
    total_price: number;
    address: string;
    tasks: string[];
    service_type: string;
    extras?: ExtraService[];
    hasPets?: boolean;
    notes?: string;
    frequency?: FrequencyType;
  };
  type: EmailType;
}

// =====================================================
// ENVOYER UN EMAIL DE RÉSERVATION
// =====================================================

export async function sendBookingEmail(
  data: BookingEmailData
): Promise<{ success: boolean; error: string | null }> {
  // En mode démo, on simule l'envoi
  if (!isSupabaseConfigured()) {
    console.log('[Demo Mode] Email would be sent:', data);
    return { success: true, error: null };
  }

  try {
    const { data: responseData, error } = await supabase.functions.invoke(
      'send-booking-email',
      {
        body: data,
      }
    );

    if (error) {
      console.error('Error calling send-booking-email function:', error);
      return { success: false, error: error.message };
    }

    if (!responseData?.success) {
      console.error('Email sending failed:', responseData?.error);
      return { success: false, error: responseData?.error || 'Unknown error' };
    }

    console.log('Email sent successfully:', responseData);
    return { success: true, error: null };
  } catch (err) {
    console.error('Error sending booking email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

// =====================================================
// ENVOYER UN EMAIL DE CONFIRMATION
// =====================================================

export async function sendConfirmationEmail(
  userEmail: string,
  userName: string,
  booking: BookingEmailData['booking'],
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  return sendBookingEmail({
    bookingId,
    userEmail,
    userName,
    booking,
    type: 'confirmation',
  });
}

// =====================================================
// ENVOYER UN EMAIL DE RAPPEL
// =====================================================

export async function sendReminderEmail(
  userEmail: string,
  userName: string,
  booking: BookingEmailData['booking'],
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  return sendBookingEmail({
    bookingId,
    userEmail,
    userName,
    booking,
    type: 'reminder',
  });
}

// =====================================================
// ENVOYER UN EMAIL D'ANNULATION
// =====================================================

export async function sendCancellationEmail(
  userEmail: string,
  userName: string,
  booking: BookingEmailData['booking'],
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  return sendBookingEmail({
    bookingId,
    userEmail,
    userName,
    booking,
    type: 'cancellation',
  });
}

// Export all functions
export const emailService = {
  sendBookingEmail,
  sendConfirmationEmail,
  sendReminderEmail,
  sendCancellationEmail,
};
