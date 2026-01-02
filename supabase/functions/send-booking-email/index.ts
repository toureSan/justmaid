import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingEmailData {
  bookingId: string
  userEmail: string
  userName: string
  booking: {
    scheduled_date: string
    scheduled_time: string
    duration: number
    total_price: number
    address: string
    tasks: string[]
    service_type: string
  }
  type: 'confirmation' | 'reminder' | 'cancellation'
}

// Formater la date en français
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Labels des tâches
const taskLabels: Record<string, string> = {
  dusting: "Dépoussiérage",
  vacuuming: "Aspirateur",
  mopping: "Lavage sols",
  bathroom: "Salle de bain",
  kitchen: "Cuisine",
  windows: "Vitres",
  bedmaking: "Lits",
  fridge: "Réfrigérateur",
  oven: "Four",
  laundry: "Lessive",
  dishes: "Vaisselle",
  balcony: "Balcon",
}

// Template email de confirmation
function getConfirmationEmailHtml(data: BookingEmailData): string {
  const tasksHtml = data.booking.tasks
    .map(task => `<li style="padding: 4px 0;">${taskLabels[task] || task}</li>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 24px; width: 50px; height: 50px; line-height: 50px; border-radius: 12px;">J</div>
      <span style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-left: 10px;">justmaid</span>
    </div>
    
    <!-- Main Content -->
    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 20px;">
      ✅ Réservation confirmée !
    </h1>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Bonjour <strong>${data.userName}</strong>,<br><br>
      Merci pour votre réservation ! Voici les détails de votre intervention :
    </p>
    
    <!-- Booking Details Card -->
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 30px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">📅 Date</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${formatDate(data.booking.scheduled_date)}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">🕐 Heure</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${data.booking.scheduled_time}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">⏱️ Durée</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${data.booking.duration} heures</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">📍 Adresse</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${data.booking.address}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <span style="color: #666;">💰 Total</span>
          </td>
          <td style="padding: 12px 0; text-align: right;">
            <strong style="color: #2FCCC0; font-size: 20px;">${data.booking.total_price} CHF</strong>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Tasks -->
    <div style="margin: 30px 0;">
      <h3 style="color: #1a1a1a; margin-bottom: 15px;">🧹 Prestations incluses</h3>
      <ul style="list-style: none; padding: 0; margin: 0; color: #666;">
        ${tasksHtml}
      </ul>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://justmaid-production.up.railway.app/dashboard" 
         style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Voir ma réservation
      </a>
    </div>
    
    <!-- Footer -->
    <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; margin-top: 40px; text-align: center; color: #999; font-size: 14px;">
      <p>Des questions ? Contactez-nous à <a href="mailto:contact@justmaid.ch" style="color: #2563eb;">contact@justmaid.ch</a></p>
      <p style="margin-top: 20px;">
        © ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse
      </p>
    </div>
  </div>
</body>
</html>
`
}

// Template email de rappel
function getReminderEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 24px; width: 50px; height: 50px; line-height: 50px; border-radius: 12px;">J</div>
      <span style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-left: 10px;">justmaid</span>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 20px;">
      ⏰ Rappel : Votre ménage c'est demain !
    </h1>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Bonjour <strong>${data.userName}</strong>,<br><br>
      Votre intervention est prévue demain. N'oubliez pas de préparer l'accès à votre domicile.
    </p>
    
    <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>📅 ${formatDate(data.booking.scheduled_date)}</strong> à <strong>${data.booking.scheduled_time}</strong>
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://justmaid-production.up.railway.app/dashboard" 
         style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Voir les détails
      </a>
    </div>
    
    <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; margin-top: 40px; text-align: center; color: #999; font-size: 14px;">
      <p>© ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse</p>
    </div>
  </div>
</body>
</html>
`
}

// Template email d'annulation
function getCancellationEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 24px; width: 50px; height: 50px; line-height: 50px; border-radius: 12px;">J</div>
      <span style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin-left: 10px;">justmaid</span>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 20px;">
      ❌ Réservation annulée
    </h1>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Bonjour <strong>${data.userName}</strong>,<br><br>
      Votre réservation du <strong>${formatDate(data.booking.scheduled_date)}</strong> à <strong>${data.booking.scheduled_time}</strong> a été annulée.
    </p>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Si vous avez effectué un prépaiement, celui-ci sera automatiquement remboursé sous 5-10 jours ouvrés.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://justmaid-production.up.railway.app/booking/cleaning" 
         style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Réserver à nouveau
      </a>
    </div>
    
    <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; margin-top: 40px; text-align: center; color: #999; font-size: 14px;">
      <p>© ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse</p>
    </div>
  </div>
</body>
</html>
`
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const data: BookingEmailData = await req.json()
    const { userEmail, userName, booking, type = 'confirmation' } = data

    // Select email template based on type
    let subject: string
    let html: string

    switch (type) {
      case 'reminder':
        subject = '⏰ Rappel : Votre ménage c\'est demain ! - justmaid'
        html = getReminderEmailHtml(data)
        break
      case 'cancellation':
        subject = '❌ Réservation annulée - justmaid'
        html = getCancellationEmailHtml(data)
        break
      case 'confirmation':
      default:
        subject = '✅ Confirmation de votre réservation - justmaid'
        html = getConfirmationEmailHtml(data)
        break
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'justmaid <onboarding@resend.dev>',
        to: userEmail,
        subject,
        html,
      }),
    })

    const resendResponse = await res.json()

    if (!res.ok) {
      console.error('Resend error:', resendResponse)
      throw new Error(resendResponse.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', resendResponse)

    return new Response(
      JSON.stringify({ success: true, messageId: resendResponse.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
