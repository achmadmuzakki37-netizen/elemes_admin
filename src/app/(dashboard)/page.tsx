import { getDashboardMetrics, getDashboardRecent, getDashboardTrend } from './dashboard-actions'
import { getCurrentProfile } from './profile/actions'
import { DashboardClient } from '@/components/admin/dashboard-client'

export default async function DashboardPage() {
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
