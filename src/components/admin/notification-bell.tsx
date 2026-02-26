'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Users, FileText, X } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { Notification, getNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/(dashboard)/notifications/actions'
import { Profile } from '@/types'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface NotificationBellProps {
    profile: Profile
}

export function NotificationBell({ profile }: NotificationBellProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const panelRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read_by.includes(profile.id)).length

    // Load initial notifications
    useEffect(() => {
        getNotifications().then(data => {
            setNotifications(data)
            setLoading(false)
        })
    }, [])

    // Subscribe to realtime changes on the notifications table
    useEffect(() => {
        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 19)])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'notifications' },
                (payload) => {
                    setNotifications(prev =>
                        prev.map(n => n.id === (payload.new as Notification).id ? (payload.new as Notification) : n)
                    )
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read_by.includes(profile.id)) {
            await markNotificationRead(notification.id, profile.id)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id
                    ? { ...n, read_by: [...n.read_by, profile.id] }
                    : n
                )
            )
        }
        // Navigate
        if (notification.link) {
            router.push(notification.link)
            setOpen(false)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(profile.id)
        setNotifications(prev =>
            prev.map(n => ({
                ...n,
                read_by: n.read_by.includes(profile.id) ? n.read_by : [...n.read_by, profile.id]
            }))
        )
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative h-10 w-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifikasi</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Tandai semua dibaca
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                                </div>
                                <p className="text-xs font-medium text-zinc-400">Belum ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map(notification => {
                                const isRead = notification.read_by.includes(profile.id)
                                const isRegistration = notification.type === 'registration'
                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left group border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 ${!isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isRegistration ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                                            {isRegistration
                                                ? <Users className={`w-4 h-4 ${isRegistration ? 'text-blue-500' : 'text-amber-500'}`} />
                                                : <FileText className="w-4 h-4 text-amber-500" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-xs font-bold leading-snug ${isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {notification.title}
                                                </p>
                                                {!isRead && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: localeId })}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
