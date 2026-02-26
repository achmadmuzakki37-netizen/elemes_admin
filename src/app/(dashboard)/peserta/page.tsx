export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { getParticipantsDashboardData } from './actions'
import { PesertaClient } from '@/components/admin/peserta-client'
import { Users2 } from 'lucide-react'

export default async function PesertaPage() {
    const { categories, trainings, registrations, assignments } = await getParticipantsDashboardData()

    return (
        <div className="flex flex-col space-y-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Data Peserta
                </h1>
                <p className="text-sm text-zinc-500">
                    Pantau semua pendaftar berdasarkan kategori tingkat pendidikan dan modul pelatihan.
                </p>
            </header>

            <PesertaClient
                categories={categories}
                trainings={trainings}
                registrations={registrations}
                assignments={assignments}
            />
        </div>
    )
}
