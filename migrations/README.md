# Database Migrations

## Add Training Fields Migration

File: `add_training_fields.sql`

### Deskripsi
Migration ini menambahkan field-field baru pada tabel `trainings` untuk mendukung fitur:
- Penjadwalan pelatihan (tanggal dan waktu)
- Template sertifikat otomatis
- Integrasi Google Apps Script
- Manajemen folder Google Drive

### Field yang Ditambahkan

1. **date** (TEXT)
   - Tanggal pelaksanaan pelatihan
   - Format: YYYY-MM-DD
   - Nullable

2. **time** (TEXT)
   - Waktu pelaksanaan pelatihan
   - Format: HH:MM
   - Nullable

3. **certificate_template_id** (TEXT)
   - ID template Google Slides untuk sertifikat
   - Diekstrak otomatis dari URL Google Slides
   - Nullable

4. **gas_url** (TEXT)
   - URL endpoint Google Apps Script
   - Default: `https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec`
   - Nullable

5. **drive_folder_id** (TEXT)
   - ID folder Google Drive untuk pengumpulan tugas
   - Diekstrak otomatis dari URL Google Drive
   - Nullable

6. **certificate_folder_id** (TEXT)
   - ID folder Google Drive untuk menyimpan sertifikat
   - Diekstrak otomatis dari URL Google Drive
   - Nullable

### Cara Menjalankan Migration

#### Menggunakan Supabase Dashboard
1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Buka SQL Editor
4. Copy-paste isi file `add_training_fields.sql`
5. Klik "Run"

#### Menggunakan Supabase CLI
```bash
supabase db push
```

### Ekstraksi ID dari URL

Sistem secara otomatis mengekstrak ID dari URL yang diinput user:

#### Google Slides (Certificate Template)
- Input: `https://docs.google.com/presentation/d/1ABC123xyz/edit`
- Tersimpan: `1ABC123xyz`

#### Google Drive Folder
- Input: `https://drive.google.com/drive/folders/1XYZ789abc`
- Tersimpan: `1XYZ789abc`

### Penggunaan di Form

User akan menginput URL lengkap, dan sistem akan otomatis mengekstrak ID:

```typescript
// Contoh ekstraksi di training-form.tsx
const certificateTemplateUrl = formData.get('certificate_template_url') as string;
const certificate_template_id = extractGoogleId(certificateTemplateUrl);
```

### Testing

Setelah migration, test dengan:
1. Buka halaman Trainings
2. Klik "Tambah Pelatihan Baru"
3. Isi semua field termasuk yang baru
4. Simpan dan verifikasi data tersimpan dengan benar
