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
        <div className="flex flex-col space-y-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Validasi Tugas
                </h1>
                <p className="text-sm text-zinc-500">
                    Tinjau dan berikan penilaian pada tugas yang telah dikirimkan oleh para peserta pelatihan.
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
