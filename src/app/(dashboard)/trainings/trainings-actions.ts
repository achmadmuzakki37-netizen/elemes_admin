'use server'

import { createClient } from '@/lib/supabase-server'
import { Training, Category } from '@/types'
import { revalidatePath } from 'next/cache'

import { unstable_noStore as noStore } from 'next/cache';

export async function getTrainings() {
    noStore();
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Training[]
}

export async function getCategories() {
    noStore();
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')

    if (error) throw new Error(error.message)
    return data as Category[]
}

export async function createTraining(training: Omit<Training, 'id' | 'created_at'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trainings')
        .insert([training])
        .select()

    if (error) throw new Error(error.message)
    revalidatePath('/trainings')
    revalidatePath('/dashboard')
    revalidatePath('/')
    return data[0] as Training
}

export async function updateTraining(id: string, training: Partial<Training>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trainings')
        .update(training)
        .eq('id', id)
        .select()

    if (error) throw new Error(error.message)
    revalidatePath('/trainings')
    revalidatePath('/dashboard')
    revalidatePath('/')
    return data[0] as Training
}

export async function deleteTraining(id: string) {
    const supabase = await createClient()

    // Delete associated registrations first to prevent foreign key constraint violations
    const { error: regError } = await supabase
        .from('registrations')
        .delete()
        .eq('training_id', id)

    if (regError) throw new Error(`Failed to delete related registrations: ${regError.message}`)

    const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/trainings')
    revalidatePath('/dashboard')
    revalidatePath('/')
}

export async function toggleRegistrationStatus(id: string, currentStatus: 'open' | 'close' | undefined) {
    const supabase = await createClient()

    // Verifikasi sesi dan role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Unauthorized: Harus login untuk melakukan tindakan ini.')
    }

    if (user.user_metadata?.role !== 'admin') {
        throw new Error('Forbidden: Hanya admin yang dapat mengubah status pendaftaran.')
    }

    const newStatus = currentStatus === 'close' ? 'open' : 'close'

    const { data, error } = await supabase
        .from('trainings')
        .update({ registration_status: newStatus })
        .eq('id', id)
        .select()

    if (error) {
        throw new Error(`Gagal mengubah status: ${error.message}`)
    }

    revalidatePath('/trainings')
    revalidatePath('/dashboard')
    revalidatePath('/')

    return data[0] as Training
}
