'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from '@/app/(auth)/login/auth-actions'
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

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleLogout() {
        setIsLoggingOut(true)
        toast.message("Membuka Sesi...", { description: "Sedang mengeluarkan akun Anda." })
        try {
            await signOut()
            // No success toast as the page will redirect
        } catch (error) {
            toast.error("Gagal", { description: "Gagal memproses logout." })
            setIsLoggingOut(false)
            setOpen(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button
                    disabled={isLoggingOut}
                    className={
                        iconOnly
                            ? "flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-950/30 transition-all"
                            : "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-950/30 transition-all group"
                    }
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!iconOnly && (
                        <span className="group-hover:text-red-500 transition-colors font-medium">
                            {isLoggingOut ? 'Sedang Keluar...' : 'Keluar'}
                        </span>
                    )}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-100 dark:border-red-900/50 shadow-xl shadow-red-500/10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 dark:text-red-400">Konfirmasi Keluar</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin keluar dari sesi LMS Admin saat ini? Anda harus login kembali untuk mengelola pelatihan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoggingOut}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                        disabled={isLoggingOut}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                    >
                        {isLoggingOut ? 'Sedang Keluar...' : 'Ya, Keluar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
