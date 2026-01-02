import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Template email de rappel
function getReminderEmailHtml(userName: string, booking: any): string {
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
      ⏰ Rappel : Votre ménage c'est demain !
    </h1>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Bonjour <strong>${userName}</strong>,<br><br>
      Votre intervention est prévue demain. N'oubliez pas de préparer l'accès à votre domicile.
    </p>
    
    <!-- Alert Box -->
    <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404; font-size: 18px;">
        <strong>📅 ${formatDate(booking.date)}</strong><br>
        <strong>🕐 ${booking.time}</strong>
      </p>
    </div>
    
    <!-- Booking Details -->
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 30px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">📍 Adresse</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${booking.address}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
            <span style="color: #666;">⏱️ Durée</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="color: #1a1a1a;">${booking.duration} heures</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <span style="color: #666;">💰 Total</span>
          </td>
          <td style="padding: 12px 0; text-align: right;">
            <strong style="color: #2FCCC0; font-size: 20px;">${booking.total_price || booking.duration * 25} CHF</strong>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Tips -->
    <div style="margin: 30px 0;">
      <h3 style="color: #1a1a1a; margin-bottom: 15px;">💡 Conseils pour demain</h3>
      <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
        <li>Assurez-vous que l'accès au logement est possible</li>
        <li>Rangez les objets de valeur</li>
        <li>Préparez les produits si vous en fournissez</li>
      </ul>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://justmaid-production.up.railway.app/dashboard" 
         style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Voir ma réservation
      </a>
    </div>
    
    <!-- Cancel info -->
    <p style="color: #999; font-size: 14px; text-align: center;">
      Besoin d'annuler ? Vous pouvez le faire gratuitement jusqu'à 24h avant.
    </p>
    
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
      throw new Error('Supabase credentials are not configured')
    }

    // Créer le client Supabase avec la clé service
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Calculer la date de demain
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    console.log(`Checking for bookings on ${tomorrowStr}...`)

    // Récupérer les réservations de demain
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        date,
        time,
        duration,
        address,
        total_price,
        status
      `)
      .eq('date', tomorrowStr)
      .in('status', ['pending', 'confirmed'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for tomorrow')
      return new Response(
        JSON.stringify({ success: true, message: 'No bookings for tomorrow', emailsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${bookings.length} bookings for tomorrow`)

    let emailsSent = 0
    const errors: string[] = []

    // Pour chaque réservation, récupérer l'utilisateur et envoyer l'email
    for (const booking of bookings) {
      try {
        // Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', booking.user_id)
          .single()

        if (profileError || !profile) {
          console.error(`Error fetching profile for user ${booking.user_id}:`, profileError)
          
          // Essayer de récupérer l'email depuis auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(booking.user_id)
          
          if (authError || !authUser?.user?.email) {
            console.error(`Cannot find email for user ${booking.user_id}`)
            errors.push(`Booking ${booking.id}: Cannot find user email`)
            continue
          }

          // Utiliser l'email de auth
          const userName = authUser.user.user_metadata?.full_name || 
                          authUser.user.user_metadata?.name || 
                          authUser.user.email?.split('@')[0] || 
                          'Client'

          const emailHtml = getReminderEmailHtml(userName, booking)

          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'justmaid <onboarding@resend.dev>',
              to: authUser.user.email,
              subject: '⏰ Rappel : Votre ménage c\'est demain ! - justmaid',
              html: emailHtml,
            }),
          })

          if (res.ok) {
            emailsSent++
            console.log(`Reminder sent to ${authUser.user.email} for booking ${booking.id}`)
          } else {
            const errorData = await res.json()
            console.error(`Failed to send email:`, errorData)
            errors.push(`Booking ${booking.id}: ${errorData.message}`)
          }
        } else {
          // Utiliser le profil
          const userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 
                          profile.email?.split('@')[0] || 
                          'Client'

          const emailHtml = getReminderEmailHtml(userName, booking)

          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'justmaid <onboarding@resend.dev>',
              to: profile.email,
              subject: '⏰ Rappel : Votre ménage c\'est demain ! - justmaid',
              html: emailHtml,
            }),
          })

          if (res.ok) {
            emailsSent++
            console.log(`Reminder sent to ${profile.email} for booking ${booking.id}`)
          } else {
            const errorData = await res.json()
            console.error(`Failed to send email:`, errorData)
            errors.push(`Booking ${booking.id}: ${errorData.message}`)
          }
        }
      } catch (err) {
        console.error(`Error processing booking ${booking.id}:`, err)
        errors.push(`Booking ${booking.id}: ${err.message}`)
      }
    }

    console.log(`Finished: ${emailsSent} emails sent, ${errors.length} errors`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        totalBookings: bookings.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-reminder-emails:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
