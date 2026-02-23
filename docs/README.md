# Training Form Documentation

## 📚 Documentation Index

Dokumentasi lengkap untuk fitur baru Training Form dengan integrasi sertifikat otomatis dan Google Drive.

### Quick Links

- 🚀 [Quick Reference](QUICK_REFERENCE.md) - Referensi cepat untuk developer
- 📖 [Training Form Guide](training-form-guide.md) - Panduan lengkap penggunaan form
- 🧪 [Testing Guide](testing-guide.md) - Panduan testing lengkap
- 🔗 [GAS Integration](gas-integration.md) - Integrasi Google Apps Script
- 💡 [Examples](EXAMPLES.md) - Contoh-contoh penggunaan
- 🎨 [Visual Guide](VISUAL_GUIDE.md) - Panduan visual

### Migration

- 📁 [Migration SQL](../migrations/add_training_fields.sql) - Script SQL untuk database
- 📋 [Migration README](../migrations/README.md) - Dokumentasi migration

### Changelog

- 📝 [CHANGELOG](../CHANGELOG.md) - Daftar perubahan lengkap

---

## 🎯 What's New?

### 6 New Fields Added

1. **date** - Tanggal pelatihan (date picker)
2. **time** - Waktu pelatihan (time picker)
3. **certificate_template_id** - ID template Google Slides
4. **gas_url** - URL Google Apps Script endpoint
5. **drive_folder_id** - ID folder pengumpulan tugas
6. **certificate_folder_id** - ID folder sertifikat

### Key Features

✅ Smart URL to ID extraction  
✅ Date & time pickers  
✅ Google Apps Script integration  
✅ Automated certificate generation  
✅ Google Drive folder management  
✅ Backward compatible (all fields optional)

---

## 🚀 Quick Start

### 1. Run Migration
```bash
# Copy SQL dari migrations/add_training_fields.sql
# Paste ke Supabase SQL Editor
# Run migration
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Test
- Buka `/trainings`
- Klik "Tambah Pelatihan Baru"
- Isi field baru
- Simpan dan verifikasi

---

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── QUICK_REFERENCE.md           # Quick reference for developers
├── training-form-guide.md       # Complete user guide
├── testing-guide.md             # Testing procedures
├── gas-integration.md           # Google Apps Script integration
├── EXAMPLES.md                  # Usage examples
└── VISUAL_GUIDE.md              # Visual diagrams and layouts

migrations/
├── add_training_fields.sql      # Database migration script
└── README.md                    # Migration documentation

CHANGELOG.md                     # Complete changelog
```

---

## 🔧 Technical Overview

### Files Modified

1. **src/types/index.ts**
   - Added 6 new fields to Training interface

2. **src/components/admin/training-form.tsx**
   - Added `extractGoogleId()` helper function
   - Added 6 new input fields
   - Updated form submission logic

3. **Database Schema**
   - Added 6 new columns to `trainings` table

### Helper Function

```typescript
function extractGoogleId(url: string): string
```

Extracts ID from:
- Google Slides URLs
- Google Drive file URLs
- Google Drive folder URLs
- Plain IDs

---

## 💡 Key Concepts

### URL to ID Conversion

User inputs full URL → System stores only ID

**Example:**
```
Input:  https://docs.google.com/presentation/d/1ABC123/edit
Stored: 1ABC123
```

### Default Values

- `gas_url` has a default value (can be changed)
- All other new fields are nullable

### Edit Mode

- URLs are reconstructed from stored IDs
- User can update URLs
- System extracts new IDs on save

---

## 🎯 Use Cases

### 1. Basic Training (No Certificate)
Fill only required fields, skip certificate fields.

### 2. Training with Certificate
Fill all fields including template and folder URLs.

### 3. Scheduled Training
Add date and time for future trainings.

### 4. Custom GAS Endpoint
Use different GAS URL for different training types.

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Fields not showing | Clear cache, restart server |
| ID not extracted | Check URL format |
| Save error | Run migration first |
| GAS not working | Verify endpoint URL |

### Getting Help

1. Check [Testing Guide](testing-guide.md)
2. Review [Examples](EXAMPLES.md)
3. See [GAS Integration](gas-integration.md)

---

## 📊 Statistics

- **New Fields**: 6
- **New Functions**: 1 (extractGoogleId)
- **Files Modified**: 2
- **Documentation Pages**: 7
- **Examples**: 10+
- **Test Cases**: 5

---

## 🎓 Learning Path

### For Developers

1. Read [Quick Reference](QUICK_REFERENCE.md)
2. Review [Training Form Guide](training-form-guide.md)
3. Study [Examples](EXAMPLES.md)
4. Check [Visual Guide](VISUAL_GUIDE.md)

### For Testers

1. Read [Testing Guide](testing-guide.md)
2. Review [Examples](EXAMPLES.md)
3. Follow test cases

### For DevOps

1. Read [Migration README](../migrations/README.md)
2. Run migration script
3. Verify database changes

---

## 🔐 Security Notes

- All new fields are optional
- No sensitive data stored
- GAS URL should be validated
- Drive permissions must be set correctly

---

## 🚦 Status

- ✅ Code implementation complete
- ✅ Documentation complete
- ✅ Migration script ready
- ⏳ Database migration pending
- ⏳ Testing pending
- ⏳ Production deployment pending

---

## 📞 Support

For questions or issues:
1. Check documentation in this folder
2. Review examples and test cases
3. Verify migration was run correctly

---

## 📝 License

Same as main project.

---

**Last Updated**: 2026-02-22  
**Version**: 1.0.0  
**Status**: Ready for testing
