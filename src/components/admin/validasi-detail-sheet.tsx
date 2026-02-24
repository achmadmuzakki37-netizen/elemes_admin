'use client'

import { useState } from 'react'
import { AssignmentWithDetails } from '@/types'
import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateAssignmentStatus } from '@/app/(dashboard)/validasi/actions'
import { toast } from 'sonner'
import { BookOpen, User, FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

interface ValidasiDetailSheetProps {
    assignment: AssignmentWithDetails | null
    onSuccess: () => void
}

export function ValidasiDetailSheet({ assignment, onSuccess }: ValidasiDetailSheetProps) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)

    // Helper untuk normalisasi data dari Supabase (bisa berupa objek atau array)
    const getData = <T,>(data: T | T[]): T | undefined => {
        if (!data) return undefined
        return Array.isArray(data) ? data[0] : data
    }

    if (!assignment) return null

    const registration = getData(assignment.registrations)
    const training = getData(assignment.trainings)

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !feedback.trim()) {
            toast.error('Feedback wajib diisi jika menolak tugas.')
            return
        }

        setLoading(true)
        try {
            await updateAssignmentStatus({
                action,
                assignment_id: assignment.id,
                registration_id: assignment.registration_id,
                training_id: assignment.training_id,
                feedback: action === 'reject' ? feedback : undefined
            })
            toast.success(`Berhasil ${action === 'approve' ? 'memvalidasi' : 'menolak'} tugas.`)
            setFeedback('')
            setIsRejecting(false)
            onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Helper untuk preview Google Drive
    const getPreviewUrl = (url: string) => {
        if (!url) return ''
        if (url.includes('drive.google.com')) {
            return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
        }
        return url
    }

    return (
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto border-l-emerald-500/20 shadow-2xl">
            <SheetHeader className="mb-8 relative">
                <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                <SheetTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> VALIDASI TUGAS
                </SheetTitle>
                <SheetDescription className="font-medium text-zinc-500">
                    Tinjau hasil kerja peserta dan tentukan status kelulusan modul ini.
                </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
                {/* Info Peserta & Pelatihan */}
                <div className="grid grid-cols-1 gap-6 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User className="w-16 h-16" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <User className="w-3 h-3" /> Informasi Peserta
                            </Label>
                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{registration?.nama}</div>
                            {registration?.lembaga && (
                                <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{registration?.lembaga}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <div className="text-xs text-zinc-500 font-medium">{registration?.email}</div>
                                {registration?.phone && (
                                    <>
                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                        <div className="text-xs text-zinc-500 font-medium">{registration?.phone}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-zinc-200/50 dark:bg-zinc-800" />

                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Modul Pelatihan
                            </Label>
                            <div className="text-md font-bold text-zinc-800 dark:text-zinc-200">{training?.name}</div>
                        </div>
                    </div>
                </div>

                {/* File Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Lampiran File
                        </Label>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 p-0 hover:bg-transparent" asChild>
                            <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                Buka Full <ExternalLink className="w-3 h-3" />
                            </a>
                        </Button>
                    </div>

                    <div className="aspect-video bg-zinc-100 dark:bg-zinc-950 rounded-2xl border-2 border-zinc-200/50 dark:border-zinc-800 overflow-hidden relative group shadow-inner">
                        {assignment.file_url ? (
                            <iframe
                                src={getPreviewUrl(assignment.file_url)}
                                className="w-full h-full border-none"
                                title="File Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                <FileText className="w-10 h-10 opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest italic">Link tidak valid</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status History */}
                {assignment.status !== 'pending' && (
                    <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all ${assignment.status === 'valid'
                        ? 'bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-900 dark:text-emerald-400'
                        : 'bg-red-500/[0.03] border-red-500/20 text-red-900 dark:text-red-400'
                        }`}>
                        <div className={`p-2 rounded-xl ${assignment.status === 'valid' ? 'bg-emerald-50/50' : 'bg-red-50/50'
                            }`}>
                            {assignment.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <div className="space-y-1">
                            <div className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Status Sekarang</div>
                            <div className="font-bold text-sm tracking-tight">{assignment.status.toUpperCase()}</div>
                            {assignment.feedback && (
                                <>
                                    <div className="h-px bg-current opacity-10 my-2" />
                                    <div className="text-xs font-semibold leading-relaxed">"{assignment.feedback}"</div>
                                </>
                            )}
                            {registration?.certificate_url && (
                                <div className="pt-2">
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-emerald-600 dark:text-emerald-400" asChild>
                                        <a href={registration.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-1">
                                            <ExternalLink className="w-3 h-3" /> Lihat Sertifikat
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Form */}
                {assignment.status === 'pending' && (
                    <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        {isRejecting ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <Label htmlFor="feedback" className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                                        Feedback Penolakan <span className="opacity-50">(Wajib)</span>
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Berikan alasan mengapa tugas ini belum bisa diterima..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="min-h-[120px] rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs h-12 rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                                        onClick={() => handleAction('reject')}
                                        disabled={loading}
                                    >
                                        {loading ? 'Mengirim...' : 'Konfirmasi Tolak'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="font-bold text-xs uppercase tracking-widest h-12 rounded-2xl"
                                        onClick={() => {
                                            setIsRejecting(false)
                                            setFeedback('')
                                        }}
                                        disabled={loading}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all group"
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                >
                                    {loading ? 'Memproses...' : (
                                        <span className="flex items-center gap-2">
                                            Approve <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:border-red-900/50 font-black uppercase tracking-widest text-xs h-14 rounded-2xl transition-all"
                                    onClick={() => setIsRejecting(true)}
                                    disabled={loading}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SheetContent>
    )
}
