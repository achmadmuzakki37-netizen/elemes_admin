# Testing Guide - Training Form Updates

## Persiapan Testing

### 1. Jalankan Migration Database
Pastikan migration sudah dijalankan di Supabase:
```sql
-- Jalankan file migrations/add_training_fields.sql
```

### 2. Restart Development Server
```bash
npm run dev
```

## Test Cases

### Test Case 1: Tambah Pelatihan Baru dengan Field Lengkap

**Steps:**
1. Buka halaman `/trainings`
2. Klik tombol "Tambah Pelatihan Baru"
3. Isi semua field:
   - Nama Pelatihan: "Workshop React Advanced"
   - Kategori: Pilih salah satu
   - Indeks Bulan: 2
   - Durasi: "3 jam"
   - Tanggal: 2026-03-15
   - Waktu: 14:00
   - URL Template Sertifikat: `https://docs.google.com/presentation/d/1ABC123xyz/edit`
   - URL GAS: (gunakan default atau custom)
   - URL Folder Tugas: `https://drive.google.com/drive/folders/1XYZ789abc`
   - URL Folder Sertifikat: `https://drive.google.com/drive/folders/1DEF456ghi`
4. Klik "Simpan"

**Expected Result:**
- Toast notification "Berhasil" muncul
- Dialog tertutup otomatis
- Data muncul di tabel trainings
- Di database, tersimpan ID saja (bukan URL lengkap):
  - `certificate_template_id`: "1ABC123xyz"
  - `drive_folder_id`: "1XYZ789abc"
  - `certificate_folder_id`: "1DEF456ghi"

### Test Case 2: Edit Pelatihan yang Sudah Ada

**Steps:**
1. Klik icon Edit pada salah satu pelatihan
2. Field URL akan menampilkan URL lengkap yang direkonstruksi
3. Ubah salah satu URL
4. Klik "Simpan"

**Expected Result:**
- Data terupdate dengan ID baru yang diekstrak dari URL baru
- Field lain tidak berubah

### Test Case 3: Tambah Pelatihan dengan Field Minimal

**Steps:**
1. Klik "Tambah Pelatihan Baru"
2. Isi hanya field wajib:
   - Nama Pelatihan
   - Kategori
   - Durasi
3. Kosongkan semua field baru
4. Klik "Simpan"

**Expected Result:**
- Pelatihan tersimpan tanpa error
- Field baru bernilai NULL di database
- GAS URL menggunakan default value

### Test Case 4: Validasi Ekstraksi ID

**Test berbagai format URL:**

| Input URL | Expected ID |
|-----------|-------------|
| `https://docs.google.com/presentation/d/1ABC123/edit` | `1ABC123` |
| `https://drive.google.com/drive/folders/1XYZ789` | `1XYZ789` |
| `https://drive.google.com/file/d/1DEF456/view` | `1DEF456` |
| `1GHI789` (ID saja) | `1GHI789` |
| `` (kosong) | `` (kosong) |

### Test Case 5: Date & Time Picker

**Steps:**
1. Klik field Tanggal
2. Pilih tanggal dari date picker
3. Klik field Waktu
4. Pilih waktu dari time picker
5. Simpan

**Expected Result:**
- Tanggal tersimpan dalam format YYYY-MM-DD
- Waktu tersimpan dalam format HH:MM

## Verifikasi Database

Setelah testing, verifikasi di Supabase Dashboard:

```sql
SELECT 
    id,
    name,
    date,
    time,
    certificate_template_id,
    gas_url,
    drive_folder_id,
    certificate_folder_id
FROM trainings
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- Semua ID field hanya berisi ID (tanpa URL)
- Format tanggal dan waktu sesuai
- gas_url berisi URL lengkap

## Troubleshooting

### Issue: ID tidak terekstrak dengan benar
**Solution:** 
- Cek format URL yang diinput
- Pastikan URL mengikuti pattern yang didukung
- Lihat console browser untuk error

### Issue: Field tidak muncul di form
**Solution:**
- Clear browser cache
- Restart development server
- Cek apakah file training-form.tsx sudah terupdate

### Issue: Error saat simpan
**Solution:**
- Cek apakah migration sudah dijalankan
- Verifikasi struktur tabel di Supabase
- Cek console untuk error message detail

## Checklist Testing

- [ ] Migration database berhasil dijalankan
- [ ] Form menampilkan semua field baru
- [ ] Date picker berfungsi
- [ ] Time picker berfungsi
- [ ] Ekstraksi ID dari URL Google Slides bekerja
- [ ] Ekstraksi ID dari URL Google Drive folder bekerja
- [ ] Default GAS URL terisi otomatis
- [ ] Simpan data baru berhasil
- [ ] Edit data existing berhasil
- [ ] Validasi field wajib bekerja
- [ ] Toast notification muncul
- [ ] Dialog tertutup setelah simpan
- [ ] Data tersimpan dengan benar di database
- [ ] ID tersimpan tanpa URL prefix
