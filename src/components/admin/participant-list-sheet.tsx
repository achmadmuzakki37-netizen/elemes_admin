'use client'

import { useState, useMemo } from 'react'
import {
    SheetContent,
    SheetClose,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Registration, Assignment } from '@/types'
import {
    Users,
    Mail,
    Building2,
    Phone,
    Calendar,
    Search,
    FilterX,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    BookOpen,
    FileDown,
    FileText,
    FileSpreadsheet,
    FileMinus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ParticipantListSheetProps {
    trainingName: string
    participants: Registration[]
    assignments: Assignment[]
}

const ITEMS_PER_PAGE = 10

type TaskStatus = 'in_progress' | 'pending' | 'valid' | 'invalid'

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; cls: string }> = {
    in_progress: {
        label: 'Progress',
        icon: Loader2,
        cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ring-zinc-300/30 dark:ring-zinc-700/30',
    },
    pending: {
        label: 'Pending',
        icon: Clock,
        cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-amber-500/20',
    },
    valid: {
        label: 'Valid',
        icon: CheckCircle2,
        cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-emerald-500/20',
    },
    invalid: {
        label: 'Invalid',
        icon: XCircle,
        cls: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-red-500/20',
    },
}

export function ParticipantListSheet({ trainingName, participants, assignments }: ParticipantListSheetProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Build a map: registration_id -> assignment status
    const assignmentStatusMap = useMemo(() => {
        const map = new Map<string, TaskStatus>()
        for (const a of assignments) {
            map.set(a.registration_id, a.status as TaskStatus)
        }
        return map
    }, [assignments])

    const getParticipantStatus = (registrationId: string): TaskStatus => {
        const status = assignmentStatusMap.get(registrationId)
        if (!status || !statusConfig[status]) return 'in_progress'
        return status
    }

    const filteredParticipants = useMemo(() => {
        return participants.filter(p =>
            p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.lembaga && p.lembaga.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [participants, searchQuery])

    const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE))
    const paginatedParticipants = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredParticipants.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredParticipants, currentPage])

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    // Stats for this training
    const statusCounts = useMemo(() => {
        const counts = { in_progress: 0, pending: 0, valid: 0, invalid: 0 }
        for (const p of participants) {
            const status = getParticipantStatus(p.id)
            if (counts[status] !== undefined) {
                counts[status]++
            } else {
                counts.in_progress++
            }
        }
        return counts
    }, [participants, assignmentStatusMap])

    // ── Export Logic ──
    const getExportData = () => {
        return filteredParticipants.map((p, index) => ({
            'No': index + 1,
            'Nama': p.nama,
            'Email': p.email,
            'WhatsApp': p.phone || '-',
            'Lembaga': p.lembaga || '-',
            'Status Tugas': statusConfig[getParticipantStatus(p.id)]?.label || 'Progress',
            'Tanggal Daftar': p.registered_at
                ? new Date(p.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : '-'
        }))
    }

    const exportToCSV = () => {
        const data = getExportData()
        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `Peserta_${trainingName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToExcel = () => {
        const data = getExportData()
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Peserta')

        // Setting column widths
        const wscols = [
            { wch: 5 },  // No
            { wch: 30 }, // Nama
            { wch: 30 }, // Email
            { wch: 15 }, // WhatsApp
            { wch: 25 }, // Lembaga
            { wch: 15 }, // Status Tugas
            { wch: 20 }, // Tanggal Daftar
        ]
        worksheet['!cols'] = wscols

        XLSX.writeFile(workbook, `Peserta_${trainingName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const exportToPDF = () => {
        const doc = new jsPDF()
        const data = getExportData()
        const tableColumn = Object.keys(data[0])
        const tableRows = data.map(item => Object.values(item))

        doc.setFontSize(16)
        doc.text('Daftar Peserta Pelatihan', 14, 15)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Modul: ${trainingName}`, 14, 22)
        doc.text(`Total Peserta: ${participants.length}`, 14, 28)
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // Emerald-500
            alternateRowStyles: { fillColor: [249, 250, 251] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { top: 40 },
        })

        doc.save(`Peserta_${trainingName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    }

    return (
        <SheetContent
            side="right"
            showCloseButton={false}
            className="p-0 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 overflow-hidden"
            style={{ width: '80vw', maxWidth: '80vw' }}
        >
            <SheetTitle className="sr-only">Daftar Peserta {trainingName}</SheetTitle>
            <SheetDescription className="sr-only">List peserta untuk modul {trainingName}</SheetDescription>

            {/* Top Bar */}
            <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Daftar Peserta</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">·</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[300px]">{trainingName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 bg-emerald-50 text-emerald-600 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {participants.length} peserta
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Export Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all font-bold">
                                <FileDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Export Data</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                            <DropdownMenuItem
                                onClick={exportToCSV}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                Export ke CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={exportToExcel}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Export ke Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={exportToPDF}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                            >
                                <FileMinus className="w-4 h-4" />
                                Export ke PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Cari peserta..."
                            className="h-9 w-64 pl-11 pr-4 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                            <X className="w-5 h-5" />
                        </Button>
                    </SheetClose>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex overflow-hidden" style={{ height: 'calc(100% - 3.5rem)' }}>

                {/* LEFT COLUMN — Table */}
                <div className="flex flex-col overflow-hidden" style={{ flex: '0 0 73%' }}>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {filteredParticipants.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                            <TableHead className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Nama</TableHead>
                                            <TableHead className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Kontak</TableHead>
                                            <TableHead className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Lembaga</TableHead>
                                            <TableHead className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tgl Registrasi</TableHead>
                                            <TableHead className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status Tugas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedParticipants.map((p) => {
                                            const status = getParticipantStatus(p.id)
                                            const config = statusConfig[status] || statusConfig.in_progress
                                            const StatusIcon = config.icon

                                            return (
                                                <TableRow key={p.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-zinc-100 dark:border-zinc-800">
                                                    <TableCell className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md">
                                                                {p.nama[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                                {p.nama}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 px-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                                                <Mail className="w-3 h-3 opacity-50" /> {p.email}
                                                            </span>
                                                            {p.phone && (
                                                                <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                                                                    <Phone className="w-3 h-3 opacity-50" /> {p.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 px-5">
                                                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                                                            <Building2 className="w-3 h-3 opacity-50" /> {p.lembaga || '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 px-5">
                                                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3 opacity-50" />
                                                            {p.registered_at
                                                                ? new Date(p.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 px-5">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ring-1 text-[11px] font-bold ${config.cls}`}>
                                                            <StatusIcon className={cn("w-3.5 h-3.5", status === 'in_progress' && 'animate-spin')} />
                                                            {config.label}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <FilterX className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Tidak Ada Data</h3>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {searchQuery
                                            ? `Pencarian "${searchQuery}" tidak ditemukan.`
                                            : 'Belum ada peserta untuk modul ini.'}
                                    </p>
                                    {searchQuery && (
                                        <Button
                                            variant="link"
                                            className="text-emerald-600 font-bold p-0 h-auto text-sm mt-2"
                                            onClick={() => { setSearchQuery(''); setCurrentPage(1) }}
                                        >
                                            Reset Pencarian
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {filteredParticipants.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                            <p className="text-xs text-zinc-500 font-medium">
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">{paginatedParticipants.length}</span> dari <span className="font-bold text-zinc-700 dark:text-zinc-300">{filteredParticipants.length}</span> peserta
                            </p>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-400" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-400" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <Button
                                                key={page}
                                                variant="ghost"
                                                className={cn(
                                                    "w-8 h-8 rounded-lg font-bold text-xs transition-all",
                                                    currentPage === page
                                                        ? "bg-emerald-600 text-white shadow-md"
                                                        : "text-zinc-400 hover:text-zinc-600"
                                                )}
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    } else if (
                                        (page === 2 && currentPage > 3) ||
                                        (page === totalPages - 1 && currentPage < totalPages - 2)
                                    ) {
                                        return <span key={page} className="text-zinc-300 text-xs px-1">...</span>
                                    }
                                    return null
                                })}

                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-400" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-400" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                                    <ChevronsRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Stats Panel */}
                <div className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto custom-scrollbar" style={{ flex: '0 0 27%' }}>
                    <div className="p-6 space-y-6">

                        {/* Modul Header */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Modul Pelatihan</h3>
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{trainingName}</div>
                                        <div className="text-[11px] text-zinc-400 font-medium">{participants.length} peserta terdaftar</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                        {/* Status Overview */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Status Tugas</h3>
                            <div className="space-y-2.5">
                                {(Object.entries(statusConfig) as [TaskStatus, typeof statusConfig[TaskStatus]][]).map(([key, config]) => {
                                    const count = statusCounts[key]
                                    const percentage = participants.length > 0 ? Math.round((count / participants.length) * 100) : 0
                                    const StatusIcon = config.icon

                                    return (
                                        <div key={key} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.cls}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{config.label}</span>
                                                </div>
                                                <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{count}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        key === 'valid' && 'bg-emerald-500',
                                                        key === 'invalid' && 'bg-red-500',
                                                        key === 'pending' && 'bg-amber-500',
                                                        key === 'in_progress' && 'bg-zinc-400',
                                                    )}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-medium mt-1">{percentage}% dari total</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                        {/* Summary */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Ringkasan</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center">
                                    <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{participants.length}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">Total</div>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{statusCounts.valid}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">Lulus</div>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-center">
                                    <div className="text-xl font-black text-amber-700 dark:text-amber-400">{statusCounts.pending}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60 mt-0.5">Pending</div>
                                </div>
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center">
                                    <div className="text-xl font-black text-red-700 dark:text-red-400">{statusCounts.invalid}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-red-600/60 dark:text-red-400/60 mt-0.5">Ditolak</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SheetContent>
    )
}
