import { getCurrentProfile } from './actions'
import { Shield } from 'lucide-react'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
    const profile = await getCurrentProfile().catch(() => null)

    if (!profile) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold">Profil tidak ditemukan</h2>
                <p className="text-zinc-500 text-center max-w-xs text-sm">
                    Pastikan Anda sudah login dengan akun admin yang valid.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Profil
                </h1>
                <p className="text-sm text-zinc-500">
                    Kelola identitas dan pengaturan akun admin Anda.
                </p>
            </header>

            {/* Profile Form handles all sections */}
            <ProfileForm key={profile.updated_at} profile={profile} />
        </div>
    )
}
