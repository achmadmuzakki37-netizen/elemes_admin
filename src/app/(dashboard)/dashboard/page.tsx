import { Suspense } from 'react'
import { getDashboardMetrics, getDashboardRecent, getDashboardTrend } from '../dashboard-actions'
import { getCurrentProfile } from '../profile/actions'
import { DashboardClient } from '@/components/admin/dashboard-client'
import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton'

export default async function DashboardPage() {
    // Initiate all fetches in parallel - but DON'T await them here!
    // We pass the raw promises to the client component for streaming.
    const metricsPromise = getDashboardMetrics()
    const recentPromise = getDashboardRecent()
    const trendPromise = getDashboardTrend()
    const profilePromise = getCurrentProfile().catch(() => null)

    return (
        <DashboardClient
            metricsPromise={metricsPromise}
            recentPromise={recentPromise}
            trendPromise={trendPromise}
            profilePromise={profilePromise}
        />
    )
}
