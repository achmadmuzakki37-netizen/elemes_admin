'use server'

import { createClient } from '@/lib/supabase-server'
import { AssignmentWithDetails } from '@/types'
import { revalidatePath } from 'next/cache'

import { unstable_noStore as noStore } from 'next/cache';

/**
 * Mengambil semua data tugas (assignments) beserta detail registrasi dan pelatihannya.
 */
export async function getAssignments() {
    noStore();
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('assignments')
        .select(`
            *,
            registrations (*),
            trainings (*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching assignments:', error)
        return []
    }
    return data as AssignmentWithDetails[]
}

/**
 * Mengupdate status tugas (Approve/Reject) dengan memicu Google Apps Script Web App.
 */
export async function updateAssignmentStatus(payload: {
    action: 'approve' | 'reject';
    assignment_id: string;
    registration_id?: string;
    training_id?: string;
    feedback?: string;
}) {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL

    if (!gasUrl || gasUrl === 'YOUR_GAS_WEB_APP_URL') {
        throw new Error('Google Apps Script Web App URL belum dikonfigurasi di .env.local')
    }

    try {
        // Logika sesuai snippet user
        const body = payload.action === 'approve'
            ? {
                action: 'approve',
                assignment_id: payload.assignment_id,
                registration_id: payload.registration_id,
                training_id: payload.training_id
            }
            : {
                action: 'reject',
                assignment_id: payload.assignment_id,
                feedback: payload.feedback
            };

        const response = await fetch(gasUrl, {
            method: 'POST',
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error('Gagal menghubungi GAS Web App')
        }

        const result = await response.json()
        console.log('GAS Web App Response:', result)

        const supabase = await createClient()

        if (payload.action === 'approve') {
            // 1. Update status di tabel assignments (GAS sudah melakukan ini but we double check)
            const { error: assError } = await supabase
                .from('assignments')
                .update({ status: 'valid' })
                .eq('id', payload.assignment_id)

            if (assError) {
                console.error('Update Assignment Error:', assError)
                throw new Error('Gagal update status tugas')
            }

            // 2. Update certificate_url di tabel registrations
            // Cek berbagai kemungkinan nama field dari GAS
            const certUrl = result.certificate_url || result.url || result.data?.certificate_url
            if (certUrl) {
                const { error: regError } = await supabase
                    .from('registrations')
                    .update({ certificate_url: certUrl })
                    .eq('id', payload.registration_id)

                if (regError) {
                    console.error('Update Registration Error:', regError)
                    throw new Error(`Gagal menyimpan URL sertifikat: ${regError.message}`)
                }
            }
        } else {
            // Reject Logic - Menggunakan status 'invalid' sesuai standar GAS
            const { error: rejectAssError } = await supabase.from('assignments').update({
                status: 'invalid', // BUKAN rejected
                feedback: payload.feedback
            }).eq('id', payload.assignment_id)

            if (rejectAssError) console.error('Reject Assignment Error:', rejectAssError)
        }

        revalidatePath('/validasi')
        return { success: true, result }
    } catch (error: any) {
        console.error('Action error:', error)
        throw new Error(error.message || 'Terjadi kesalahan saat memproses validasi')
    }
}
