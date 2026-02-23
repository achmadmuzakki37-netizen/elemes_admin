# Panduan Form Pelatihan

## Overview
Form pelatihan telah diperbarui dengan field-field baru untuk mendukung penjadwalan, sertifikat otomatis, dan integrasi Google Drive.

## Field Baru

### 1. Tanggal Pelatihan
- **Type**: Date Picker
- **Field**: `date`
- **Format**: YYYY-MM-DD
- **Required**: Tidak
- **Contoh**: 2026-03-15

### 2. Waktu Pelatihan
- **Type**: Time Picker
- **Field**: `time`
- **Format**: HH:MM
- **Required**: Tidak
- **Contoh**: 14:30

### 3. URL Template Sertifikat
- **Type**: URL Input
- **Field**: `certificate_template_url` (input) → `certificate_template_id` (database)
- **Format Input**: URL lengkap Google Slides
- **Format Database**: ID saja
- **Required**: Tidak
- **Contoh Input**: `https://docs.google.com/presentation/d/1ABC123xyz/edit`
- **Tersimpan**: `1ABC123xyz`

### 4. URL Google Apps Script
- **Type**: URL Input
- **Field**: `gas_url`
- **Default**: `https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec`
- **Required**: Tidak
- **Fungsi**: Endpoint untuk pemrosesan sertifikat otomatis

### 5. URL Folder Pengumpulan Tugas
- **Type**: URL Input
- **Field**: `drive_folder_url` (input) → `drive_folder_id` (database)
- **Format Input**: URL lengkap Google Drive folder
- **Format Database**: ID saja
- **Required**: Tidak
- **Contoh Input**: `https://drive.google.com/drive/folders/1XYZ789abc`
- **Tersimpan**: `1XYZ789abc`

### 6. URL Folder Sertifikat
- **Type**: URL Input
- **Field**: `certificate_folder_url` (input) → `certificate_folder_id` (database)
- **Format Input**: URL lengkap Google Drive folder
- **Format Database**: ID saja
- **Required**: Tidak
- **Contoh Input**: `https://drive.google.com/drive/folders/1DEF456ghi`
- **Tersimpan**: `1DEF456ghi`

## Ekstraksi ID Otomatis

### Fungsi Helper: `extractGoogleId()`

Fungsi ini mengekstrak ID dari berbagai format URL Google:

```typescript
function extractGoogleId(url: string): string {
    if (!url) return '';
    
    // Google Drive file: /d/FILE_ID/
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) return driveMatch[1];
    
    // Google Drive folder: /folders/FOLDER_ID
    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    
    // Google Slides: /presentation/d/PRESENTATION_ID/
    const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slidesMatch) return slidesMatch[1];
    
    // Jika sudah berupa ID saja
    return url;
}
```

### Supported URL Patterns

#### Google Slides
- `https://docs.google.com/presentation/d/PRESENTATION_ID/edit`
- `https://docs.google.com/presentation/d/PRESENTATION_ID/edit?usp=sharing`
- `https://docs.google.com/presentation/d/PRESENTATION_ID/edit#slide=id.p`

#### Google Drive File
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`

#### Google Drive Folder
- `https://drive.google.com/drive/folders/FOLDER_ID`
- `https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing`

## Workflow User

1. User klik "Tambah Pelatihan Baru"
2. Isi field wajib: Nama, Kategori, Durasi
3. Isi field opsional termasuk field baru:
   - Pilih tanggal dari date picker
   - Pilih waktu dari time picker
   - Copy-paste URL Google Slides untuk template sertifikat
   - Isi atau gunakan default URL GAS
   - Copy-paste URL folder Google Drive untuk tugas
   - Copy-paste URL folder Google Drive untuk sertifikat
4. Klik "Simpan"
5. Sistem otomatis:
   - Ekstrak ID dari URL yang diinput
   - Simpan ID ke database
   - Validasi dan tampilkan notifikasi

## Edit Mode

Saat edit pelatihan yang sudah ada:
- Field URL akan menampilkan URL lengkap yang direkonstruksi dari ID
- User bisa mengubah URL, sistem akan ekstrak ID baru
- Jika field kosong, tidak ada perubahan pada ID

## Validasi

- Semua field baru bersifat opsional
- URL tidak divalidasi format, tapi ID akan diekstrak jika memungkinkan
- Jika ekstraksi gagal, nilai asli akan disimpan
- GAS URL memiliki default value yang bisa diubah user

## Integration dengan Google Apps Script

URL GAS digunakan untuk:
1. Generate sertifikat otomatis dari template
2. Mengisi data peserta ke sertifikat
3. Menyimpan sertifikat ke folder yang ditentukan
4. Mengirim notifikasi ke peserta

## Tips untuk User

1. **Template Sertifikat**: Pastikan template Google Slides sudah di-share dengan akun service atau publik
2. **Folder Drive**: Set permission folder agar GAS bisa menulis file
3. **GAS URL**: Gunakan default kecuali ada custom script
4. **Tanggal & Waktu**: Opsional, berguna untuk penjadwalan dan reminder
