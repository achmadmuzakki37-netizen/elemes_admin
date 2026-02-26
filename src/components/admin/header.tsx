'use client'

import { Bell, Sun, Moon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'
import { NotificationBell } from './notification-bell'
import { Profile } from '@/types'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface HeaderProps {
    profile: Profile;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function Header({ profile, collapsed, setCollapsed }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { resolvedTheme, setTheme } = useTheme()

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-6 transition-all duration-300 ${isScrolled
            ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-sm'
            : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900'
            }`}>
            {/* Left Side - Sidebar Toggle */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="h-10 w-10 relative border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm z-50"
                >
                    <Menu className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="h-10 w-10 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {mounted && resolvedTheme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </Button>

                {/* Notifications */}
                <NotificationBell profile={profile} />

                {/* User Nav */}
                <UserNav profile={profile} />
            </div>
        </header>
    )
}
