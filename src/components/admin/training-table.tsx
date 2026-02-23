'use client'

import { useState, useMemo } from 'react'
import { Training, Category } from '@/types'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Clock, FileWarning, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, SlidersHorizontal, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training-form'
import { DeleteTrainingButton } from '@/components/admin/delete-training-button'
import { RegistrationToggle } from '@/components/admin/registration-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'

const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

interface TrainingTableProps {
    trainings: Training[]
    categories: Category[]
}

export function TrainingTable({ trainings, categories }: TrainingTableProps) {
    const [itemsPerPage, setItemsPerPage] = useState<string>('10')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedAccess, setSelectedAccess] = useState<string>('all')
    const [selectedMonth, setSelectedMonth] = useState<string>('all')

    const filteredTrainings = useMemo(() => {
        return trainings.filter(training => {
            const matchesSearch = training.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                categories.find(c => c.id === training.category_id)?.title.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = selectedCategory === 'all' || training.category_id === selectedCategory
            const matchesAccess = selectedAccess === 'all' ||
                (selectedAccess === 'paid' ? training.is_paid : !training.is_paid)
            const matchesMonth = selectedMonth === 'all' || training.month_index === parseInt(selectedMonth)

            return matchesSearch && matchesCategory && matchesAccess && matchesMonth
        })
    }, [trainings, searchTerm, categories, selectedCategory, selectedAccess, selectedMonth])

    const isAll = itemsPerPage === 'all'
    const take = isAll ? filteredTrainings.length : parseInt(itemsPerPage)
    const totalPages = Math.ceil(filteredTrainings.length / take)

    // Reset to page 1 if items per page or search changes
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(value)
        setCurrentPage(1)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * take
    const paginatedTrainings = filteredTrainings.slice(startIndex, startIndex + take)

    if (trainings.length === 0) {
        return (
            <div className="h-[450px] flex flex-col items-center justify-center max-w-sm mx-auto space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xl">
                        <FileWarning className="w-10 h-10 text-emerald-500" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">Katalog Masih Kosong</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        Belum ada pelatihan yang ditambahkan. Mulai bangun kurikulum profesional Anda sekarang.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full shadow-xl transition-all font-bold px-8 h-12">
                            <Plus className="mr-2 h-5 w-5" /> Buat Modul Pertama
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Tambah Pelatihan Baru</DialogTitle>
                            <DialogDescription>Lengkapi detail informasi pelatihan di bawah ini.</DialogDescription>
                        </DialogHeader>
                        <TrainingForm categories={categories} />
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <Card className="flex-1 flex flex-col border-none shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 bg-white dark:bg-zinc-950 overflow-hidden ring-1 ring-zinc-200/50 dark:ring-zinc-800 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 z-40" />

            {/* Table Tools */}
            {/* Table Tools */}
            <div className="shrink-0 px-6 py-0 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-zinc-950 z-30">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Cari nama pelatihan atau kategori..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-11 bg-zinc-50 dark:bg-zinc-900/50 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus-visible:ring-emerald-500 transition-all rounded-xl h-11 text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 shrink-0 py-4 overflow-x-auto no-scrollbar">
                    {/* Inline Filters */}
                    <div className="flex items-center gap-2 pr-2 border-r border-zinc-100 dark:border-zinc-800 mr-1">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[140px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>{category.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedAccess} onValueChange={setSelectedAccess}>
                            <SelectTrigger className="w-[110px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                                <SelectValue placeholder="Akses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Akses</SelectItem>
                                <SelectItem value="free">Gratis</SelectItem>
                                <SelectItem value="paid">Premium</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[110px] h-9 text-xs font-bold border-none bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
                                <SelectValue placeholder="Bulan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl h-[250px]">
                                <SelectItem value="all">Semua Bulan</SelectItem>
                                {INDONESIAN_MONTHS.map((month, index) => (
                                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(selectedCategory !== 'all' || selectedAccess !== 'all' || selectedMonth !== 'all') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSelectedCategory('all')
                                    setSelectedAccess('all')
                                    setSelectedMonth('all')
                                }}
                                className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold shrink-0">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Pelatihan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Tambah Pelatihan Baru</DialogTitle>
                                <DialogDescription>Lengkapi detail informasi pelatihan di bawah ini.</DialogDescription>
                            </DialogHeader>
                            <TrainingForm categories={categories} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <CardContent className="p-0 flex-1 overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20">
                            <tr className="hover:bg-transparent border-none">
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 py-4 px-6 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Nama & Modul</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Kategori</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Akses</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left text-xs uppercase tracking-wider">Bulan</th>
                                <th className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6 h-14 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-xs uppercase tracking-wider">Tindakan</th>
                            </tr>
                        </thead>
                        <TableBody>
                            {paginatedTrainings.map((training) => (
                                <TableRow
                                    key={training.id}
                                    className="group hover:bg-white dark:hover:bg-zinc-900 even:bg-slate-100/50 dark:even:bg-white/[0.04] transition-all duration-300 border-zinc-100 dark:border-zinc-800 cursor-default hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 hover:relative hover:z-10"
                                >
                                    <TableCell className="px-6 py-5">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] tracking-tight leading-tight">{training.name}</div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {training.duration}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 shadow-sm">
                                            {categories.find(c => c.id === training.category_id)?.title || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {training.is_paid ? (
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                    PREMIUM
                                                </span>
                                                <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1">
                                                    Rp {training.price.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                    GRATIS
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                                            {INDONESIAN_MONTHS[training.month_index] || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <RegistrationToggle training={training} />
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-zinc-400 transition-colors rounded-lg">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold">Edit Detail Pelatihan</DialogTitle>
                                                        <DialogDescription>Perbarui informasi pelatihan yang dipilih.</DialogDescription>
                                                    </DialogHeader>
                                                    <TrainingForm categories={categories} training={training} />
                                                </DialogContent>
                                            </Dialog>

                                            <DeleteTrainingButton id={training.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTrainings.length === 0 && (searchTerm || selectedCategory !== 'all' || selectedAccess !== 'all' || selectedMonth !== 'all') && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[350px] text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto">
                                            <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-200 dark:ring-zinc-800">
                                                <Filter className="w-8 h-8 text-zinc-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kriteria Tidak Ditemukan</h3>
                                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                                    Tidak ada pelatihan yang sesuai dengan kriteria filter atau pencarian Anda.
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchTerm('')
                                                    setSelectedCategory('all')
                                                    setSelectedAccess('all')
                                                    setSelectedMonth('all')
                                                }}
                                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                                            >
                                                Atur Ulang Semua
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {/* Pagination Controls */}
                <div className="px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 min-h-[64px]">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <span>Tampilkan</span>
                        <Select value={itemsPerPage} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-[80px] h-9 bg-zinc-50 dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="all">Semua</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>baris</span>
                    </div>

                    {!isAll && totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-zinc-500 mr-2 font-medium">
                                Halaman <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentPage}</span> dari <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronFirst className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronLast className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-zinc-500 font-medium font-mono tabular-nums">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + 1, filteredTrainings.length)}</span> - <span className="font-bold text-zinc-900 dark:text-zinc-100">{Math.min(startIndex + take, filteredTrainings.length)}</span> dari <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredTrainings.length}</span> pelatihan
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
