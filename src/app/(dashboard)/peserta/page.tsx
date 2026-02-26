import { Suspense } from 'react'
import { getParticipantsDashboardData } from './actions'
import { PesertaClient } from '@/components/admin/peserta-client'
import Loading from '../loading'

export default async function PesertaPage() {
    // Initiate fetch but don't await it here
    const dataPromise = getParticipantsDashboardData()

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

            <Suspense fallback={<Loading />}>
                <PesertaClient dataPromise={dataPromise} />
            </Suspense>
        </div>
    )
}
