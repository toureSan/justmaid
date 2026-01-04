import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { getSupabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string>('Connexion en cours...')

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase()
        
        // Vérifier si c'est un recovery (reset password)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        const type = hashParams.get('type') || queryParams.get('type')
        const isRecovery = type === 'recovery'
        
        if (isRecovery) {
          setMessage('Réinitialisation du mot de passe...')
        }
        
        // Récupérer le code de l'URL et échanger contre une session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setStatus('error')
          return
        }

        // Fonction pour déterminer la redirection
        const getRedirectUrl = () => {
          // Si c'est un recovery, rediriger vers le dashboard pour modifier le mot de passe
          if (isRecovery) {
            return '/dashboard?tab=account'
          }
          // Si une réservation était en cours
          const bookingInProgress = localStorage.getItem("bookingInProgress")
          if (bookingInProgress) {
            return '/booking/cleaning'
          }
          // Par défaut, aller au dashboard
          return '/dashboard?tab=home'
        }

        if (data.session) {
          setStatus('success')
          setMessage(isRecovery ? 'Mot de passe modifié !' : 'Connexion réussie !')
          const redirectTo = getRedirectUrl()
          
          // Rediriger après 1 seconde
          setTimeout(() => {
            navigate({ to: redirectTo })
          }, 1000)
        } else {
          // Pas de session, essayer d'échanger le code
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
          
          if (accessToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })
            
            if (sessionError) {
              setError(sessionError.message)
              setStatus('error')
              return
            }
            
            setStatus('success')
            setMessage(isRecovery ? 'Mot de passe modifié !' : 'Connexion réussie !')
            const redirectTo = getRedirectUrl()
            setTimeout(() => {
              navigate({ to: redirectTo })
            }, 1000)
          } else {
            // Rediriger quand même, la session peut déjà être dans les cookies
            setStatus('success')
            setMessage(isRecovery ? 'Mot de passe modifié !' : 'Connexion réussie !')
            const redirectTo = getRedirectUrl()
            setTimeout(() => {
              navigate({ to: redirectTo })
            }, 500)
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Une erreur est survenue')
        setStatus('error')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {status === 'loading' && (
          <>
            {/* Logo animé */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-justmaid-turquoise text-white animate-pulse">
                <span className="text-4xl font-bold font-bricolage-grotesque">J</span>
              </div>
              {/* Cercle de chargement autour du logo */}
              <div className="absolute -inset-2">
                <svg className="h-24 w-24 animate-spin" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2FCCC0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="70 200"
                    className="opacity-30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2FCCC0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="70 200"
                  />
                </svg>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">{message}</p>
              <p className="text-sm text-gray-500">Veuillez patienter</p>
            </div>

            {/* Dots animés */}
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">{message} 🎉</p>
              <p className="text-sm text-gray-500">Redirection vers votre espace...</p>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">Erreur de connexion</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  )
}
