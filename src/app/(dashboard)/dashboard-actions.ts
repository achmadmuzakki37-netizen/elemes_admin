'use server'

import { createClient } from '@/lib/supabase-server'
import { unstable_noStore as noStore } from 'next/cache'

export async function getDashboardStats() {
    noStore();
    const supabase = await createClient()

    // Run all queries in parallel to reduce total latency
    const [
        { count: totalTrainingsCount },
        { count: premiumTrainingsCount },
        { count: freeTrainingsCount },
        { data: recentTrainings }
    ] = await Promise.all([
        supabase.from('trainings').select('*', { count: 'exact', head: true }),
        supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('is_paid', true),
        supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('is_paid', false),
        supabase.from('trainings').select('name, created_at, is_paid').order('created_at', { ascending: false }).limit(3)
    ])

    return {
        totalTrainings: totalTrainingsCount || 0,
        premiumTrainings: premiumTrainingsCount || 0,
        freeTrainings: freeTrainingsCount || 0,
        recentActivities: recentTrainings || []
    }
}
