'use client'

import { useState, useRef, useEffect } from 'react'
import { Training, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTraining, updateTraining } from '@/app/(dashboard)/trainings/trainings-actions'
import { DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Check, BookOpen, Video, DollarSign, Settings, Image as ImageIcon, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import Image from 'next/image'

// Helper function to extract ID from Google Drive/Slides URL
function extractGoogleId(url: string): string {
    if (!url) return '';

    // Pattern untuk Google Drive: /d/FILE_ID/ atau /folders/FOLDER_ID
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) return driveMatch[1];

    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];

    // Pattern untuk Google Slides: /d/PRESENTATION_ID/
    const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slidesMatch) return slidesMatch[1];

    // Jika sudah berupa ID saja (tanpa URL)
    return url;
}

interface TrainingFormProps {
    categories: Category[]
    training?: Training
    onSuccess?: () => void
}

const STEPS = [
    { id: 1, title: 'Informasi Dasar', icon: BookOpen },
    { id: 2, title: 'Media & Materi', icon: Video },
    { id: 3, title: 'Pengaturan & Harga', icon: Settings },
]

export function TrainingForm({ categories, training, onSuccess }: TrainingFormProps) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [isStep1Valid, setIsStep1Valid] = useState(false)
    const [submitEnabled, setSubmitEnabled] = useState(true)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(training?.banner_url || null)
    const formRef = useRef<HTMLFormElement>(null)

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setBannerFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setBannerPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearBanner = () => {
        setBannerFile(null)
        setBannerPreview(null)
    }

    const checkValidity = () => {
        if (!formRef.current) return;
        const name = (formRef.current.elements.namedItem('name') as HTMLInputElement)?.value;
        const duration = (formRef.current.elements.namedItem('duration') as HTMLInputElement)?.value;
        const month = (formRef.current.elements.namedItem('month_index') as HTMLInputElement)?.value;
        const category = (formRef.current.elements.namedItem('category_id') as HTMLInputElement)?.value;

        setIsStep1Valid(Boolean(name?.trim() && duration?.trim() && month && category));
    }

    useEffect(() => {
        if (step === 1) {
            setTimeout(checkValidity, 50)
        }
    }, [step, training])

    useEffect(() => {
        if (step === 3) {
            setSubmitEnabled(false)
            const timer = setTimeout(() => setSubmitEnabled(true), 500)
            return () => clearTimeout(timer)
        }
    }, [step])

    const nextStep = () => {
        if (step === 1 && !isStep1Valid) return;
        setStep(Math.min(step + 1, 3))
    }

    const prevStep = () => {
        setStep(Math.max(step - 1, 1))
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)

        try {
            const name = formData.get('name') as string;
            const category_id = formData.get('category_id') as string;
            const duration = formData.get('duration') as string;

            if (!name || !category_id || !duration) {
                toast.error("Wajib Diisi", {
                    description: "Pastikan nama, kategori, dan durasi sudah diisi."
                });
                setLoading(false);
                setStep(1); // Go back to first step
                return;
            }

            // Handle Banner Upload if there is a new file
            let banner_url = training?.banner_url;

            if (bannerFile) {
                const fileExt = bannerFile.name.split('.').pop();
                const filePath = `banner-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('img')
                    .upload(filePath, bannerFile);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('img')
                    .getPublicUrl(filePath);

                banner_url = publicUrl;
            } else if (bannerPreview === null) {
                // User cleared the banner
                banner_url = undefined;
            }

            // Extract IDs from URLs
            const certificateTemplateUrl = formData.get('certificate_template_url') as string;
            const driveFolderUrl = formData.get('drive_folder_url') as string;
            const certificateFolderUrl = formData.get('certificate_folder_url') as string;

            const data = {
                name,
                category_id,
                month_index: parseInt(formData.get('month_index') as string) || 0,
                duration,
                banner_url,
                youtube_id: (formData.get('youtube_id') as string) || undefined,
                vimeo_id: (formData.get('vimeo_id') as string) || undefined,
                google_drive_id: (formData.get('google_drive_id') as string) || undefined,
                video_url: (formData.get('video_url') as string) || undefined,
                materi: (formData.get('materi') as string) || undefined,
                pdf_path: (formData.get('pdf_path') as string) || undefined,
                is_paid: formData.get('is_paid') === 'on',
                price: parseFloat(formData.get('price') as string) || 0,
                date: (formData.get('date') as string) || undefined,
                time: (formData.get('time') as string) || undefined,
                certificate_template_id: certificateTemplateUrl ? extractGoogleId(certificateTemplateUrl) : undefined,
                gas_url: (formData.get('gas_url') as string) || undefined,
                drive_folder_id: driveFolderUrl ? extractGoogleId(driveFolderUrl) : undefined,
                certificate_folder_id: certificateFolderUrl ? extractGoogleId(certificateFolderUrl) : undefined,
            }

            if (training) {
                await updateTraining(training.id, data)
                toast.success("Berhasil", { description: "Pelatihan berhasil diperbarui." })
            } else {
                await createTraining(data)
                toast.success("Berhasil", { description: "Pelatihan baru berhasil ditambahkan." })
            }

            onSuccess?.()

            // Auto close if it's inside a dialog and success is called without providing onSuccess manually
            if (!onSuccess) {
                // Find and click the close button as a fallback if onSuccess isn't wired to close
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }
        } catch (error: any) {
            console.error('Failed to save training:', error)
            toast.error("Gagal Menyimpan", {
                description: error.message || "Terjadi kesalahan saat menyimpan data pelatihan."
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} onChange={checkValidity} className="flex flex-col -mx-6 -mb-6 mt-2 h-[65vh] md:h-[60vh] overflow-hidden bg-white dark:bg-zinc-950 rounded-b-lg">
            {/* Stepper Header */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30">
                {STEPS.map((s) => {
                    const isActive = step === s.id;
                    const isPassed = step > s.id;

                    return (
                        <div
                            key={s.id}
                            onClick={() => {
                                // Allow jumping back, but not forward beyond current + 1
                                if (s.id < step) setStep(s.id);
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all md:justify-start
                                ${isActive ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-white dark:bg-zinc-900' : ''}
                                ${isPassed ? 'text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-white dark:hover:bg-zinc-900' : ''}
                                ${!isActive && !isPassed ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-70' : ''}
                            `}
                        >
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-[11px] font-bold shadow-sm transition-all
                                ${isActive ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 shadow-emerald-600/20' : ''}
                                ${isPassed ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : ''}
                                ${!isActive && !isPassed ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900' : ''}
                            `}>
                                {isPassed ? <Check className="w-3.5 h-3.5" /> : s.id}
                            </div>
                            <span className="hidden sm:inline-block tracking-tight">{s.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar relative">
                <div className="w-full max-w-full space-y-6">

                    {/* STEP 1: INFORMasi DASAR */}
                    <div className={`animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 ${step === 1 ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Nama Pelatihan <span className="text-red-500">*</span></Label>
                                <Input id="name" name="name" defaultValue={training?.name} required placeholder="Contoh: Digital Marketing Dasar" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id" className="text-zinc-700 dark:text-zinc-300">Kategori <span className="text-red-500">*</span></Label>
                                <Select name="category_id" defaultValue={training?.category_id || categories[0]?.id}>
                                    <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-zinc-700 dark:text-zinc-300">Durasi <span className="text-red-500">*</span></Label>
                                <Input id="duration" name="duration" defaultValue={training?.duration} required placeholder="Contoh: 2 Jam 30 Menit" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="month_index" className="text-zinc-700 dark:text-zinc-300">Indeks Bulan <span className="text-red-500">*</span></Label>
                                <Input id="month_index" name="month_index" type="number" defaultValue={training?.month_index ?? 0} required className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                                <p className="text-[11px] text-muted-foreground font-medium">0 = Jan, 1 = Feb, 2 = Mar, dst.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-zinc-700 dark:text-zinc-300">Tanggal Pelatihan (Opsional)</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    defaultValue={training?.date}
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="text-zinc-700 dark:text-zinc-300">Waktu Pelatihan (Opsional)</Label>
                                <Input
                                    id="time"
                                    name="time"
                                    type="time"
                                    defaultValue={training?.time}
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900"
                                />
                            </div>
                        </div>

                        {/* Banner Upload Field */}
                        <div className="space-y-3">
                            <Label className="text-zinc-700 dark:text-zinc-300">Banner Pelatihan (Recommended 16:9)</Label>
                            <div className="relative group">
                                {bannerPreview ? (
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-inner group">
                                        <Image
                                            src={bannerPreview}
                                            alt="Banner Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="rounded-full font-bold"
                                                onClick={() => document.getElementById('banner-upload')?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" /> Ganti Gambar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-full font-bold"
                                                onClick={clearBanner}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                        className="aspect-video w-full rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer group shadow-inner"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Klik untuk upload banner</p>
                                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, atau WebP (Max. 2MB)</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    id="banner-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: MEDIA & MATERI */}
                    <div className={`animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 ${step === 2 ? 'block' : 'hidden'}`}>
                        <div className="space-y-2">
                            <Label htmlFor="materi" className="text-zinc-700 dark:text-zinc-300">Ringkasan Materi</Label>
                            <Input id="materi" name="materi" defaultValue={training?.materi} placeholder="Penjelasan singkat tentang isi pelatihan..." className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="youtube_id" className="text-zinc-700 dark:text-zinc-300">YouTube Video ID</Label>
                                <Input id="youtube_id" name="youtube_id" defaultValue={training?.youtube_id} placeholder="Contoh: dQw4w9WgXcQ" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                                <p className="text-[11px] text-muted-foreground font-medium">11 Karakter unik YouTube ID</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vimeo_id" className="text-zinc-700 dark:text-zinc-300">Vimeo Video ID</Label>
                                <Input id="vimeo_id" name="vimeo_id" defaultValue={training?.vimeo_id} placeholder="Contoh: 123456789" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="google_drive_id" className="text-zinc-700 dark:text-zinc-300">Google Drive Video ID</Label>
                                <Input id="google_drive_id" name="google_drive_id" defaultValue={training?.google_drive_id} placeholder="ID file Drive" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="video_url" className="text-zinc-700 dark:text-zinc-300">URL Video Tambahan</Label>
                                <Input id="video_url" name="video_url" defaultValue={training?.video_url} placeholder="https://..." className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900" />
                            </div>
                        </div>

                        <div className="space-y-2 bg-blue-50/80 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                            <Label htmlFor="pdf_path" className="text-blue-800 dark:text-blue-300 font-semibold text-sm">Modul PDF / PPT (Google Drive Shared Link)</Label>
                            <Input
                                id="pdf_path"
                                name="pdf_path"
                                type="url"
                                defaultValue={training?.pdf_path}
                                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                                className="bg-white dark:bg-zinc-950 border-blue-200/60 dark:border-blue-900/40 mt-1 shadow-sm"
                            />
                            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-2 font-medium">
                                👉 Pastikan link Google Drive diset <strong className="font-bold">"Anyone with the link can view"</strong>.
                            </p>
                        </div>
                    </div>

                    {/* STEP 3: PENGATURAN & HARGA */}
                    <div className={`animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 ${step === 3 ? 'block' : 'hidden'}`}>
                        <div className="p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 mb-6">
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Akses & Harga
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex items-center space-x-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/20 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
                                    <input
                                        type="checkbox"
                                        id="is_paid"
                                        name="is_paid"
                                        defaultChecked={training?.is_paid}
                                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="is_paid" className="font-semibold cursor-pointer">Kelas Premium</Label>
                                        <p className="text-[11px] text-muted-foreground font-medium">Centang untuk kelas berbayar</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-emerald-800 dark:text-emerald-300 font-medium">Harga (Rp)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="1000"
                                        min="0"
                                        defaultValue={training?.price ?? 0}
                                        className="bg-white dark:bg-zinc-900 border-emerald-200/60 dark:border-emerald-900/40 font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm focus-visible:ring-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 pb-2">
                                Penugasan & Sertifikat
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="drive_folder_url" className="text-zinc-700 dark:text-zinc-300">Folder Tugas Peserta</Label>
                                    <Input
                                        id="drive_folder_url"
                                        name="drive_folder_url"
                                        type="url"
                                        defaultValue={training?.drive_folder_id ? `https://drive.google.com/drive/folders/${training.drive_folder_id}` : ''}
                                        placeholder="https://drive.google.com/drive/folders/... "
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="certificate_folder_url" className="text-zinc-700 dark:text-zinc-300">Folder Simpan Sertifikat</Label>
                                    <Input
                                        id="certificate_folder_url"
                                        name="certificate_folder_url"
                                        type="url"
                                        defaultValue={training?.certificate_folder_id ? `https://drive.google.com/drive/folders/${training.certificate_folder_id}` : ''}
                                        placeholder="https://drive.google.com/drive/folders/... "
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-5">
                                <Label htmlFor="certificate_template_url" className="text-zinc-700 dark:text-zinc-300">Template Sertifikat Google Slides</Label>
                                <Input
                                    id="certificate_template_url"
                                    name="certificate_template_url"
                                    type="url"
                                    defaultValue={training?.certificate_template_id ? `https://docs.google.com/presentation/d/${training.certificate_template_id}` : ''}
                                    placeholder="https://docs.google.com/presentation/d/PRESENTATION_ID/edit"
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-colors focus:bg-white dark:focus:bg-zinc-900"
                                />
                                <p className="text-[11px] text-muted-foreground font-medium">Sistem otomatis mengambil Template ID dari URL.</p>
                            </div>

                            <div className="space-y-2 mt-5 mb-4">
                                <Label htmlFor="gas_url" className="text-zinc-700 dark:text-zinc-300">Google Apps Script Endpoint (Webhook)</Label>
                                <Input
                                    id="gas_url"
                                    name="gas_url"
                                    type="url"
                                    defaultValue={training?.gas_url || 'https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec'}
                                    placeholder="https://script.google.com/macros/s/..."
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-500 h-11"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Form Actions / Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex gap-2">
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                        </Button>
                    ) : (
                        <DialogClose asChild>
                            <Button variant="ghost" type="button" className="text-zinc-500 font-semibold hover:text-zinc-700">Batal</Button>
                        </DialogClose>
                    )}
                </div>

                <div className="flex gap-2">
                    {step < 3 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={step === 1 && !isStep1Valid}
                            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none transition-all group font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Selanjutnya <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={loading || !submitEnabled}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4" /> Simpan {training ? 'Perubahan' : 'Pelatihan Baru'}
                                </span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    )
}
