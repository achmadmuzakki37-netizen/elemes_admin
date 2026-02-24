'use client'

import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Registration } from '@/types'
import { User, Mail, Building2, Phone, Calendar } from 'lucide-react'

interface ParticipantListDialogProps {
    trainingName: string
    participants: Registration[]
}

export function ParticipantListDialog({ trainingName, participants }: ParticipantListDialogProps) {
    return (
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0 border-none shadow-2xl">
            <DialogHeader className="p-8 bg-zinc-900 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 relative z-10">
                    <User className="w-6 h-6 text-indigo-400" />
                    Daftar Peserta
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium mt-1 relative z-10">
                    Pelatihan: <span className="text-white font-bold">{trainingName}</span>
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-8 bg-white dark:bg-zinc-950 custom-scrollbar">
                {participants.length > 0 ? (
                    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30">
                        <Table>
                            <TableHeader className="bg-zinc-100/50 dark:bg-zinc-800/50">
                                <TableRow className="hover:bg-transparent border-zinc-200/50 dark:border-zinc-700/50">
                                    <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nama Lengkap</TableHead>
                                    <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Kontak</TableHead>
                                    <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Lembaga</TableHead>
                                    <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Tgl Daftar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants.map((p) => (
                                    <TableRow key={p.id} className="group hover:bg-white dark:hover:bg-zinc-900 transition-colors border-zinc-100 dark:border-zinc-800">
                                        <TableCell className="py-4 px-6">
                                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.nama}</div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                                    <Mail className="w-3 h-3 text-zinc-400" /> {p.email}
                                                </div>
                                                {p.phone && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium leading-none">
                                                        <Phone className="w-2.5 h-2.5 text-zinc-400" /> {p.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-semibold italic">
                                                <Building2 className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                {p.lembaga || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-black uppercase">
                                                <Calendar className="w-3 h-3 opacity-50" />
                                                {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center ring-4 ring-zinc-50/50 dark:ring-zinc-900/50">
                            <User className="w-10 h-10 text-zinc-200 dark:text-zinc-800" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">Belum Ada Peserta</h3>
                            <p className="text-sm text-zinc-500 font-medium">Pendaftaran untuk pelatihan ini masih belum tersedia.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 px-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Total: <span className="text-zinc-900 dark:text-zinc-100">{participants.length} Peserta Terdaftar</span>
                </div>
            </div>
        </DialogContent>
    )
}
