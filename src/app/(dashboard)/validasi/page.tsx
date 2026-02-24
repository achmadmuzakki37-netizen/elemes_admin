export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getAssignments } from './actions'
import { getCategories, getTrainings } from '@/app/(dashboard)/trainings/trainings-actions'
import { ValidasiTable } from '@/components/admin/validasi-table'
import { CheckCircle } from 'lucide-react'

export default async function ValidasiPage() {
    // parallel fetching for better performance
    const [assignments, categories, trainings] = await Promise.all([
        getAssignments(),
        getCategories(),
        getTrainings()
    ])

    return (
        <div className="h-full flex flex-col space-y-6">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Sistem Manajemen Pelatihan</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic text-zinc-900 dark:text-zinc-100 uppercase leading-none">
                    Validasi Tugas
                </h1>
                <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                    Tinjau dan proses pengiriman tugas peserta untuk memastikan kualitas pembelajaran tetap terjaga.
                </p>
            </header>

            <ValidasiTable
                assignments={assignments}
                categories={categories}
                trainings={trainings}
            />
        </div>
    )
}
