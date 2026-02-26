'use client'

import { useState, useEffect } from 'react'
import { Home, BookOpen, CheckCircle, Users, User, LifeBuoy } from 'lucide-react'
import { LogoutButton } from './logout-button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/trainings', label: 'Pelatihan', icon: BookOpen },
    { href: '/validasi', label: 'Validasi', icon: CheckCircle },
    { href: '/peserta', label: 'Peserta', icon: Users },
]

const secondaryNavItems = [
    { href: '/profile', label: 'Profil', icon: User },
    { href: '/support', label: 'Dukungan', icon: LifeBuoy },
]

export interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    // Defer rendering
    useEffect(() => { setMounted(true) }, [])

    const renderNavItem = ({ href, label, icon: Icon }: typeof mainNavItems[0]) => {
        const isActive = pathname === href || (href === '/trainings' && pathname.startsWith('/trainings'))
        return (
            <li key={href}>
                <Link
                    href={href}
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
                        ${isActive
                            ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-600/30'
                            : 'text-zinc-500 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-slate-100'
                        }
                        ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? label : undefined}
                >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
                </Link>
            </li>
        )
    }

    return (
        <aside
            className={`
                relative flex flex-col
                bg-white dark:bg-zinc-950
                text-zinc-700 dark:text-slate-100
                border-r border-zinc-200 dark:border-zinc-800
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-6 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
                <div className="flex-shrink-0 p-2 bg-emerald-500 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <h2 className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-zinc-900 dark:text-white">
                        LMS Admin
                    </h2>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {mainNavItems.map(renderNavItem)}
                </ul>

                <hr className="my-4 border-zinc-100 dark:border-zinc-800 mx-2" />

                <ul className="space-y-1">
                    {secondaryNavItems.map(renderNavItem)}
                </ul>
            </nav>

            {/* Footer / Version Card */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                {collapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            V1
                        </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-emerald-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                            Versi 1.0.0
                        </p>
                        <p className="text-[10px] font-medium text-zinc-400 leading-tight">
                            © 2026 PSLCC Lumajang
                        </p>
                    </div>
                )}
            </div>
        </aside>
    )
}
