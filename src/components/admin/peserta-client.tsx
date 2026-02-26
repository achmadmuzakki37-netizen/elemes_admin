'use client'

import { use, useState, useMemo } from 'react'
import { Category, Training, Registration, Assignment } from '@/types'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { ParticipantListSheet } from './participant-list-sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    BookOpen,
    Users,
    ChevronRight,
    GraduationCap,
    Search,
    Trophy,
    Clock,
    FilterX,
    MoreHorizontal,
    CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface PesertaData {
    categories: Category[]
    trainings: Training[]
    registrations: Registration[]
    assignments: Assignment[]
}

interface PesertaClientProps {
    dataPromise: Promise<PesertaData>
}

// Color palette aligned to educational levels
const CATEGORY_CONFIG: Record<string, { bg: string; icon: string; dot: string; chartColor: string }> = {
    'tk': { bg: 'bg-pink-50 dark:bg-pink-950/20', icon: 'text-pink-500', dot: 'bg-pink-400', chartColor: '#f472b6' },
    'sd': { bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-500', dot: 'bg-amber-400', chartColor: '#fbbf24' },
    'smp': { bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-500', dot: 'bg-emerald-400', chartColor: '#34d399' },
    'sma': { bg: 'bg-blue-50 dark:bg-blue-950/20', icon: 'text-blue-500', dot: 'bg-blue-400', chartColor: '#60a5fa' },
    'default': { bg: 'bg-zinc-50 dark:bg-zinc-800', icon: 'text-zinc-500', dot: 'bg-zinc-400', chartColor: '#a1a1aa' },
}

export function PesertaClient({ dataPromise }: PesertaClientProps) {
    const { categories, trainings, registrations, assignments } = use(dataPromise)
    const [searchQuery, setSearchQuery] = useState('')

    const getParticipantsForTraining = (trainingId: string) =>
        registrations.filter(r => r.training_id === trainingId)

    const getAssignmentsForTraining = (trainingId: string) =>
        assignments.filter(a => a.training_id === trainingId)

    // ── Stats ──
    const categorySummaries = useMemo(() =>
        categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat.title.toLowerCase()] ?? CATEGORY_CONFIG['default']
            const catTrainings = trainings.filter(t => t.category_id === cat.id)
            const participantCount = registrations.filter(r => catTrainings.some(t => t.id === r.training_id)).length
            return { ...cat, trainingCount: catTrainings.length, participantCount, cfg }
        }),
        [categories, trainings, registrations]
    )

    const totalParticipants = registrations.length
    const totalTrainings = trainings.length
    const topCategory = categorySummaries.reduce(
        (max, c) => c.participantCount > max.participantCount ? c : max,
        categorySummaries[0] ?? { title: '-', participantCount: 0, trainingCount: 0, cfg: CATEGORY_CONFIG['default'] }
    )

    // ── Chart data ──
    const chartData = categorySummaries
        .filter(c => c.participantCount > 0)
        .map(c => ({ name: `Tingkat ${c.title}`, value: c.participantCount, color: c.cfg.chartColor }))

    // ── Filtered Trainings ──
    const filteredTrainings = useMemo(() =>
        trainings.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [trainings, searchQuery]
    )

    const filteredCategoriesWithTrainings = useMemo(() =>
        categories.map(cat => ({
            ...cat,
            trainings: filteredTrainings.filter(t => t.category_id === cat.id),
        })).filter(c => c.trainings.length > 0),
        [categories, filteredTrainings]
    )

    return (
        <div className="flex flex-col gap-6">

            {/* ── Top: Category Summary Grid ── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Semua Kategori</h2>
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <Input
                            placeholder="Cari pelatihan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-8 text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg focus-visible:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* 2 x N grid of category cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-zinc-100 dark:divide-zinc-800">
                    {categorySummaries.map(cat => (
                        <div key={cat.id} className="flex items-center gap-4 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl ${cat.cfg.bg} flex items-center justify-center shrink-0`}>
                                <GraduationCap className={`w-5 h-5 ${cat.cfg.icon}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">Tingkat {cat.title}</p>
                                <p className={`text-xs font-medium ${cat.cfg.icon}`}>{cat.participantCount} Peserta</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{cat.trainingCount} Modul</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom: Two Column Layout ── */}
            <div className="flex gap-6 items-start">

                {/* Left: Training Cards Grid */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {filteredCategoriesWithTrainings.length > 0 ? (
                        filteredCategoriesWithTrainings.map(category => {
                            const cfg = CATEGORY_CONFIG[category.title.toLowerCase()] ?? CATEGORY_CONFIG['default']
                            return (
                                <div key={category.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Tingkat {category.title}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-zinc-400">{category.trainings.length} modul</span>
                                    </div>

                                    {/* 2-col grid of training cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800">
                                        {category.trainings.map(training => {
                                            const participants = getParticipantsForTraining(training.id)
                                            const trainingAssignments = getAssignmentsForTraining(training.id)
                                            const validCount = trainingAssignments.filter(a => a.status === 'valid').length

                                            return (
                                                <Sheet key={training.id}>
                                                    <SheetTrigger asChild>
                                                        <button className="w-full text-left p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group flex flex-col gap-3">
                                                            {/* Card Top: thumbnail + name */}
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-700">
                                                                    {training.banner_url ? (
                                                                        <Image
                                                                            src={training.banner_url}
                                                                            alt={training.name}
                                                                            width={48}
                                                                            height={48}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className={`w-full h-full ${cfg.bg} flex items-center justify-center`}>
                                                                            <BookOpen className={`w-5 h-5 ${cfg.icon}`} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                                        {training.name}
                                                                    </p>
                                                                    {training.duration && (
                                                                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {training.duration}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Card Bottom: stats */}
                                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                                                                        <Users className="w-3 h-3" />
                                                                        {participants.length} peserta
                                                                    </span>
                                                                    {validCount > 0 && (
                                                                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                            {validCount} valid
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* Avatar Stack */}
                                                                {participants.length > 0 && (
                                                                    <div className="flex -space-x-2">
                                                                        {participants.slice(0, 3).map((p, i) => (
                                                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white">
                                                                                {p.nama?.[0] || '?'}
                                                                            </div>
                                                                        ))}
                                                                        {participants.length > 3 && (
                                                                            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-black text-zinc-600 dark:text-zinc-300">
                                                                                +{participants.length - 3}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </SheetTrigger>

                                                    <ParticipantListSheet
                                                        trainingName={training.name}
                                                        participants={participants}
                                                        assignments={trainingAssignments}
                                                    />
                                                </Sheet>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-16 text-center gap-3 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <FilterX className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tidak ditemukan</p>
                            <p className="text-xs text-zinc-400 max-w-xs">Tidak ada modul cocok dengan &quot;{searchQuery}&quot;</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Chart Panel */}
                <div className="w-72 shrink-0 flex flex-col gap-4 sticky top-20">

                    {/* Donut Chart Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Distribusi Peserta</p>
                                <p className="text-[11px] text-zinc-400">Berdasarkan level</p>
                            </div>
                            <button className="text-zinc-400 hover:text-zinc-600">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5">
                            {/* Donut Chart */}
                            {chartData.length > 0 ? (
                                <div className="relative min-h-[180px]">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                                strokeWidth={0}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'white',
                                                    border: '1px solid #e4e4e7',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalParticipants}</p>
                                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-44 flex items-center justify-center">
                                    <p className="text-xs text-zinc-400">Belum ada data</p>
                                </div>
                            )}

                            {/* Legend */}
                            <div className="mt-4 space-y-2.5">
                                {categorySummaries.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${cat.cfg.dot} shrink-0`} />
                                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Tingkat {cat.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cat.participantCount}</span>
                                            {totalParticipants > 0 && (
                                                <span className="text-[10px] text-zinc-400 w-8 text-right">
                                                    {Math.round((cat.participantCount / totalParticipants) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                            { label: 'Total Peserta', value: totalParticipants, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                            { label: 'Total Pelatihan', value: totalTrainings, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                            { label: 'Level Teratas', value: topCategory.title, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
