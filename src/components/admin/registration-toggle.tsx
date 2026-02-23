'use client'

import { useState, useTransition } from 'react'
import { Lock, Unlock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { toggleRegistrationStatus } from '@/app/(dashboard)/trainings/trainings-actions'
import { Training } from '@/types'
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

export function RegistrationToggle({ training }: { training: Training }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)

    const isClosed = training.registration_status === 'close'
    const newStatus = isClosed ? 'open' : 'close'

    const handleToggle = () => {
        startTransition(async () => {
            try {
                await toggleRegistrationStatus(training.id, training.registration_status)
                toast.success(`Status pendaftaran berhasil diubah menjadi ${newStatus === 'open' ? 'Buka' : 'Tutup'}`)
                setIsOpen(false)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui")
                setIsOpen(false)
            }
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isClosed ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'
                        }`}
                    disabled={isPending}
                    title={isClosed ? 'Buka Pendaftaran' : 'Tutup Pendaftaran'}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    ) : isClosed ? (
                        <Lock className="h-4 w-4" />
                    ) : (
                        <Unlock className="h-4 w-4" />
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-zinc-200 dark:border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin {isClosed ? 'membuka' : 'menutup'} pendaftaran untuk pelatihan <strong>{training.name}</strong>?
                        {isClosed ? ' Pendaftar baru akan dapat mendaftar kembali.' : ' Pendaftar baru tidak akan bisa mendaftar.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleToggle()
                        }}
                        disabled={isPending}
                        className={isClosed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isClosed ? 'Ya, Buka Pendaftaran' : 'Ya, Tutup Pendaftaran'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
