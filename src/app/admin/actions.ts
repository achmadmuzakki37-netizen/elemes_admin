'use server'

import { createClient } from '@/lib/supabase-server'
import { Training, Category } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getTrainings() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Training[]
}

export async function getCategories() {
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
    revalidatePath('/admin')
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
    revalidatePath('/admin')
    return data[0] as Training
}

export async function deleteTraining(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin')
}
