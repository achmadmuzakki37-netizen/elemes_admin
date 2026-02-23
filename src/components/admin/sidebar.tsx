'use client'

import { useState } from 'react'
import { Home, BookOpen, ChevronLeft, ChevronRight, Menu, CheckCircle } from 'lucide-react'
import { LogoutButton } from './logout-button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/trainings', label: 'Pelatihan', icon: BookOpen },
    { href: '/validasi', label: 'Validasi', icon: CheckCircle },
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <aside
            className={`
                relative flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Toggle Sidebar"
                className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all shadow-md"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-6 border-b border-slate-800 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
                <div className="flex-shrink-0 p-2 bg-emerald-500 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <h2 className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden">
                        LMS Admin
                    </h2>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                <ul className="space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href === '/trainings' && pathname.startsWith('/trainings'))
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
                                        ${isActive
                                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
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
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className={`px-3 py-4 border-t border-slate-800 ${collapsed ? 'flex justify-center' : ''}`}>
                {collapsed ? (
                    <div title="Keluar">
                        <LogoutButton iconOnly />
                    </div>
                ) : (
                    <LogoutButton />
                )}
            </div>
        </aside>
    )
}
