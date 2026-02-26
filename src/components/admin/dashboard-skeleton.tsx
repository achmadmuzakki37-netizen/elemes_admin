import React from 'react'

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">

            {/* ── Greeting Card Skeleton ── */}
            <div className="relative border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl h-48 overflow-hidden">
                <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                        <div className="space-y-2 flex-1">
                            <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
            </div>

            {/* ── Stat Cards Skeleton ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                        <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                        <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                ))}
            </div>

            {/* ── Charts Skeleton ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl h-72">
                    <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />
                    <div className="h-48 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-lg" />
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl h-72">
                    <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />
                    <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-full border-8 border-zinc-100 dark:border-zinc-800" />
                    </div>
                    <div className="mt-6 space-y-2">
                        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
            </div>

            {/* ── Bottom Row Skeleton ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl h-64">
                    <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-8 w-full bg-zinc-50 dark:bg-zinc-800/30 rounded" />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl h-64">
                    <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                    <div className="h-2 w-1/4 bg-zinc-50 dark:bg-zinc-800/50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </div>
    )
}
