'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types'
import {
    User,
    Settings,
    LifeBuoy,
    LogOut,
    ChevronDown,
    UserCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { signOut } from '@/app/(auth)/login/auth-actions'
import { toast } from 'sonner'

interface UserNavProps {
    profile: Profile
}

export function UserNav({ profile }: UserNavProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        toast.message("Membuka Sesi...", { description: "Sedang mengeluarkan akun Anda." })
        try {
            await signOut()
        } catch (error) {
            toast.error("Gagal", { description: "Gagal memproses logout." })
            setIsLoggingOut(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-2 hover:bg-transparent focus-visible:ring-0">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                        <AvatarImage src={profile.avatar_url} alt={profile.username} />
                        <AvatarFallback className="bg-emerald-500 text-white font-bold uppercase">
                            {(profile.full_name || profile.username || 'A')[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start hidden md:flex">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                            {profile.full_name || profile.username}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-wider">
                            {profile.role}
                        </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-2xl border-zinc-100 dark:border-zinc-800" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-3">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-zinc-900 dark:text-zinc-100">
                            {profile.full_name || profile.username}
                        </p>
                        <p className="text-xs leading-none text-zinc-400 font-medium">
                            {profile.username || 'admin@tailadmin.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                <DropdownMenuGroup className="py-1">
                    <Link href="/profile">
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100">
                            <UserCircle className="w-4 h-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/support">
                        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100">
                            <LifeBuoy className="w-4 h-4" />
                            <span>Dukungan</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
