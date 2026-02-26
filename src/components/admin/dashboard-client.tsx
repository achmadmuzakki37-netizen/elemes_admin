'use client'

import { use, Suspense, useState, useEffect } from 'react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    BookOpen, Crown, Activity, Users, CheckCircle2,
    Clock, XCircle, LayoutGrid, Sun, Sunset, Moon, Sunrise,
    TrendingUp, ArrowUpRight
} from 'lucide-react'
import { Profile } from '@/types'
import { StatCardSkeleton } from './dashboard-skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardClientProps {
    metricsPromise: Promise<{
        totalTrainings: number
        premiumTrainings: number
        freeTrainings: number
        totalRegistrations: number
        pendingValidations: number
        validValidations: number
        invalidValidations: number
        totalCategories: number
    }>
    recentPromise: Promise<{
        recentActivities: any[]
        recentRegistrations: any[]
    }>
    trendPromise: Promise<any[]>
    profilePromise: Promise<Profile | null>
}

// ─── Greeting Logic ──────────────────────────────────────────────────────────

function getGreeting(hour: number) {
    if (hour >= 4 && hour < 11) {
        return {
            greeting: 'Selamat Pagi',
            message: 'Mulai hari dengan semangat! Cek data terkini dan pantau aktivitas pelatihan.',
            Icon: Sunrise,
            color: 'text-amber-500',
            bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20',
            border: 'border-amber-200/60 dark:border-amber-800/30',
        }
    } else if (hour >= 11 && hour < 15) {
        return {
            greeting: 'Selamat Siang',
            message: 'Sedang produktif! Pantau validasi peserta dan update data pelatihan hari ini.',
            Icon: Sun,
            color: 'text-yellow-500',
            bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20',
            border: 'border-yellow-200/60 dark:border-yellow-800/30',
        }
    } else if (hour >= 15 && hour < 19) {
        return {
            greeting: 'Selamat Sore',
            message: 'Hampir selesai! Pastikan semua validasi hari ini sudah tertangani dengan baik.',
            Icon: Sunset,
            color: 'text-orange-500',
            bg: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20',
            border: 'border-orange-200/60 dark:border-orange-800/30',
        }
    } else {
        return {
            greeting: 'Selamat Malam',
            message: 'Terima kasih atas kerja keras hari ini! Istirahat yang cukup untuk hari esok.',
            Icon: Moon,
            color: 'text-blue-400',
            bg: 'from-slate-50 to-blue-50 dark:from-slate-950/50 dark:to-blue-950/20',
            border: 'border-slate-200/60 dark:border-slate-800/30',
        }
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string | null }) {
    const map: Record<string, { label: string; cls: string }> = {
        pending: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        valid: { label: 'Valid', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        invalid: { label: 'Invalid', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    }
    const info = map[status ?? ''] ?? { label: status ?? '—', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${info.cls}`}>
            {info.label}
        </span>
    )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string
    value: number
    subtitle: string
    Icon: React.ElementType
    iconBg: string
    iconText: string
    accentColor: string
}

function StatCard({ title, value, subtitle, Icon, iconBg, iconText, accentColor }: StatCardProps) {
    return (
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className={`absolute inset-x-0 top-0 h-0.5 ${accentColor}`} />
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
                    <div className={`p-2 rounded-xl ${iconBg}`}>
                        <Icon className={`h-4 w-4 ${iconText}`} />
                    </div>
                </div>
                <p className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 tabular-nums">{value.toLocaleString('id-ID')}</p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>
            </div>
        </div>
    )
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2 shadow-lg rounded-xl text-sm">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="text-xs">
                    {p.value} pendaftar
                </p>
            ))}
        </div>
    )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function GreetingSection({ metricsPromise, profilePromise, clientHour }: { metricsPromise: Promise<any>, profilePromise: Promise<Profile | null>, clientHour?: number }) {
    const metrics = use(metricsPromise)
    const profile = use(profilePromise)

    // Default to morning if not yet determined or simplified
    const hour = clientHour ?? 8
    const { greeting, message, Icon: GreetIcon, color, bg, border } = getGreeting(hour)
    const firstName = profile?.full_name ?? 'Admin'

    // If clientHour is undefined, we might still be on server or very first hydration
    // To avoid mismatch, we can hide the specific greeting text or use a non-time-dependent one
    // But since it's wrapped in Suspense on the main component, clientHour will be set quickly.

    return (
        <div className={`relative border ${border} bg-gradient-to-r ${bg} rounded-2xl overflow-hidden`}>
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 opacity-[0.08] pointer-events-none select-none">
                <GreetIcon className="h-40 w-40" />
            </div>
            <div className="relative p-6 md:p-8">
                <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-xl bg-white/60 dark:bg-zinc-900/40 ${color}`}>
                        <GreetIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            {greeting},{' '}
                            <span className="text-emerald-600 dark:text-emerald-400">{firstName}</span>!
                        </h1>
                        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">{message}</p>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{metrics.pendingValidations}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">menunggu validasi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Users className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{metrics.totalRegistrations}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">total peserta</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{metrics.totalTrainings}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">pelatihan aktif</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatsGrid({ metricsPromise }: { metricsPromise: Promise<any> }) {
    const stats = use(metricsPromise)
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard title="Total Pelatihan" value={stats.totalTrainings} subtitle="Semua modul" Icon={BookOpen} iconBg="bg-emerald-50 dark:bg-emerald-950/30" iconText="text-emerald-600" accentColor="bg-emerald-500" />
            <StatCard title="Total Peserta" value={stats.totalRegistrations} subtitle="Terdaftar" Icon={Users} iconBg="bg-blue-50 dark:bg-blue-950/30" iconText="text-blue-600" accentColor="bg-blue-500" />
            <StatCard title="Menunggu Validasi" value={stats.pendingValidations} subtitle="Perlu ditinjau" Icon={Clock} iconBg="bg-amber-50 dark:bg-amber-950/30" iconText="text-amber-600" accentColor="bg-amber-500" />
            <StatCard title="Tervalidasi" value={stats.validValidations} subtitle="Berhasil valid" Icon={CheckCircle2} iconBg="bg-teal-50 dark:bg-teal-950/30" iconText="text-teal-600" accentColor="bg-teal-500" />
            <StatCard title="Total Kategori" value={stats.totalCategories} subtitle="Kategori pelatihan" Icon={LayoutGrid} iconBg="bg-zinc-100 dark:bg-zinc-800" iconText="text-zinc-500" accentColor="bg-zinc-400" />
        </div>
    )
}

function ChartsSection({ metricsPromise, trendPromise }: { metricsPromise: Promise<any>, trendPromise: Promise<any[]> }) {
    const stats = use(metricsPromise)
    const trend = use(trendPromise)

    const pieData = [
        { name: 'Premium', value: stats.premiumTrainings, color: '#f59e0b' },
        { name: 'Gratis', value: stats.freeTrainings, color: '#10b981' },
    ]

    const validationData = [
        { name: 'Menunggu', value: stats.pendingValidations, color: '#f59e0b' },
        { name: 'Valid', value: stats.validValidations, color: '#10b981' },
        { name: 'Invalid', value: stats.invalidValidations, color: '#ef4444' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Tren Registrasi Peserta</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">6 bulan terakhir</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-4 h-56 min-h-[224px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-zinc-800" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#colorTotal)" dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Distribusi Pelatihan</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Premium vs Gratis</p>
                        </div>
                        <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2 h-48 min-h-[192px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: any) => [`${value} pelatihan`, '']} contentStyle={{ fontSize: 12, border: '1px solid #e4e4e7', borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-1 space-y-2">
                        {pieData.map((d) => (
                            <div key={d.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-zinc-600 dark:text-zinc-400">{d.name}</span>
                                </div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Status Validasi</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Distribusi status peserta</p>
                        </div>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-4 h-48 min-h-[192px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={validationData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-zinc-800" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip formatter={(value: any) => [`${value} peserta`, '']} contentStyle={{ fontSize: 12, border: '1px solid #e4e4e7', borderRadius: '12px' }} />
                                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                    {validationData.map((entry, index) => <Cell key={`bar-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {validationData.map((d) => (
                            <div key={d.name} className="text-center">
                                <p className="text-lg font-black tabular-nums" style={{ color: d.color }}>{d.value}</p>
                                <p className="text-[10px] text-zinc-400">{d.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* This could be handled in a separate component but for now keeping it together */}
            </div>
        </div>
    )
}

function RecentActivityList({ recentPromise }: { recentPromise: Promise<any> }) {
    const { recentActivities, recentRegistrations } = use(recentPromise)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Peserta Terbaru</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">5 pendaftaran terakhir</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="space-y-3">
                    {recentRegistrations.length > 0 ? (
                        recentRegistrations.map((reg: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 py-2 border-b border-zinc-50 dark:border-zinc-800/80 last:border-0">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                        {reg.nama?.charAt(0)?.toUpperCase() ?? '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{reg.nama}</p>
                                    <p className="text-xs text-zinc-400 truncate">{reg.email}</p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <StatusBadge status={reg.status ?? null} />
                                    <p className="text-[10px] text-zinc-400 mt-1">{formatDate(reg.registered_at)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-zinc-400 italic">Belum ada pendaftaran.</p>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Pelatihan terbaru</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Aktivitas terakhir</p>
                    </div>
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="space-y-4">
                    {recentActivities.slice(0, 3).map((activity: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <div className={`w-2 h-2 rounded-full ${activity.is_paid ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{activity.name}</p>
                                <p className="text-[10px] text-zinc-400">{formatDate(activity.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function RecentTrainingsGrid({ recentPromise }: { recentPromise: Promise<any> }) {
    const { recentActivities } = use(recentPromise)
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Pelatihan Terbaru Ditambahkan</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">5 pelatihan terakhir</p>
                </div>
                <BookOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {recentActivities.length > 0 ? (
                    recentActivities.map((activity: any, idx: number) => (
                        <div key={idx} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors group">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${activity.is_paid ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {activity.is_paid ? 'Premium' : 'Gratis'}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">{activity.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-2">{formatDate(activity.created_at)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-zinc-400 italic col-span-full">Belum ada pelatihan baru.</p>
                )}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardClient({ metricsPromise, recentPromise, trendPromise, profilePromise }: DashboardClientProps) {
    const [currentTime, setCurrentTime] = useState<{ hour: number } | null>(null)

    useEffect(() => {
        // Set hour only on client side to avoid hydration mismatch
        setCurrentTime({ hour: new Date().getHours() })
    }, [])

    // If time is not yet determined, show a placeholder or a default morning greeting
    // but better to just show the skeleton style or nothing to be safe.
    // However, the Suspense boundary outside GreetingSection already handles partial loading.
    // Inside GreetingSection we also need to be careful.

    return (
        <div className="space-y-6">

            {/* Row 1: Greeting */}
            <Suspense fallback={<div className="h-48 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 animate-pulse" />}>
                <GreetingSection metricsPromise={metricsPromise} profilePromise={profilePromise} clientHour={currentTime?.hour} />
            </Suspense>

            {/* Row 2: Stats Grid */}
            <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}</div>}>
                <StatsGrid metricsPromise={metricsPromise} />
            </Suspense>

            {/* Row 3: Charts */}
            <Suspense fallback={<div className="h-96 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 animate-pulse" />}>
                <ChartsSection metricsPromise={metricsPromise} trendPromise={trendPromise} />
            </Suspense>

            {/* Row 4: Activity Sections */}
            <Suspense fallback={<div className="h-64 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 animate-pulse" />}>
                <RecentActivityList recentPromise={recentPromise} />
            </Suspense>

            {/* Row 5: Training Grid */}
            <Suspense fallback={<div className="h-48 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 animate-pulse" />}>
                <RecentTrainingsGrid recentPromise={recentPromise} />
            </Suspense>

        </div>
    )
}
