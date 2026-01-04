import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtraService {
  id: string
  name: string
  price: number
  duration?: number
  quantity?: number
}

type FrequencyType = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'custom'

const frequencyLabels: Record<FrequencyType, string> = {
  once: 'Ponctuel',
  weekly: 'Hebdomadaire',
  biweekly: 'Toutes les 2 semaines',
  monthly: 'Toutes les 4 semaines',
  custom: 'Personnalisé',
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
    extras?: ExtraService[]
    hasPets?: boolean
    notes?: string
    frequency?: FrequencyType
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

// Labels des extras
const extraLabels: Record<string, { name: string, icon: string }> = {
  windows: { name: "Nettoyage des fenêtres", icon: "🪟" },
  ironing: { name: "Repassage", icon: "👔" },
  laundry: { name: "Lessive & séchage", icon: "🧺" },
  oven: { name: "Intérieur du four", icon: "🔥" },
  kitchenCabinets: { name: "Placards de cuisine", icon: "🗄️" },
  fridge: { name: "Intérieur du frigidaire", icon: "❄️" },
}

// Template email de confirmation
function getConfirmationEmailHtml(data: BookingEmailData): string {
  const serviceTypeLabel = data.booking.service_type === 'cleaning' ? 'Ménage à domicile' : 'Service de nettoyage'
  
  // Calculer l'heure de fin
  const [startHour, startMin] = data.booking.scheduled_time.split(':').map(Number)
  const endHour = startHour + data.booking.duration
  const endTime = `${endHour.toString().padStart(2, '0')}:${(startMin || 0).toString().padStart(2, '0')}`

  // Générer la liste des extras
  const extras = data.booking.extras || []
  const extrasHtml = extras.length > 0 ? extras.map(extra => {
    const label = extraLabels[extra.id] || { name: extra.name, icon: '✨' }
    let details = ''
    if (extra.id === 'windows' && extra.quantity) {
      details = ` (${extra.quantity} fenêtre${extra.quantity > 1 ? 's' : ''})`
    } else if (extra.id === 'ironing' && extra.duration) {
      details = ` (${extra.duration}h)`
    }
    return `<li style="padding: 6px 0;">${label.icon} ${label.name}${details} <span style="color: #2FCCC0; font-weight: 600;">+${extra.price} CHF</span></li>`
  }).join('') : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <!-- Header avec gradient -->
    <div style="background: linear-gradient(135deg, #2FCCC0 0%, #1fb8ad 100%); padding: 40px 40px 30px; text-align: center;">
      <div style="display: inline-block; background: white; color: #2FCCC0; font-weight: bold; font-size: 28px; width: 60px; height: 60px; line-height: 60px; border-radius: 16px; margin-bottom: 15px;">J</div>
      <h1 style="color: white; font-size: 24px; margin: 10px 0 5px;">justmaid</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Service de ménage professionnel en Suisse 🇨🇭</p>
    </div>
    
    <!-- Success Banner -->
    <div style="background: #d4edda; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
      <span style="font-size: 32px;">✅</span>
      <h2 style="color: #155724; font-size: 22px; margin: 10px 0 5px;">Réservation confirmée !</h2>
      <p style="color: #155724; font-size: 14px; margin: 0;">Votre demande a bien été enregistrée</p>
    </div>
    
    <div style="padding: 40px;">
      <!-- Salutation -->
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Bonjour <strong>${data.userName}</strong>,<br><br>
        Merci d'avoir choisi <strong style="color: #2FCCC0;">justmaid</strong> ! 
        Nous avons bien reçu votre demande de ménage. Voici le récapitulatif de votre intervention :
      </p>
      
      <!-- Service Type Card -->
      <div style="background: linear-gradient(135deg, #2FCCC0 0%, #1fb8ad 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <span style="font-size: 40px;">🧹</span>
        <h3 style="color: white; font-size: 20px; margin: 10px 0 5px;">${serviceTypeLabel}</h3>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">${data.booking.duration} heures de prestation</p>
      </div>
      
      ${data.booking.frequency && data.booking.frequency !== 'once' ? `
      <!-- Abonnement Card -->
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <span style="font-size: 32px;">🔄</span>
        <h3 style="color: white; font-size: 18px; margin: 10px 0 5px;">Abonnement ${frequencyLabels[data.booking.frequency]}</h3>
        <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0;">
          Même intervenant(e) à chaque passage • Tarif préférentiel
        </p>
      </div>
      ` : ''}
      
      <!-- Booking Details Card -->
      <div style="background: #f8f9fa; border-radius: 16px; padding: 25px; margin-bottom: 25px; border: 1px solid #e9ecef;">
        <h3 style="color: #333; font-size: 16px; margin: 0 0 20px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
          📋 Détails de l'intervention
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; vertical-align: top;">
              <span style="color: #666; font-size: 14px;">📅 Date</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right; vertical-align: top;">
              <strong style="color: #1a1a1a; font-size: 15px;">${formatDate(data.booking.scheduled_date)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; vertical-align: top;">
              <span style="color: #666; font-size: 14px;">🕐 Horaire</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right; vertical-align: top;">
              <strong style="color: #1a1a1a; font-size: 15px;">${data.booking.scheduled_time} → ${endTime}</strong>
              <br><span style="color: #666; font-size: 12px;">(${data.booking.duration}h de prestation)</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; vertical-align: top;">
              <span style="color: #666; font-size: 14px;">📍 Lieu</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right; vertical-align: top;">
              <strong style="color: #1a1a1a; font-size: 15px;">${data.booking.address}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0; vertical-align: top;">
              <span style="color: #666; font-size: 14px;">💳 Montant</span>
            </td>
            <td style="padding: 15px 0; text-align: right; vertical-align: top;">
              <strong style="color: #2FCCC0; font-size: 24px;">${data.booking.total_price} CHF</strong>
              <br><span style="color: #666; font-size: 12px;">Paiement après l'intervention</span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- What's included -->
      <div style="background: #fff8e1; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; font-size: 14px; margin: 0 0 10px;">
          🧹 Prestations de base incluses :
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
          <li>Nettoyage complet des pièces</li>
          <li>Aspirateur et lavage des sols</li>
          <li>Nettoyage cuisine et salle de bain</li>
          <li>Dépoussiérage des surfaces</li>
          <li>Rangement et finitions</li>
        </ul>
      </div>
      
      ${extras.length > 0 ? `
      <!-- Extras -->
      <div style="background: #e8f5e9; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 14px; margin: 0 0 10px;">
          ✨ Services supplémentaires commandés :
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #2e7d32; font-size: 14px; line-height: 1.8; list-style: none;">
          ${extrasHtml}
        </ul>
      </div>
      ` : ''}
      
      ${data.booking.hasPets ? `
      <!-- Pets info -->
      <div style="background: #fce4ec; border-radius: 16px; padding: 15px 20px; margin-bottom: 25px; border-left: 4px solid #e91e63;">
        <p style="color: #880e4f; font-size: 14px; margin: 0;">
          🐾 <strong>Note :</strong> Vous avez indiqué avoir des animaux de compagnie. Notre intervenant(e) en sera informé(e).
        </p>
      </div>
      ` : ''}
      
      <!-- Reminder Box -->
      <div style="background: #e3f2fd; border-radius: 16px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #2196f3;">
        <h3 style="color: #1565c0; font-size: 14px; margin: 0 0 10px;">
          💡 Rappel important
        </h3>
        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.6;">
          Assurez-vous d'avoir le matériel de ménage nécessaire (aspirateur, serpillère, produits de nettoyage) 
          et de préparer l'accès à votre domicile pour l'intervenant(e).
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.justmaid.ch/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
          📱 Voir ma réservation
        </a>
      </div>
      
      <!-- Contact Info -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0 0 10px;">
          <strong>Une question ?</strong> Notre équipe est là pour vous aider !
        </p>
        <p style="margin: 0;">
          <a href="mailto:contact@justmaid.ch" style="color: #2563eb; text-decoration: none; font-weight: 500;">📧 contact@justmaid.ch</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 18px; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; margin-bottom: 15px;">J</div>
      <p style="color: white; font-size: 14px; margin: 10px 0 5px;">
        <strong>justmaid</strong> • Ménage professionnel en Suisse
      </p>
      <p style="color: #888; font-size: 12px; margin: 5px 0 0;">
        Rte de Mon-Idée, 1226 Thônex, Suisse
      </p>
      <p style="color: #666; font-size: 12px; margin: 20px 0 0;">
        © ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse 🇨🇭
      </p>
    </div>
  </div>
</body>
</html>
`
}

// Template email de rappel
function getReminderEmailHtml(data: BookingEmailData): string {
  // Calculer l'heure de fin
  const [startHour, startMin] = data.booking.scheduled_time.split(':').map(Number)
  const endHour = startHour + data.booking.duration
  const endTime = `${endHour.toString().padStart(2, '0')}:${(startMin || 0).toString().padStart(2, '0')}`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2FCCC0 0%, #1fb8ad 100%); padding: 40px 40px 30px; text-align: center;">
      <div style="display: inline-block; background: white; color: #2FCCC0; font-weight: bold; font-size: 28px; width: 60px; height: 60px; line-height: 60px; border-radius: 16px; margin-bottom: 15px;">J</div>
      <h1 style="color: white; font-size: 24px; margin: 10px 0 5px;">justmaid</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Service de ménage professionnel en Suisse 🇨🇭</p>
    </div>
    
    <!-- Reminder Banner -->
    <div style="background: #fff3cd; padding: 20px; text-align: center; border-bottom: 3px solid #ffc107;">
      <span style="font-size: 32px;">⏰</span>
      <h2 style="color: #856404; font-size: 22px; margin: 10px 0 5px;">Rappel : C'est demain !</h2>
      <p style="color: #856404; font-size: 14px; margin: 0;">Votre ménage est prévu pour demain</p>
    </div>
    
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Bonjour <strong>${data.userName}</strong>,<br><br>
        Petit rappel : votre intervention de ménage <strong style="color: #2FCCC0;">justmaid</strong> est prévue pour <strong>demain</strong> !
      </p>
      
      <!-- Booking Details Card -->
      <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffecb5 100%); border-radius: 16px; padding: 25px; margin-bottom: 25px; border: 2px solid #ffc107;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0;">
              <span style="font-size: 18px;">📅</span>
              <span style="color: #856404; font-size: 14px; margin-left: 10px;">Date</span>
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <strong style="color: #664d03; font-size: 16px;">${formatDate(data.booking.scheduled_date)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <span style="font-size: 18px;">🕐</span>
              <span style="color: #856404; font-size: 14px; margin-left: 10px;">Horaire</span>
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <strong style="color: #664d03; font-size: 16px;">${data.booking.scheduled_time} → ${endTime}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <span style="font-size: 18px;">📍</span>
              <span style="color: #856404; font-size: 14px; margin-left: 10px;">Adresse</span>
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <strong style="color: #664d03; font-size: 16px;">${data.booking.address}</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Checklist -->
      <div style="background: #e8f5e9; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; font-size: 14px; margin: 0 0 15px;">✅ Checklist avant l'intervention :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #2e7d32; font-size: 14px; line-height: 2;">
          <li>Préparer l'accès à votre domicile</li>
          <li>Vérifier le matériel de ménage (aspirateur, serpillère, produits)</li>
          <li>Ranger les objets fragiles ou de valeur</li>
          <li>Indiquer les zones prioritaires si besoin</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.justmaid.ch/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
          📱 Voir ma réservation
        </a>
      </div>
      
      <!-- Contact -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Besoin de modifier ou annuler ? <a href="mailto:contact@justmaid.ch" style="color: #2563eb; text-decoration: none;">Contactez-nous</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 18px; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; margin-bottom: 15px;">J</div>
      <p style="color: white; font-size: 14px; margin: 10px 0 5px;">
        <strong>justmaid</strong> • Ménage professionnel en Suisse
      </p>
      <p style="color: #666; font-size: 12px; margin: 20px 0 0;">
        © ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse 🇨🇭
      </p>
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
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2FCCC0 0%, #1fb8ad 100%); padding: 40px 40px 30px; text-align: center;">
      <div style="display: inline-block; background: white; color: #2FCCC0; font-weight: bold; font-size: 28px; width: 60px; height: 60px; line-height: 60px; border-radius: 16px; margin-bottom: 15px;">J</div>
      <h1 style="color: white; font-size: 24px; margin: 10px 0 5px;">justmaid</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Service de ménage professionnel en Suisse 🇨🇭</p>
    </div>
    
    <!-- Cancellation Banner -->
    <div style="background: #f8d7da; padding: 20px; text-align: center; border-bottom: 3px solid #dc3545;">
      <span style="font-size: 32px;">❌</span>
      <h2 style="color: #721c24; font-size: 22px; margin: 10px 0 5px;">Réservation annulée</h2>
      <p style="color: #721c24; font-size: 14px; margin: 0;">Votre intervention a été annulée</p>
    </div>
    
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Bonjour <strong>${data.userName}</strong>,<br><br>
        Nous vous confirmons l'annulation de votre réservation de ménage <strong style="color: #2FCCC0;">justmaid</strong>.
      </p>
      
      <!-- Cancelled Booking Details -->
      <div style="background: #f8f9fa; border-radius: 16px; padding: 25px; margin-bottom: 25px; border: 1px solid #dee2e6; opacity: 0.8;">
        <h3 style="color: #6c757d; font-size: 14px; margin: 0 0 15px; text-decoration: line-through;">Réservation annulée</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
              📅 Date prévue :
            </td>
            <td style="padding: 8px 0; text-align: right; color: #6c757d; font-size: 14px; text-decoration: line-through;">
              ${formatDate(data.booking.scheduled_date)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
              🕐 Horaire prévu :
            </td>
            <td style="padding: 8px 0; text-align: right; color: #6c757d; font-size: 14px; text-decoration: line-through;">
              ${data.booking.scheduled_time}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Refund Info -->
      <div style="background: #e3f2fd; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
        <h3 style="color: #1565c0; font-size: 14px; margin: 0 0 10px;">💳 Information importante</h3>
        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.6;">
          Si une pré-autorisation avait été effectuée, celle-ci sera automatiquement annulée. 
          Aucun montant ne sera débité de votre compte.
        </p>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; margin: 35px 0;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Vous souhaitez reprogrammer votre ménage ?
        </p>
        <a href="https://www.justmaid.ch/booking/cleaning" 
           style="display: inline-block; background: linear-gradient(135deg, #2FCCC0 0%, #1fb8ad 100%); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(47, 204, 192, 0.3);">
          🧹 Réserver à nouveau
        </a>
      </div>
      
      <!-- Contact -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Une question ? <a href="mailto:contact@justmaid.ch" style="color: #2563eb; text-decoration: none;">Contactez-nous</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
      <div style="display: inline-block; background: #2FCCC0; color: white; font-weight: bold; font-size: 18px; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; margin-bottom: 15px;">J</div>
      <p style="color: white; font-size: 14px; margin: 10px 0 5px;">
        <strong>justmaid</strong> • Ménage professionnel en Suisse
      </p>
      <p style="color: #666; font-size: 12px; margin: 20px 0 0;">
        © ${new Date().getFullYear()} justmaid • Fait avec ❤️ en Suisse 🇨🇭
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
