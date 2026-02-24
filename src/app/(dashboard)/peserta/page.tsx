export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getParticipantsDashboardData } from './actions'
import { PesertaClient } from '@/components/admin/peserta-client'
import { Users2 } from 'lucide-react'

export default async function PesertaPage() {
    const { categories, trainings, registrations } = await getParticipantsDashboardData()

    return (
        <div className="h-full flex flex-col space-y-8 pb-12 overflow-y-auto custom-scrollbar pr-2">
            <header className="flex flex-col gap-1 shrink-0 px-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Users2 className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Direktori Peserta Pelatihan</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic text-zinc-900 dark:text-zinc-100 uppercase leading-none">
                    Data Peserta
                </h1>
                <p className="text-sm font-medium text-zinc-500 max-w-2xl leading-relaxed">
                    Kelola dan pantau seluruh pendaftar yang terbagi berdasarkan kategori tingkat pendidikan dan modul pelatihan.
                </p>
            </header>

            <PesertaClient
                categories={categories}
                trainings={trainings}
                registrations={registrations}
            />
        </div>
    )
}
