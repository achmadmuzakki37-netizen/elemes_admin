import React from 'react'

export default function Loading() {
    return (
        <div className="w-full space-y-6 animate-pulse p-1">
            {/* Header Skeleton */}
            <div className="space-y-2 mb-8">
                <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
            </div>

            {/* Content Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl" />
                ))}
            </div>

            {/* Table/List Skeleton */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-50 dark:border-zinc-800">
                    <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
                <div className="p-4 space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                                <div className="h-3 w-1/4 bg-zinc-50 dark:bg-zinc-800/50 rounded" />
                            </div>
                            <div className="w-20 h-6 rounded bg-zinc-50 dark:bg-zinc-800/50" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
