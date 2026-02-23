import { getTrainings, getCategories } from './trainings-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training-form'
import { TrainingTable } from '@/components/admin/training-table'

export default async function TrainingsPage() {
    const trainings = await getTrainings()
    const categories = await getCategories()

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <TrainingTable trainings={trainings} categories={categories} />
        </div>
    )
}
