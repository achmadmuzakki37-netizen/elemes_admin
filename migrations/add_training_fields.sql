-- Migration: Add new fields to trainings table
-- Date: 2026-02-22
-- Description: Menambahkan field untuk tanggal, waktu, template sertifikat, GAS URL, dan folder IDs

-- Add date field for training date
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS date TEXT;

-- Add time field for training time
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS time TEXT;

-- Add certificate template ID (extracted from Google Slides URL)
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS certificate_template_id TEXT;

-- Add Google Apps Script URL for certificate processing
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS gas_url TEXT 
DEFAULT 'https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec';

-- Add drive folder ID for assignment submissions (extracted from Google Drive URL)
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Add certificate folder ID (extracted from Google Drive URL)
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS certificate_folder_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN trainings.date IS 'Tanggal pelaksanaan pelatihan (format: YYYY-MM-DD)';
COMMENT ON COLUMN trainings.time IS 'Waktu pelaksanaan pelatihan (format: HH:MM)';
COMMENT ON COLUMN trainings.certificate_template_id IS 'ID template Google Slides untuk sertifikat (diekstrak dari URL)';
COMMENT ON COLUMN trainings.gas_url IS 'URL endpoint Google Apps Script untuk pemrosesan sertifikat';
COMMENT ON COLUMN trainings.drive_folder_id IS 'ID folder Google Drive untuk pengumpulan tugas (diekstrak dari URL)';
COMMENT ON COLUMN trainings.certificate_folder_id IS 'ID folder Google Drive untuk menyimpan sertifikat (diekstrak dari URL)';
