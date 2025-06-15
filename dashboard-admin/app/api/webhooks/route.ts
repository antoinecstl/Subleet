import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {  
    try {
    const evt = await verifyWebhook(req)

    const id = evt.data.id
    const eventType = evt.type

    if (eventType === 'user.created') {
      // Extraire les données de l'utilisateur depuis le webhook
      const userData = evt.data
      const email = userData.email_addresses?.[0]?.email_address
      const name = userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}`.trim()
        : userData.username || email?.split('@')[0] || 'Utilisateur'

      // Vérifier si l'utilisateur existe déjà dans Supabase
      const { data: existingUser, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('clerk_id', id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError)
        throw checkError
      }

      if (existingUser) {
        return new Response('User already exists', { status: 200 })
      }

      // Insérer l'utilisateur dans la table clients de Supabase
      const { data: clientData, error: insertError } = await supabase
        .from('clients')
        .insert([{
          name,
          email,
          phone: null, // Pas d'info de téléphone dans le webhook par défaut
          clerk_id: id,
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting user into Supabase:', insertError)
        throw insertError
      }
            
      return new Response(JSON.stringify({
        message: 'User created successfully',
        user: clientData
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Webhook received', { status: 200 })
    
  } catch (err) {
    console.error('Error processing webhook:', err)
    
    // Log plus détaillé pour le debugging
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    }
    
    return new Response(JSON.stringify({
      error: 'Error processing webhook',
      details: err instanceof Error ? err.message : 'Unknown error'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}