'use server'

import { createClient } from '@/lib/supabase-server' // Assuming I need a server client
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Note: I'll need to define supabase-server.ts if it's not there or use createServerClient from @supabase/ssr
    // Looking at src/lib, there is supabase-server.ts
    const { createClient } = await import('@/lib/supabase-server')
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}
