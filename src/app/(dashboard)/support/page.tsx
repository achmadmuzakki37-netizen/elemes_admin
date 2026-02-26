'use client'

import { useState } from 'react'
import {
    LifeBuoy,
    ChevronDown,
    Mail,
    Phone,
    MessageCircle,
    BookOpen,
    Users,
    CheckSquare,
    ClipboardList,
    UserPlus,
    GraduationCap,
    MonitorSmartphone,
    Search,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
    question: string
    answer: string
}

interface FAQSection {
    id: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    color: string
    items: FAQItem[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQ_SECTIONS: FAQSection[] = [
    {
        id: 'pelatihan',
        icon: BookOpen,
        title: 'Manajemen Pelatihan',
        color: 'emerald',
        items: [
            {
                question: 'Bagaimana cara menambahkan pelatihan baru?',
                answer:
                    'Buka halaman Pelatihan dari sidebar, lalu klik tombol "+ Tambah Pelatihan". Isi formulir dengan judul, kategori (TK/SD/SMP/SMA), deskripsi, durasi, dan banner. Klik Simpan untuk menyimpan data pelatihan.',
            },
            {
                question: 'Bagaimana cara mengedit atau menghapus pelatihan?',
                answer:
                    'Dari tabel daftar pelatihan, klik ikon edit (pensil) untuk mengubah data, atau ikon hapus (tempat sampah) untuk menghapus pelatihan. Konfirmasi aksi penghapusan pada dialog yang muncul.',
            },
            {
                question: 'Apa saja kategori pelatihan yang tersedia?',
                answer:
                    'Sistem mendukung empat kategori tingkat pendidikan: TK (Taman Kanak‑Kanak), SD (Sekolah Dasar), SMP (Sekolah Menengah Pertama), dan SMA (Sekolah Menengah Atas). Setiap pelatihan harus dimasukkan ke salah satu kategori.',
            },
            {
                question: 'Bagaimana cara menambahkan banner pada pelatihan?',
                answer:
                    'Saat membuat atau mengedit pelatihan, terdapat field Banner. Unggah gambar berformat JPG, PNG, atau WebP dengan ukuran maksimal 2 MB. Banner akan ditampilkan pada kartu pelatihan di sisi peserta (LMS Client).',
            },
        ],
    },
    {
        id: 'validasi',
        icon: CheckSquare,
        title: 'Validasi Tugas Peserta',
        color: 'amber',
        items: [
            {
                question: 'Bagaimana cara memvalidasi tugas peserta?',
                answer:
                    'Buka halaman Validasi dari sidebar. Pilih status "Menunggu" untuk melihat tugas yang belum ditinjau. Klik nama peserta untuk membuka detail, unduh file tugasnya, lalu pilih Setujui atau Tolak beserta komentar.',
            },
            {
                question: 'Apa yang terjadi setelah tugas disetujui?',
                answer:
                    'Setelah disetujui, status peserta pada pelatihan tersebut berubah menjadi "Lulus". Peserta akan mendapatkan notifikasi dan dapat mengunduh sertifikat kelulusan secara otomatis dari portal LMS Client.',
            },
            {
                question: 'Bisakah saya menolak tugas dan meminta revisi?',
                answer:
                    'Ya. Pilih opsi Tolak dan isi kolom komentar dengan catatan revisi yang dibutuhkan. Peserta akan menerima notifikasi dan dapat mengunggah ulang tugas yang sudah diperbaiki.',
            },
        ],
    },
    {
        id: 'peserta',
        icon: Users,
        title: 'Status & Data Peserta',
        color: 'sky',
        items: [
            {
                question: 'Bagaimana cara melihat data semua peserta?',
                answer:
                    'Buka halaman Peserta dari sidebar. Data ditampilkan berdasarkan kategori tingkat pendidikan. Klik kartu pelatihan untuk melihat daftar peserta yang terdaftar, lengkap dengan StatusRow dan kemajuan tugas mereka.',
            },
            {
                question: 'Apa saja status yang mungkin dimiliki peserta?',
                answer:
                    'Ada empat status: Terdaftar (baru mendaftar), Sedang Belajar (sudah mengakses materi), Menunggu Validasi (tugas sudah dikumpulkan), dan Lulus (tugas telah disetujui admin).',
            },
            {
                question: 'Bagaimana cara mencari peserta tertentu?',
                answer:
                    'Gunakan fitur pencarian di bagian atas tabel peserta. Anda dapat mencari berdasarkan nama, email, atau status. Filter tambahan juga tersedia per pelatihan dan per kategori.',
            },
            {
                question: 'Apakah admin dapat mengunduh data peserta?',
                answer:
                    'Ya. Pada halaman Peserta, tersedia tombol Ekspor yang akan mengunduh data peserta dalam format CSV/Excel, berisi informasi nama, email, pelatihan yang diikuti, dan status terkini.',
            },
        ],
    },
    {
        id: 'lms-client',
        icon: MonitorSmartphone,
        title: 'Mengoperasikan LMS Client',
        color: 'rose',
        items: [
            {
                question: 'Apa itu LMS Client dan bagaimana cara mengaksesnya?',
                answer:
                    'LMS Client adalah portal pembelajaran yang digunakan oleh peserta. Aksesnya melalui URL terpisah dari dashboard admin. Peserta login menggunakan akun yang mereka daftarkan, lalu dapat mengikuti pelatihan yang tersedia.',
            },
            {
                question: 'Bagaimana peserta mendaftar pelatihan di LMS Client?',
                answer:
                    'Setelah login ke LMS Client, peserta membuka halaman Pelatihan, pilih kategori yang sesuai, lalu klik Daftar pada pelatihan yang diminati. Status pendaftaran akan langsung muncul di dashboard admin.',
            },
            {
                question: 'Bagaimana cara peserta mengumpulkan tugas?',
                answer:
                    'Di dalam halaman pelatihan pada LMS Client, terdapat tab Tugas. Peserta mengunggah file tugas (PDF/DOCX/ZIP, maks. 10 MB) dan klik Kirim. Tugas akan masuk ke antrian validasi admin.',
            },
            {
                question: 'Bagaimana peserta mengunduh sertifikat kelulusan?',
                answer:
                    'Setelah tugas disetujui oleh admin, peserta dapat membuka halaman Sertifikat di LMS Client. Klik tombol Unduh Sertifikat untuk mendapatkan sertifikat dalam format PDF yang sudah ditandatangani digital.',
            },
        ],
    },
    {
        id: 'tugas',
        icon: ClipboardList,
        title: 'Pengumpulan Tugas & Sertifikat',
        color: 'teal',
        items: [
            {
                question: 'Format file apa saja yang diterima untuk tugas?',
                answer:
                    'Format yang diterima: PDF, DOCX, DOC, ZIP, RAR, dan PNG/JPG untuk tugas berbentuk foto. Ukuran maksimum per file adalah 10 MB.',
            },
            {
                question: 'Berapa lama proses validasi tugas?',
                answer:
                    'Proses validasi dilakukan oleh admin. Tidak ada batas waktu otomatis, namun disarankan admin meninjau tugas dalam 1–3 hari kerja setelah tugas dikirim.',
            },
            {
                question: 'Sertifikat apa yang diterima peserta setelah lulus?',
                answer:
                    'Peserta mendapatkan sertifikat kelulusan digital (PDF) yang berisi nama peserta, nama pelatihan, kategori, dan tanggal kelulusan. Sertifikat dapat diverifikasi melalui QR code yang tertanam di dalamnya.',
            },
        ],
    },
    {
        id: 'akun',
        icon: UserPlus,
        title: 'Manajemen Akun & Profil',
        color: 'orange',
        items: [
            {
                question: 'Bagaimana cara peserta mendaftar akun baru?',
                answer:
                    'Peserta membuka halaman registrasi LMS Client dan mengisi nama lengkap, email, dan password. Setelah verifikasi email, akun langsung aktif dan peserta dapat mendaftar pelatihan.',
            },
            {
                question: 'Bagaimana admin mengubah profil dan password?',
                answer:
                    'Buka halaman Profil dari sidebar dashboard admin. Tab pertama berisi informasi pribadi (nama, email, foto), sedangkan tab Keamanan digunakan untuk mengubah password.',
            },
            {
                question: 'Apa yang dilakukan jika peserta lupa password?',
                answer:
                    'Peserta dapat menggunakan fitur Lupa Password pada halaman login LMS Client. Link reset password akan dikirim ke email terdaftar dan berlaku selama 1 jam.',
            },
        ],
    },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; pill: string }> = {
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-800/40',
        pill: 'bg-emerald-500',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-800/40',
        pill: 'bg-amber-500',
    },
    sky: {
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        border: 'border-sky-200 dark:border-sky-800',
        text: 'text-sky-700 dark:text-sky-400',
        badge: 'bg-sky-100 dark:bg-sky-800/40',
        pill: 'bg-sky-500',
    },
    rose: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-200 dark:border-rose-800',
        text: 'text-rose-700 dark:text-rose-400',
        badge: 'bg-rose-100 dark:bg-rose-800/40',
        pill: 'bg-rose-500',
    },
    teal: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800',
        text: 'text-teal-700 dark:text-teal-400',
        badge: 'bg-teal-100 dark:bg-teal-800/40',
        pill: 'bg-teal-500',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-700 dark:text-orange-400',
        badge: 'bg-orange-100 dark:bg-orange-800/40',
        pill: 'bg-orange-500',
    },
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FAQAccordionItem({ item, isOpen, onToggle }: {
    item: FAQItem
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div className={`border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden transition-all duration-200 ${isOpen ? 'shadow-sm' : ''}`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 leading-snug">
                    {item.question}
                </span>
                <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-5 pb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    {item.answer}
                </div>
            )}
        </div>
    )
}

function FAQSectionBlock({ section, searchQuery }: { section: FAQSection; searchQuery: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const Icon = section.icon
    const colors = colorMap[section.color]

    const filteredItems = searchQuery
        ? section.items.filter(
            (item) =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : section.items

    if (filteredItems.length === 0) return null

    return (
        <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-inherit">
                <div className={`p-1.5 rounded-lg ${colors.badge}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <h2 className={`font-bold text-sm tracking-wide uppercase ${colors.text}`}>
                    {section.title}
                </h2>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.pill} text-white`}>
                    {filteredItems.length}
                </span>
            </div>

            {/* FAQ Items */}
            <div className="p-4 space-y-2 bg-white dark:bg-zinc-900/60">
                {filteredItems.map((item, idx) => (
                    <FAQAccordionItem
                        key={idx}
                        item={item}
                        isOpen={openIndex === idx}
                        onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Contact Card ──────────────────────────────────────────────────────────────

function ContactCard({
    icon: Icon,
    label,
    value,
    href,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    href: string
    color: string
}) {
    const colors = colorMap[color]
    return (
        <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200 group`}
        >
            <div className={`p-2.5 rounded-xl ${colors.badge} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {label}
                </p>
                <p className={`text-sm font-semibold ${colors.text} truncate`}>{value}</p>
            </div>
        </a>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const totalFAQs = FAQ_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)
    const visibleCount = FAQ_SECTIONS.reduce((acc, s) => {
        if (!searchQuery) return acc + s.items.length
        return (
            acc +
            s.items.filter(
                (item) =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ).length
        )
    }, 0)

    return (
        <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Pusat Dukungan
                </h1>
                <p className="text-sm text-zinc-500">
                    Temukan jawaban atas pertanyaan umum seputar pengoperasian LMS Admin dan portal peserta.
                </p>
            </header>

            {/* ── Stats Bar ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 px-4">
                {[
                    { label: 'Total Panduan', value: totalFAQs, icon: GraduationCap, color: 'emerald' },
                    { label: 'Kategori Topik', value: FAQ_SECTIONS.length, icon: BookOpen, color: 'sky' },
                    { label: 'Hasil Pencarian', value: visibleCount, icon: Search, color: 'amber' },
                ].map(({ label, value, icon: Icon, color }) => {
                    const c = colorMap[color]
                    return (
                        <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${c.border} ${c.bg}`}>
                            <div className={`p-2 rounded-lg ${c.badge}`}>
                                <Icon className={`w-4 h-4 ${c.text}`} />
                            </div>
                            <div>
                                <p className={`text-xl font-black ${c.text}`}>{value}</p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Contact Admin ────────────────────────────────────────────────── */}
            <section className="px-4 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">
                        Hubungi Pengembang
                    </span>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ContactCard
                        icon={Mail}
                        label="Email"
                        value="achmadmuzakki37@gmail.com"
                        href="mailto:achmadmuzakki37@gmail.com"
                        color="sky"
                    />
                    <ContactCard
                        icon={Phone}
                        label="WhatsApp"
                        value="+62 815-5355-7582"
                        href="https://wa.me/6281553557582"
                        color="emerald"
                    />
                    <ContactCard
                        icon={MessageCircle}
                        label="Live Chat"
                        value="Chat langsung di sini"
                        href="#"
                        color="amber"
                    />
                </div>

                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-1">
                    Jam operasional: Senin–Jumat, 08.00–16.00 WIB
                </p>
            </section>

            {/* ── Search ───────────────────────────────────────────────────────── */}
            <section className="px-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari pertanyaan atau topik..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-xs text-zinc-400 mt-2 px-1">
                        Menampilkan <span className="font-bold text-emerald-600 dark:text-emerald-400">{visibleCount}</span> hasil untuk &ldquo;{searchQuery}&rdquo;
                    </p>
                )}
            </section>

            {/* ── FAQ Sections ─────────────────────────────────────────────────── */}
            <section className="px-4 space-y-5 pb-8">
                {visibleCount === 0 ? (
                    <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;</p>
                        <p className="text-sm mt-1">Coba kata kunci yang berbeda atau hubungi admin.</p>
                    </div>
                ) : (
                    FAQ_SECTIONS.map((section) => (
                        <FAQSectionBlock
                            key={section.id}
                            section={section}
                            searchQuery={searchQuery}
                        />
                    ))
                )}
            </section>
        </div>
    )
}
