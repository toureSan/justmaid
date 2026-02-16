import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')
const RANKPILL_WEBHOOK_SECRET = Deno.env.get('RANKPILL_WEBHOOK_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rankpill-signature',
}

interface RankPillPayload {
  title: string
  content_html: string
  content_markdown: string
  slug: string
  meta_description: string
  status: string
  featured_image: string | null
  published_url: string | null
  scheduled_date: string | null
  published_at: string
  is_republish: boolean
  test?: boolean
}

function generateExcerpt(markdown: string, maxLength = 200): string {
  const cleaned = markdown
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\|.*\|$/gm, '')
    .replace(/^>+\s?/gm, '')
    .replace(/^---$/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()

  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

function calculateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'RankPill webhook endpoint is active' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!RANKPILL_WEBHOOK_SECRET) {
    console.error('[RankPill Webhook] RANKPILL_WEBHOOK_SECRET is not set')
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[RankPill Webhook] Missing Supabase env vars')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const rawBody = await req.text()

    // Compute HMAC SHA-256 signature using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(RANKPILL_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Verify authentication (signature or bearer token)
    const signature = req.headers.get('x-rankpill-signature')
    const authHeader = req.headers.get('authorization')

    let isAuthenticated = false

    // Check HMAC signature
    if (signature) {
      isAuthenticated = signature === expectedSignature
    }

    // Check bearer token
    if (!isAuthenticated && authHeader) {
      isAuthenticated = authHeader === `Bearer ${RANKPILL_WEBHOOK_SECRET}`
    }

    // Also accept sha256= format in Authorization header
    if (!isAuthenticated && authHeader && authHeader.startsWith('sha256=')) {
      const authSig = authHeader.replace('sha256=', '')
      isAuthenticated = authSig === expectedSignature
    }

    if (!isAuthenticated) {
      console.error('[RankPill Webhook] Authentication failed')
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const article: RankPillPayload = JSON.parse(rawBody)

    // Handle test payloads
    if (article.test) {
      console.log('[RankPill Webhook] Test payload received - webhook works!')
      return new Response(
        JSON.stringify({ message: 'Test webhook received successfully', test: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const excerpt = generateExcerpt(article.content_markdown)
    const readingTime = calculateReadingTime(article.content_markdown)

    const articleData = {
      title: article.title,
      slug: article.slug,
      excerpt,
      content_markdown: article.content_markdown,
      content_html: article.content_html,
      category_id: '1',
      author_name: 'Justmaid',
      author_avatar: null,
      featured_image: article.featured_image,
      published_at: article.published_at || new Date().toISOString(),
      reading_time: readingTime,
      tags: [] as string[],
      meta_title: article.title,
      meta_description: article.meta_description || excerpt,
      source: 'rankpill',
      is_published: true,
      updated_at: new Date().toISOString(),
    }

    // Upsert: insert or update based on slug
    const { data, error } = await supabase
      .from('blog_articles')
      .upsert(articleData, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error('[RankPill Webhook] Supabase error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save article', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const action = article.is_republish ? 'updated' : 'created'
    console.log(`[RankPill Webhook] Article ${action}: "${article.title}" (${article.slug})`)

    return new Response(
      JSON.stringify({ message: `Article ${action} successfully`, slug: article.slug, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[RankPill Webhook] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
