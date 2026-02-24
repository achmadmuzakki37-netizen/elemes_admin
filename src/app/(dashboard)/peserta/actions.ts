'use server'

import { createClient } from '@/lib/supabase-server'
import { Category, Training, Registration } from '@/types'
import { unstable_noStore as noStore } from 'next/cache'

export async function getParticipantsDashboardData() {
    noStore();
    const supabase = await createClient()

    // Fetch categories, trainings, and registrations in parallel
    const [
        { data: categories, error: catError },
        { data: trainings, error: trainError },
        { data: registrations, error: regError }
    ] = await Promise.all([
        supabase.from('categories').select('*').order('title'),
        supabase.from('trainings').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('created_at', { ascending: false })
    ])

    if (catError) throw new Error(`Error fetching categories: ${catError.message}`)
    if (trainError) throw new Error(`Error fetching trainings: ${trainError.message}`)
    if (regError) throw new Error(`Error fetching registrations: ${regError.message}`)

    return {
        categories: categories as Category[],
        trainings: trainings as Training[],
        registrations: registrations as Registration[]
    }
}
