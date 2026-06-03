import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, imageUrl } = await req.json()

    if (!userId || !imageUrl) {
      return new Response(JSON.stringify({ error: 'Faltan userId o imageUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Inicializar cliente Supabase con Service Role para saltarse RLS al escribir en Storage y Profiles
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Descargar la imagen externa
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Fallo al descargar la imagen: ${response.statusText}`)
    }

    const blob = await response.blob()
    const fileExt = imageUrl.split('.').pop()?.split('?')[0] ?? 'jpg'
    const fileName = `${userId}/avatar.${fileExt}`

    // 2. Subir al bucket 'avatars'
    const { error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: response.headers.get('Content-Type') ?? 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // 3. Obtener la URL pública
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // 4. Actualizar la URL en public.profiles
    const { error: dbError } = await supabaseClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (dbError) {
      throw dbError
    }

    return new Response(JSON.stringify({ success: true, publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
