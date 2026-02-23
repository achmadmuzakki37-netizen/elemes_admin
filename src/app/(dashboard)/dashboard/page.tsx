import { Activity, BookOpen, Crown, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardStats } from '../dashboard-actions';

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Selamat Datang, Admin.
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                        Ringkasan performa dan manajemen LMS hari ini.
                    </p>
                </div>
                <Link href="/trainings">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all font-semibold">
                        <PlusCircle className="mr-2 h-4 w-4" /> Manajemen Pelatihan
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Pelatihan</CardTitle>
                        <BookOpen className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{stats.totalTrainings}</div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Semua modul tersedia</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Modul Premium</CardTitle>
                        <Crown className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{stats.premiumTrainings}</div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Membutuhkan akses berbayar</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Modul Gratis</CardTitle>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{stats.freeTrainings}</div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Dapat diakses terbuka</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
                    <CardHeader>
                        <CardTitle className="text-lg">Pelatihan Terbaru Ditambahkan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.is_paid ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        <span className="flex-1 font-medium truncate">{activity.name}</span>
                                        <span className="font-mono text-xs opacity-60 whitespace-nowrap">
                                            {new Date(activity.created_at!).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic">Belum ada pelatihan baru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
