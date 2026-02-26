'use server'

import { createClient } from '@/lib/supabase-server'


export interface Notification {
    id: string
    type: 'registration' | 'assignment'
    title: string
    message: string
    reference_id: string | null
    link: string | null
    read_by: string[]
    created_at: string
}

export async function getNotifications(): Promise<Notification[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }
    return data ?? []
}

export async function markNotificationRead(notificationId: string, userId: string) {
    const supabase = await createClient()
    const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId,
        user_id: userId,
    })
    if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
    const supabase = await createClient()
    // Append userId to read_by for all notifications not already containing it
    const { error } = await supabase.rpc('mark_all_notifications_read', {
        user_id: userId,
    })
    if (error) throw error
}
