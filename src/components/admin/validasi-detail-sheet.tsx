'use client'

import { useState } from 'react'
import { AssignmentWithDetails } from '@/types'
import {
    SheetContent,
    SheetClose,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateAssignmentStatus } from '@/app/(dashboard)/validasi/actions'
import { toast } from 'sonner'
import {
    BookOpen,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    ExternalLink,
    ShieldCheck,
    Clock,
    Mail,
    Phone,
    Building2,
    Award,
    Loader2,
    AlertTriangle,
    X,
} from 'lucide-react'

interface ValidasiDetailSheetProps {
    assignment: AssignmentWithDetails | null
    onSuccess: () => void
}

export function ValidasiDetailSheet({ assignment, onSuccess }: ValidasiDetailSheetProps) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)

    const getData = <T,>(data: T | T[]): T | undefined => {
        if (!data) return undefined
        return Array.isArray(data) ? data[0] : data
    }

    if (!assignment) return null

    const registration = getData(assignment.registrations)
    const training = getData(assignment.trainings)
    const validator = getData(assignment.validator)

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

    const getPreviewUrl = (url: string) => {
        if (!url) return ''
        if (url.includes('drive.google.com')) {
            return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
        }
        return url
    }

    const statusBadge = assignment.status === 'valid'
        ? { label: 'VALID', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-emerald-500/20' }
        : assignment.status === 'invalid'
            ? { label: 'DITOLAK', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 ring-red-500/20' }
            : { label: 'PENDING', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ring-amber-500/20' }

    return (
        <SheetContent
            side="right"
            showCloseButton={false}
            className="p-0 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 overflow-hidden"
            style={{ width: '80vw', maxWidth: '80vw' }}
        >
            {/* Accessible Title (visually hidden) */}
            <SheetTitle className="sr-only">Review Tugas Peserta</SheetTitle>
            <SheetDescription className="sr-only">Panel review dan validasi tugas peserta</SheetDescription>

            {/* Top Bar */}
            <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Review Tugas</h2>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${statusBadge.cls}`}>
                        {statusBadge.label}
                    </span>
                    {assignment.created_at && (
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(assignment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                        <X className="w-5 h-5" />
                    </Button>
                </SheetClose>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 3.5rem)' }}>

                {/* ── LEFT COLUMN ── */}
                <div className="overflow-y-auto p-6 space-y-5 custom-scrollbar" style={{ flex: '0 0 62%' }}>

                    {/* Data Peserta - compact */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-white font-black text-lg shadow-lg shadow-emerald-500/20">
                                {registration?.nama?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                    {registration?.nama}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    {registration?.lembaga && (
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Building2 className="w-3 h-3 opacity-60" /> {registration.lembaga}
                                        </span>
                                    )}
                                    {registration?.email && (
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Mail className="w-3 h-3 opacity-60" /> {registration.email}
                                        </span>
                                    )}
                                    {registration?.phone && (
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Phone className="w-3 h-3 opacity-60" /> {registration.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modul */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Modul Pelatihan</div>
                            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{training?.name}</div>
                        </div>
                    </div>

                    {/* Lampiran Preview - scrollable */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Lampiran Tugas
                            </h3>
                            {assignment.file_url && (
                                <a
                                    href={assignment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                                >
                                    Buka di Tab Baru <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '300px' }}>
                                {assignment.file_url ? (
                                    <iframe
                                        src={getPreviewUrl(assignment.file_url)}
                                        className="w-full h-full border-none"
                                        title="File Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                        <FileText className="w-10 h-10 opacity-20" />
                                        <span className="text-xs font-semibold">File tidak tersedia</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── Sticky Panel ── */}
                <div className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto custom-scrollbar" style={{ flex: '0 0 38%' }}>
                    <div className="sticky top-0 p-6 space-y-6">

                        {/* Status Section */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Status Verifikasi</h3>
                            {assignment.status === 'pending' ? (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400">Menunggu Review</div>
                                        <div className="text-[11px] text-amber-600/70 dark:text-amber-400/60 font-medium mt-0.5">Tugas belum diverifikasi</div>
                                    </div>
                                </div>
                            ) : assignment.status === 'valid' ? (
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Disetujui</div>
                                            <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 font-medium">Tugas dinyatakan lulus</div>
                                        </div>
                                    </div>
                                    {validator?.full_name && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                            Oleh: <strong>{validator.full_name}</strong>
                                        </div>
                                    )}
                                    {registration?.certificate_url && (
                                        <Button variant="default" size="sm" className="w-full h-9 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" asChild>
                                            <a href={registration.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                <Award className="w-3.5 h-3.5" /> Sertifikat
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 shadow-md">
                                            <XCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-red-700 dark:text-red-400">Ditolak</div>
                                            <div className="text-[11px] text-red-600/70 dark:text-red-400/60 font-medium">Perlu perbaikan</div>
                                        </div>
                                    </div>
                                    {validator?.full_name && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg">
                                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                            Oleh: <strong>{validator.full_name}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Feedback display (for non-pending) */}
                        {assignment.feedback && assignment.status !== 'pending' && (
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Catatan</h3>
                                <div className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    &ldquo;{assignment.feedback}&rdquo;
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        {assignment.status === 'pending' && (
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                        )}

                        {/* Action Buttons (only for pending) */}
                        {assignment.status === 'pending' && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tindakan</h3>

                                {!isRejecting ? (
                                    <div className="space-y-3">
                                        <Button
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-emerald-500/15 transition-all"
                                            onClick={() => handleAction('approve')}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</span>
                                            ) : (
                                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approve Tugas</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:border-red-800 font-bold text-xs h-11 rounded-xl transition-all"
                                            onClick={() => setIsRejecting(true)}
                                            disabled={loading}
                                        >
                                            <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Reject Tugas</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">Berikan alasan penolakan</span>
                                        </div>

                                        <Textarea
                                            id="feedback"
                                            placeholder="Tuliskan alasan penolakan..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="min-h-[100px] rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-red-500/30 focus-visible:border-red-400 transition-all text-sm font-medium resize-none"
                                        />

                                        <Button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-red-500/15 transition-all"
                                            onClick={() => handleAction('reject')}
                                            disabled={loading || !feedback.trim()}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</span>
                                            ) : (
                                                <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Konfirmasi Tolak</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full font-bold text-xs h-9 rounded-xl text-zinc-500"
                                            onClick={() => { setIsRejecting(false); setFeedback('') }}
                                            disabled={loading}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SheetContent>
    )
}
