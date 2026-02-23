'use server'

import { createClient } from '@/lib/supabase-server'
import { unstable_noStore as noStore } from 'next/cache'

export async function getDashboardStats() {
    noStore();
    const supabase = await createClient()

    // 1. Total Trainings
    const { count: totalTrainingsCount } = await supabase
        .from('trainings')
        .select('*', { count: 'exact', head: true })

    // 2. Premium Trainings
    const { count: premiumTrainingsCount } = await supabase
        .from('trainings')
        .select('*', { count: 'exact', head: true })
        .eq('is_paid', true)

    // 3. Free Trainings
    const { count: freeTrainingsCount } = await supabase
        .from('trainings')
        .select('*', { count: 'exact', head: true })
        .eq('is_paid', false)

    // 4. Recent Activities (Latest 3 trainings added)
    const { data: recentTrainings } = await supabase
        .from('trainings')
        .select('name, created_at, is_paid')
        .order('created_at', { ascending: false })
        .limit(3)

    return {
        totalTrainings: totalTrainingsCount || 0,
        premiumTrainings: premiumTrainingsCount || 0,
        freeTrainings: freeTrainingsCount || 0,
        recentActivities: recentTrainings || []
    }
}
