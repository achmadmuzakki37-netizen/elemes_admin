'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteTraining } from '@/app/(dashboard)/trainings/trainings-actions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteTrainingButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteTraining(id)
            toast.success("Berhasil", { description: "Pelatihan berhasil dihapus." })
            setOpen(false)
        } catch (error: any) {
            toast.error("Gagal Menghapus", { description: error.message || "Terjadi kesalahan saat menghapus pelatihan." })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting}
                    className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-100 dark:border-red-900/50 shadow-xl shadow-red-500/10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 dark:text-red-400">Hapus Pelatihan?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Data pelatihan, video, dan semua informasi terkait akan dihapus dari server kami secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                    >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
