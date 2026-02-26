'use client'

import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { getCurrentProfile } from './profile/actions';
import { useEffect, useState } from 'react';
import { Profile } from '@/types';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        getCurrentProfile().then(setProfile).catch(() => null);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <Toaster position="top-right" richColors />
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex flex-col flex-1 overflow-hidden">
                {profile && (
                    <Header
                        profile={profile}
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                    />
                )}
                <main className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/10 overflow-y-auto custom-scrollbar">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
