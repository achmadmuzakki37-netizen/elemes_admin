'use client'

import { useState } from 'react'
import { Category, Training, Registration } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { ParticipantListDialog } from './participant-list-dialog'
import { BookOpen, Users, ArrowRight, ChevronRight, GraduationCap } from 'lucide-react'

interface PesertaClientProps {
    categories: Category[]
    trainings: Training[]
    registrations: Registration[]
}

export function PesertaClient({ categories, trainings, registrations }: PesertaClientProps) {
    const [selectedTraining, setSelectedTraining] = useState<{ name: string; id: string } | null>(null)

    // Helper to get training participants
    const getParticipantsForTraining = (trainingId: string) => {
        return registrations.filter(r => r.training_id === trainingId)
    }

    // Colors for categories to make it vibrant
    const categoryStyles: Record<string, string> = {
        'tk': 'from-pink-500 to-rose-600',
        'sd': 'from-amber-400 to-orange-500',
        'smp': 'from-emerald-400 to-teal-600',
        'sma': 'from-indigo-500 to-blue-700',
        'default': 'from-zinc-400 to-zinc-600'
    }

    return (
        <div className="space-y-12 px-4 pb-20">
            {categories.map((category) => {
                const categoryTrainings = trainings.filter(t => t.category_id === category.id)
                const catLower = category.title.toLowerCase()
                const gradientClass = categoryStyles[catLower] || categoryStyles['default']

                if (categoryTrainings.length === 0) return null

                return (
                    <section key={category.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                        <div className="flex items-center gap-4 group">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-none transition-transform group-hover:scale-105 duration-500`}>
                                <GraduationCap className="text-white w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                                    Tingkat {category.title}
                                    <ArrowRight className="w-5 h-5 opacity-20 group-hover:translate-x-1 transition-transform" />
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    {categoryTrainings.length} Modul Pelatihan Tersedia
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {categoryTrainings.map((training) => {
                                const trainingParticipants = getParticipantsForTraining(training.id)

                                return (
                                    <Dialog key={training.id}>
                                        <DialogTrigger asChild>
                                            <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer rounded-3xl">
                                                {/* Decorative background circle */}
                                                <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-2xl transition-opacity duration-500`} />

                                                <CardContent className="p-6 space-y-5">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors shadow-inner">
                                                            <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-indigo-600 transition-all">
                                                            <Users className="w-3 h-3" />
                                                            {trainingParticipants.length} Peserta
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 italic tracking-tight leading-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {training.name}
                                                        </h3>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                                                            Daftar Registrasi Modul
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 flex items-center justify-between">
                                                        <div className="flex -space-x-2">
                                                            {[...Array(Math.min(3, trainingParticipants.length))].map((_, i) => (
                                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                                    {trainingParticipants[i]?.nama?.[0] || '?'}
                                                                </div>
                                                            ))}
                                                            {trainingParticipants.length > 3 && (
                                                                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-900 text-white flex items-center justify-center text-[8px] font-bold">
                                                                    +{trainingParticipants.length - 3}
                                                                </div>
                                                            )}
                                                            {trainingParticipants.length === 0 && (
                                                                <span className="text-[9px] font-bold text-zinc-300 italic">Antrean Kosong</span>
                                                            )}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 group-hover:shadow-md animate-in fade-in zoom-in-50">
                                                            <ChevronRight className="w-5 h-5 text-indigo-500" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </DialogTrigger>

                                        <ParticipantListDialog
                                            trainingName={training.name}
                                            participants={trainingParticipants}
                                        />
                                    </Dialog>
                                )
                            })}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
