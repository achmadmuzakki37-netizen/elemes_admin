# Changelog - Training Form Enhancement

## [2026-02-22] - Training Form Fields Update

### Added

#### 1. Database Fields (6 new columns)
- `date` - Tanggal pelaksanaan pelatihan (TEXT, nullable)
- `time` - Waktu pelaksanaan pelatihan (TEXT, nullable)
- `certificate_template_id` - ID template Google Slides (TEXT, nullable)
- `gas_url` - URL Google Apps Script endpoint (TEXT, nullable, default value)
- `drive_folder_id` - ID folder Google Drive untuk tugas (TEXT, nullable)
- `certificate_folder_id` - ID folder Google Drive untuk sertifikat (TEXT, nullable)

#### 2. Form Inputs
- Date picker untuk tanggal pelatihan
- Time picker untuk waktu pelatihan
- URL input untuk template sertifikat (Google Slides)
- URL input untuk Google Apps Script endpoint (dengan default value)
- URL input untuk folder pengumpulan tugas (Google Drive)
- URL input untuk folder sertifikat (Google Drive)

#### 3. Helper Function
- `extractGoogleId()` - Fungsi untuk ekstrak ID dari URL Google Drive/Slides
  - Support Google Slides URL
  - Support Google Drive file URL
  - Support Google Drive folder URL
  - Fallback ke input asli jika bukan URL

#### 4. Documentation
- `migrations/add_training_fields.sql` - SQL migration script
- `migrations/README.md` - Migration documentation
- `docs/training-form-guide.md` - User guide untuk form baru
- `docs/testing-guide.md` - Testing guide lengkap
- `docs/gas-integration.md` - Google Apps Script integration guide

### Changed

#### 1. Type Definitions (`src/types/index.ts`)
- Updated `Training` interface dengan 6 field baru

#### 2. Training Form Component (`src/components/admin/training-form.tsx`)
- Added helper function `extractGoogleId()`
- Updated `handleSubmit()` untuk handle field baru
- Added 6 new input fields dengan proper labels dan placeholders
- Added URL to ID conversion logic
- Added helper text untuk setiap field baru

### Technical Details

#### URL to ID Conversion
User input URL lengkap, sistem otomatis ekstrak dan simpan ID saja:

**Input:**
```
https://docs.google.com/presentation/d/1ABC123xyz/edit
```

**Stored in DB:**
```
1ABC123xyz
```

#### Default Values
- `gas_url` memiliki default value yang bisa diubah user
- Semua field baru bersifat optional (nullable)

#### Edit Mode Behavior
- Saat edit, URL direkonstruksi dari ID yang tersimpan
- User bisa update URL, sistem akan ekstrak ID baru
- Field kosong tidak mengubah nilai di database

### Migration Required

Jalankan migration SQL sebelum menggunakan fitur baru:

```sql
-- File: migrations/add_training_fields.sql
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS certificate_template_id TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS gas_url TEXT DEFAULT 'https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec';
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS certificate_folder_id TEXT;
```

### Testing Checklist

- [x] Type definitions updated
- [x] Form component updated
- [x] Helper function implemented
- [x] Migration script created
- [x] Documentation created
- [ ] Migration executed in database
- [ ] Manual testing completed
- [ ] Integration testing with GAS

### Breaking Changes

None. Semua field baru bersifat optional dan backward compatible.

### Dependencies

No new dependencies added. Menggunakan existing:
- React (form handling)
- TypeScript (type safety)
- Supabase (database)

### Browser Compatibility

- Date picker: HTML5 `<input type="date">` - supported di semua modern browsers
- Time picker: HTML5 `<input type="time">` - supported di semua modern browsers

### Future Enhancements

Potential improvements untuk future releases:
1. Validasi URL format di client-side
2. Preview template sertifikat sebelum simpan
3. Test connection ke GAS endpoint
4. Bulk import trainings dari CSV
5. Calendar view untuk jadwal pelatihan
6. Reminder otomatis untuk pelatihan yang akan datang
7. Integration dengan Google Calendar
8. Batch certificate generation
9. Certificate template preview
10. Analytics dashboard untuk certificate generation

### Support

Untuk pertanyaan atau issue:
1. Lihat dokumentasi di folder `docs/`
2. Check testing guide di `docs/testing-guide.md`
3. Review GAS integration di `docs/gas-integration.md`

### Contributors

- System update untuk mendukung fitur sertifikat otomatis dan penjadwalan pelatihan
