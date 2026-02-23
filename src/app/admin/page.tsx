import { getTrainings, getCategories, deleteTraining } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training-form'
import { Training } from '@/types'

export default async function AdminDashboard() {
    const trainings = await getTrainings()
    const categories = await getCategories()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Pelatihan Management</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Pelatihan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Tambah Pelatihan Baru</DialogTitle>
                        </DialogHeader>
                        <TrainingForm categories={categories} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pelatihan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Berbayar</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trainings.map((training) => (
                                <TableRow key={training.id}>
                                    <TableCell className="font-medium">{training.name}</TableCell>
                                    <TableCell>{categories.find(c => c.id === training.category_id)?.title || training.category_id}</TableCell>
                                    <TableCell>{training.duration}</TableCell>
                                    <TableCell>{training.is_paid ? 'Ya' : 'Tidak'}</TableCell>
                                    <TableCell>Rp {training.price.toLocaleString('id-ID')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Pelatihan</DialogTitle>
                                                </DialogHeader>
                                                <TrainingForm categories={categories} training={training} />
                                            </DialogContent>
                                        </Dialog>

                                        <form action={async () => {
                                            'use server'
                                            await deleteTraining(training.id)
                                        }} className="inline">
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {trainings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Belum ada data pelatihan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
