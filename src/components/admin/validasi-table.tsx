'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { AssignmentWithDetails, Category, Training } from '@/types'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    Search,
    X,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    UserCheck
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet } from '@/components/ui/sheet'
import { ValidasiDetailSheet } from './validasi-detail-sheet'
import { useRouter } from 'next/navigation'

interface ValidasiTableProps {
    assignments: AssignmentWithDetails[]
    categories: Category[]
    trainings: Training[]
}

export function ValidasiTable({ assignments, categories, trainings }: ValidasiTableProps) {
    const router = useRouter()

    useEffect(() => {
        const channel = supabase.channel('realtime:assignments')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'assignments' },
                () => {
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])
    const [itemsPerPage, setItemsPerPage] = useState<string>('10')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedTraining, setSelectedTraining] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all') // Default to all as requested
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Helper untuk normalisasi data dari Supabase (bisa berupa objek atau array)
    const getData = <T,>(data: T | T[]): T | undefined => {
        if (!data) return undefined
        return Array.isArray(data) ? data[0] : data
    }

    // Filter trainings based on selected category
    const filteredTrainingList = useMemo(() => {
        if (selectedCategory === 'all') return trainings
        return trainings.filter(t => t.category_id === selectedCategory)
    }, [trainings, selectedCategory])

    const filteredAssignments = useMemo(() => {
        return assignments.filter(item => {
            const registration = getData(item.registrations)
            const training = getData(item.trainings)

            const matchesSearch =
                (registration?.nama?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (registration?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (registration?.lembaga?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (training?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())

            const matchesCategory =
                selectedCategory === 'all' ||
                training?.category_id === selectedCategory

            const matchesTraining =
                selectedTraining === 'all' ||
                item.training_id === selectedTraining

            const matchesStatus =
                selectedStatus === 'all' ||
                item.status === selectedStatus

            return matchesSearch && matchesCategory && matchesTraining && matchesStatus
        })
    }, [assignments, searchTerm, selectedCategory, selectedTraining, selectedStatus])

    const isAll = itemsPerPage === 'all'
    const take = isAll ? filteredAssignments.length : parseInt(itemsPerPage)
    const totalPages = Math.ceil(filteredAssignments.length / take)

    const startIndex = (currentPage - 1) * take
    const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + take)

    const handleReset = () => {
        setSearchTerm('')
        setSelectedCategory('all')
        setSelectedTraining('all')
        setSelectedStatus('pending')
        setCurrentPage(1)
    }

    const handleSuccess = () => {
        setIsSheetOpen(false)
        router.refresh() // Refetch data from server
    }

    return (
        <Card className="flex-1 flex flex-col border-none shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 bg-white dark:bg-zinc-950 overflow-hidden ring-1 ring-zinc-200/50 dark:ring-zinc-800 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 z-40" />

            {/* Table Tools */}
            <div className="shrink-0 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 bg-white dark:bg-zinc-950 z-30">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Cari nama peserta atau pelatihan..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-11 bg-zinc-50 dark:bg-zinc-900/50 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus-visible:ring-emerald-500 transition-all rounded-xl h-11 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 py-1 overflow-x-auto no-scrollbar">
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedTraining('all'); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[160px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedTraining} onValueChange={(v) => { setSelectedTraining(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[200px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                            <SelectValue placeholder="Pelatihan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Pelatihan</SelectItem>
                            {filteredTrainingList.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[140px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="valid">Valid</SelectItem>
                            <SelectItem value="invalid">Invalid</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedTraining !== 'all') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                            className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-full shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <CardContent className="p-0 flex-1 overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20">
                            <tr className="hover:bg-transparent border-none">
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 py-4 px-6 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Nama Peserta</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Email</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Modul Pelatihan</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Tanggal Kirim</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Status</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-xs uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <TableBody>
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                {paginatedAssignments.map((item) => {
                                    const registration = getData(item.registrations)
                                    const training = getData(item.trainings)

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300 border-zinc-100 dark:border-zinc-800 cursor-pointer"
                                            onClick={() => { setSelectedAssignment(item); setIsSheetOpen(true); }}
                                        >
                                            <TableCell className="px-6 py-5">
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] tracking-tight leading-tight">{registration?.nama}</div>
                                                {registration?.lembaga && (
                                                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{registration?.lembaga}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{registration?.email}</div>
                                                {registration?.phone && (
                                                    <div className="text-[11px] text-zinc-400 font-medium mt-0.5">{registration?.phone}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">{training?.name}</div>
                                                <span className="text-[9px] font-black tracking-[0.1em] uppercase text-zinc-400">
                                                    {categories.find(c => c.id === training?.category_id)?.title}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-zinc-500 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs">
                                                        {item.created_at
                                                            ? new Date(item.created_at).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.status === 'pending' && (
                                                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-amber-200/50 dark:ring-amber-900/50">
                                                        PENDING
                                                    </span>
                                                )}
                                                {item.status === 'valid' && (
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-200/50 dark:ring-emerald-900/50 flex items-center gap-1.5 w-fit">
                                                        <CheckCircle2 className="w-3 h-3" /> VALID
                                                    </span>
                                                )}
                                                {item.status === 'invalid' && (
                                                    <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-red-200/50 dark:ring-red-900/50 flex items-center gap-1.5 w-fit">
                                                        <XCircle className="w-3 h-3" /> INVALID
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" className="h-9 font-bold text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg">
                                                    Periksa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}

                                <ValidasiDetailSheet
                                    assignment={selectedAssignment}
                                    onSuccess={handleSuccess}
                                />
                            </Sheet>
                        </TableBody>
                    </table>

                    {filteredAssignments.length === 0 && (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <UserCheck className="w-8 h-8 text-zinc-300" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tighter">Antrean Kosong</h3>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                    Tidak ada tugas yang perlu divalidasi saat ini untuk kriteria yang dipilih.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleReset} className="font-bold text-[10px] uppercase tracking-widest">
                                Reset Filter
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span>Tampilkan</span>
                        <Select value={itemsPerPage} onValueChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-16 h-8 bg-zinc-50 dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="all">Semua</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!isAll && totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronFirst className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(c => c - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
                            <span className="text-xs font-bold px-3 min-w-[80px] text-center">Hal {currentPage} / {totalPages}</span>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(c => c + 1)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronLast className="w-4 h-4" /></Button>
                        </div>
                    )}

                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Total: {filteredAssignments.length} Tugas
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
