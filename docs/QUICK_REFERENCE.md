# Quick Reference - Training Form Updates

## 🚀 Quick Start

### 1. Run Migration
```sql
-- Copy dari migrations/add_training_fields.sql ke Supabase SQL Editor
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Test Form
- Buka `/trainings`
- Klik "Tambah Pelatihan Baru"
- Isi field baru
- Simpan

## 📋 New Fields Summary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | date | No | Tanggal pelatihan |
| time | time | No | Waktu pelatihan |
| certificate_template_url | url | No | URL Google Slides template |
| gas_url | url | No | GAS endpoint (has default) |
| drive_folder_url | url | No | URL folder tugas |
| certificate_folder_url | url | No | URL folder sertifikat |

## 🔧 Key Functions

### extractGoogleId(url: string)
Ekstrak ID dari URL Google:
```typescript
extractGoogleId('https://docs.google.com/presentation/d/1ABC/edit')
// Returns: '1ABC'
```

## 📁 Files Changed

- ✅ `src/types/index.ts` - Added 6 fields to Training interface
- ✅ `src/components/admin/training-form.tsx` - Added inputs & logic
- ✅ `migrations/add_training_fields.sql` - Database migration
- ✅ `docs/` - Complete documentation

## 🧪 Quick Test

```typescript
// Test URL extraction
const testUrls = [
  'https://docs.google.com/presentation/d/1ABC/edit',
  'https://drive.google.com/drive/folders/1XYZ',
  'https://drive.google.com/file/d/1DEF/view'
];

testUrls.forEach(url => {
  console.log(extractGoogleId(url));
});
```

## 🐛 Common Issues

### Issue: Field tidak muncul
**Fix:** Clear cache, restart server

### Issue: ID tidak terekstrak
**Fix:** Cek format URL, lihat console

### Issue: Error saat save
**Fix:** Pastikan migration sudah dijalankan

## 📚 Documentation

- Full Guide: `docs/training-form-guide.md`
- Testing: `docs/testing-guide.md`
- GAS Integration: `docs/gas-integration.md`
- Migration: `migrations/README.md`

## 🎯 Default Values

```typescript
gas_url: 'https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec'
```

## 💡 Tips

1. User input URL lengkap, sistem simpan ID saja
2. Semua field baru optional
3. Edit mode auto-reconstruct URL dari ID
4. GAS URL punya default tapi bisa diubah
5. Validasi minimal, fokus pada UX
