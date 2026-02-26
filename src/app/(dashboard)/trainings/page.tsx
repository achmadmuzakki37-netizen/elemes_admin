import { getTrainings, getCategories } from './trainings-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training-form'
import { TrainingTable } from '@/components/admin/training-table'

export default async function TrainingsPage() {
    const trainings = await getTrainings()
    const categories = await getCategories()

    return (
        <div className="flex flex-col space-y-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Daftar Pelatihan
                </h1>
                <p className="text-sm text-zinc-500">
                    Kelola modul pembelajaran, durasi, dan kategori pelatihan yang tersedia dalam sistem.
                </p>
            </header>
            <TrainingTable trainings={trainings} categories={categories} />
        </div>
    )
}
