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

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase()
        
        // Récupérer le code de l'URL et échanger contre une session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setStatus('error')
          return
        }

        if (data.session) {
          setStatus('success')
          // Vérifier si une réservation était en cours
          const bookingInProgress = localStorage.getItem("bookingInProgress")
          const redirectTo = bookingInProgress ? '/booking/cleaning' : '/'
          
          // Rediriger après 1 seconde
          setTimeout(() => {
            navigate({ to: redirectTo })
          }, 1000)
        } else {
          // Pas de session, essayer d'échanger le code
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const queryParams = new URLSearchParams(window.location.search)
          
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
            // Vérifier si une réservation était en cours
            const bookingInProgress2 = localStorage.getItem("bookingInProgress")
            const redirectTo2 = bookingInProgress2 ? '/booking/cleaning' : '/'
            setTimeout(() => {
              navigate({ to: redirectTo2 })
            }, 1000)
          } else {
            // Rediriger quand même, la session peut déjà être dans les cookies
            setStatus('success')
            // Vérifier si une réservation était en cours
            const bookingInProgress3 = localStorage.getItem("bookingInProgress")
            const redirectTo3 = bookingInProgress3 ? '/booking/cleaning' : '/'
            setTimeout(() => {
              navigate({ to: redirectTo3 })
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h2 className="text-xl font-semibold text-foreground">Connexion en cours...</h2>
            <p className="mt-2 text-muted-foreground">Veuillez patienter</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Connexion réussie ! 🎉</h2>
            <p className="mt-2 text-muted-foreground">Redirection en cours...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Erreur de connexion</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  )
}
