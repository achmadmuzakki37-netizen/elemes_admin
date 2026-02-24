export const dynamic = 'force-dynamic';

import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/admin/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Toaster position="top-right" richColors />
            <Sidebar />
            <main className="flex-1 pt-4 px-4 pb-0 bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
