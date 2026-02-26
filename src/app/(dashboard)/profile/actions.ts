'use server'

import { createClient } from '@/lib/supabase-server'
import { Profile } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getCurrentProfile() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    // 2. Get profile from database
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        throw new Error('Failed to fetch profile')
    }

    return {
        ...data,
        created_at: user.created_at
    } as Profile
}

export async function updateProfile(id: string, profile: Partial<Profile>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...profile,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/profile')
    return data as Profile
}

export async function updatePassword(password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        throw new Error(error.message)
    }

    return { success: true }
}
