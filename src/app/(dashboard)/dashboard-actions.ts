import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const getDashboardMetrics = unstable_cache(
    async () => {
        const [
            { count: totalTrainingsCount },
            { count: premiumTrainingsCount },
            { count: freeTrainingsCount },
            { count: totalRegistrationsCount },
            { count: pendingCount },
            { count: validCount },
            { count: invalidCount },
            { count: totalCategoriesCount },
        ] = await Promise.all([
            supabase.from('trainings').select('*', { count: 'exact', head: true }),
            supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('is_paid', true),
            supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('is_paid', false),
            supabase.from('registrations').select('*', { count: 'exact', head: true }),
            supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'valid'),
            supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'invalid'),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
        ])

        return {
            totalTrainings: totalTrainingsCount || 0,
            premiumTrainings: premiumTrainingsCount || 0,
            freeTrainings: freeTrainingsCount || 0,
            totalRegistrations: totalRegistrationsCount || 0,
            pendingValidations: pendingCount || 0,
            validValidations: validCount || 0,
            invalidValidations: invalidCount || 0,
            totalCategories: totalCategoriesCount || 0,
        }
    },
    ['dashboard-metrics'],
    { revalidate: 60, tags: ['dashboard'] }
)

// ─── Recent Activities ───────────────────────────────────────────────────────

export const getDashboardRecent = unstable_cache(
    async () => {
        const [
            { data: recentTrainings, error: err1 },
            { data: recentRegistrations, error: err2 },
        ] = await Promise.all([
            supabase.from('trainings').select('name, created_at, is_paid').order('created_at', { ascending: false }).limit(5),
            supabase.from('registrations').select('*').order('registered_at', { ascending: false }).limit(5),
        ])

        if (err1) console.error('[dashboard] recentTrainings error:', err1)
        if (err2) console.error('[dashboard] recentRegistrations error:', err2)

        return {
            recentActivities: recentTrainings || [],
            recentRegistrations: recentRegistrations || [],
        }
    },
    ['dashboard-recent'],
    { revalidate: 60, tags: ['dashboard'] }
)

// ─── Trend ───────────────────────────────────────────────────────────────────

export const getDashboardTrend = unstable_cache(
    async () => {
        const { data: allRegistrations, error: err3 } = await supabase
            .from('registrations')
            .select('registered_at')
            .order('registered_at', { ascending: false })

        if (err3) console.error('[dashboard] allRegistrations error:', err3)

        const monthlyMap: Record<string, number> = {}
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthlyMap[key] = 0
        }

        if (allRegistrations) {
            for (const reg of allRegistrations) {
                if (!reg.registered_at) continue
                const d = new Date(reg.registered_at)
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                if (key in monthlyMap) {
                    monthlyMap[key]++
                }
            }
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        return Object.entries(monthlyMap).map(([key, count]) => {
            const [year, month] = key.split('-')
            return {
                month: `${monthNames[parseInt(month) - 1]} ${year}`,
                total: count,
            }
        })
    },
    ['dashboard-trend'],
    { revalidate: 60, tags: ['dashboard'] }
)

// ─── Legacy Wrapper ───

export async function getDashboardStats() {
    const [metrics, recent, monthlyTrend] = await Promise.all([
        getDashboardMetrics(),
        getDashboardRecent(),
        getDashboardTrend(),
    ])

    return {
        ...metrics,
        ...recent,
        monthlyTrend,
    }
}
