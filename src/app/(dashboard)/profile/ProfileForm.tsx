'use client'

import { useState, useRef } from 'react'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { updateProfile, updatePassword } from './actions'
import { supabase } from '@/lib/supabase-client'
import { toast } from 'sonner'
import {
    User, Lock, Save, Loader2, Camera, Shield,
    Pencil, Key, Eye, EyeOff, UploadCloud
} from 'lucide-react'

interface ProfileFormProps {
    profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    // State for profile photo
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

    // State for personal info
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [profileData, setProfileData] = useState({
        full_name: profile.full_name || '',
        username: profile.username || '',
        website: profile.website || '',
    })

    // State for password
    const [isEditingPassword, setIsEditingPassword] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' })

    // --- Avatar Upload ---
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB')
            return
        }

        setAvatarFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile) return

        setIsUploadingAvatar(true)
        try {
            const fileExt = avatarFile.name.split('.').pop()
            const filePath = `avatar-${profile.id}-${Date.now()}.${fileExt}`

            // Upload to 'img' bucket
            const { error: uploadError } = await supabase.storage
                .from('img')
                .upload(filePath, avatarFile, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('img')
                .getPublicUrl(filePath)

            // Update avatar_url in profiles table
            await updateProfile(profile.id, { avatar_url: publicUrl })

            setAvatarFile(null)
            toast.success('Foto profil berhasil diperbarui!')
        } catch (error: any) {
            toast.error('Gagal mengupload foto: ' + error.message)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    // --- Personal Info ---
    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingInfo(true)
        try {
            await updateProfile(profile.id, profileData)
            toast.success('Informasi profil berhasil diperbarui!')
            setIsEditingInfo(false)
        } catch (error: any) {
            toast.error('Gagal memperbarui profil: ' + error.message)
        } finally {
            setIsSavingInfo(false)
        }
    }

    // --- Password ---
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Konfirmasi password tidak cocok')
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password minimal 6 karakter')
            return
        }
        setIsSavingPassword(true)
        try {
            await updatePassword(passwordData.newPassword)
            toast.success('Password berhasil diubah!')
            setPasswordData({ newPassword: '', confirmPassword: '' })
            setIsEditingPassword(false)
        } catch (error: any) {
            toast.error('Gagal mengubah password: ' + error.message)
        } finally {
            setIsSavingPassword(false)
        }
    }

    const displayName = profileData.full_name || profileData.username || 'Admin'
    const initials = displayName[0]?.toUpperCase() || 'A'

    return (
        <div className="space-y-6">

            {/* ─── Profile Overview Card ─── */}
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar with upload overlay */}
                        <div className="relative group shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-lg">
                                {avatarPreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-2xl font-black text-white">
                                        {initials}
                                    </div>
                                )}
                            </div>
                            {/* Upload overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                title="Ubah foto profil"
                            >
                                <Camera className="w-5 h-5 text-white" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate">{displayName}</h3>
                            <p className="text-sm text-zinc-400 font-medium mt-0.5">{profileData.username || '-'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                    <Shield className="w-3 h-3" />
                                    {profile.role}
                                </span>
                                {profile.created_at && (
                                    <span className="text-[11px] text-zinc-400 font-medium">
                                        Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Avatar Upload Actions */}
                    {avatarFile && (
                        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 font-medium truncate">
                                <span className="text-emerald-600 dark:text-emerald-400">✓ </span>
                                {avatarFile.name}
                            </div>
                            <Button
                                onClick={handleAvatarUpload}
                                disabled={isUploadingAvatar}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <UploadCloud className="w-3.5 h-3.5" />
                                )}
                                {isUploadingAvatar ? 'Mengupload...' : 'Simpan Foto'}
                            </Button>
                            <Button
                                onClick={() => { setAvatarFile(null); setAvatarPreview(profile.avatar_url || null) }}
                                variant="ghost"
                                size="sm"
                                className="text-zinc-500 hover:text-zinc-700 rounded-xl"
                            >
                                Batal
                            </Button>
                        </div>
                    )}
                    {!avatarFile && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1.5"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            Ubah foto profil
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* ─── Personal Information Card ─── */}
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Informasi Pribadi</h3>
                            <p className="text-xs text-zinc-400">Perbarui identitas publik Anda</p>
                        </div>
                    </div>
                    {!isEditingInfo && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingInfo(true)}
                            className="gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:border-zinc-300"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </Button>
                    )}
                </div>

                <CardContent className="p-6">
                    {isEditingInfo ? (
                        <form onSubmit={handleInfoSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Lengkap</Label>
                                    <Input
                                        id="full_name"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        placeholder="Nama lengkap"
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Username</Label>
                                    <Input
                                        id="username"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        placeholder="@username"
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Website</Label>
                                <Input
                                    id="website"
                                    value={profileData.website}
                                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                    placeholder="https://example.com"
                                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl h-11"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={isSavingInfo} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
                                    {isSavingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSavingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => { setIsEditingInfo(false); setProfileData({ full_name: profile.full_name || '', username: profile.username || '', website: profile.website || '' }) }}
                                    className="text-zinc-500 rounded-xl"
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoField label="Nama Lengkap" value={profileData.full_name || '-'} />
                            <InfoField label="Username" value={profileData.username || '-'} />
                            <InfoField label="Website" value={profileData.website || '-'} />
                            <InfoField label="Role" value={profile.role || '-'} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Security Card ─── */}
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Key className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Keamanan Akun</h3>
                            <p className="text-xs text-zinc-400">Kelola password dan keamanan login</p>
                        </div>
                    </div>
                    {!isEditingPassword && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingPassword(true)}
                            className="gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:border-zinc-300"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </Button>
                    )}
                </div>

                <CardContent className="p-6">
                    {isEditingPassword ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="Min. 6 karakter"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Konfirmasi Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="Ulangi password baru"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={isSavingPassword} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
                                    {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {isSavingPassword ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => { setIsEditingPassword(false); setPasswordData({ newPassword: '', confirmPassword: '' }) }}
                                    className="text-zinc-500 rounded-xl"
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoField label="Password" value="••••••••••••" />
                            <InfoField label="Terakhir Diubah" value={profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Small helper component for display fields
function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
        </div>
    )
}
