# Examples - Training Form Usage

## Example 1: Basic Training (Minimal Fields)

### Input
```
Nama Pelatihan: "Pengenalan JavaScript"
Kategori: "Programming"
Indeks Bulan: 0
Durasi: "2 jam"
```

### Result in Database
```json
{
  "id": "uuid-123",
  "name": "Pengenalan JavaScript",
  "category_id": "cat-001",
  "month_index": 0,
  "duration": "2 jam",
  "date": null,
  "time": null,
  "certificate_template_id": null,
  "gas_url": null,
  "drive_folder_id": null,
  "certificate_folder_id": null
}
```

## Example 2: Complete Training with Certificate

### Input
```
Nama Pelatihan: "Workshop React Advanced"
Kategori: "Frontend Development"
Indeks Bulan: 2
Durasi: "3 jam"
Tanggal: 2026-03-15
Waktu: 14:00
URL Template Sertifikat: https://docs.google.com/presentation/d/1ABC123xyz456/edit
URL GAS: (use default)
URL Folder Tugas: https://drive.google.com/drive/folders/1XYZ789abc123
URL Folder Sertifikat: https://drive.google.com/drive/folders/1DEF456ghi789
```

### Result in Database
```json
{
  "id": "uuid-456",
  "name": "Workshop React Advanced",
  "category_id": "cat-002",
  "month_index": 2,
  "duration": "3 jam",
  "date": "2026-03-15",
  "time": "14:00",
  "certificate_template_id": "1ABC123xyz456",
  "gas_url": "https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec",
  "drive_folder_id": "1XYZ789abc123",
  "certificate_folder_id": "1DEF456ghi789"
}
```

## Example 3: URL Extraction Scenarios

### Scenario A: Google Slides URL
```typescript
Input: "https://docs.google.com/presentation/d/1ABC123xyz/edit?usp=sharing"
Extracted ID: "1ABC123xyz"
Stored: "1ABC123xyz"
```

### Scenario B: Google Drive Folder URL
```typescript
Input: "https://drive.google.com/drive/folders/1XYZ789abc?usp=sharing"
Extracted ID: "1XYZ789abc"
Stored: "1XYZ789abc"
```

### Scenario C: Google Drive File URL
```typescript
Input: "https://drive.google.com/file/d/1DEF456ghi/view?usp=sharing"
Extracted ID: "1DEF456ghi"
Stored: "1DEF456ghi"
```

### Scenario D: Direct ID Input
```typescript
Input: "1GHI789jkl"
Extracted ID: "1GHI789jkl"
Stored: "1GHI789jkl"
```

### Scenario E: Empty Input
```typescript
Input: ""
Extracted ID: ""
Stored: null
```

## Example 4: Edit Existing Training

### Current Data in Database
```json
{
  "id": "uuid-789",
  "name": "Python Basics",
  "certificate_template_id": "1OLD123",
  "drive_folder_id": "1OLDXYZ"
}
```

### Form Display (Auto-reconstructed URLs)
```
URL Template Sertifikat: https://docs.google.com/presentation/d/1OLD123
URL Folder Tugas: https://drive.google.com/drive/folders/1OLDXYZ
```

### User Updates
```
URL Template Sertifikat: https://docs.google.com/presentation/d/1NEW456/edit
URL Folder Tugas: (unchanged)
```

### Updated Data in Database
```json
{
  "id": "uuid-789",
  "name": "Python Basics",
  "certificate_template_id": "1NEW456",
  "drive_folder_id": "1OLDXYZ"
}
```

## Example 5: GAS Integration Flow

### Step 1: Training Created
```json
{
  "id": "training-001",
  "name": "Web Development Bootcamp",
  "date": "2026-04-20",
  "time": "09:00",
  "certificate_template_id": "1TEMPLATE123",
  "gas_url": "https://script.google.com/macros/s/YOUR_GAS_ID/exec",
  "certificate_folder_id": "1CERTFOLDER456"
}
```

### Step 2: Certificate Generation Request
```javascript
// Frontend calls GAS endpoint
fetch(training.gas_url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateCertificate',
    trainingId: training.id,
    participantName: 'John Doe',
    participantEmail: 'john@example.com',
    templateId: training.certificate_template_id,
    outputFolderId: training.certificate_folder_id,
    trainingName: training.name,
    trainingDate: training.date,
    trainingTime: training.time
  })
})
```

### Step 3: GAS Response
```json
{
  "success": true,
  "certificateUrl": "https://drive.google.com/file/d/1NEWCERT789/view",
  "certificateId": "1NEWCERT789",
  "message": "Certificate generated successfully"
}
```

## Example 6: Batch Training Creation

### Scenario: Import Multiple Trainings

```typescript
const trainings = [
  {
    name: "HTML & CSS Fundamentals",
    category_id: "cat-web",
    month_index: 0,
    duration: "4 jam",
    date: "2026-01-15",
    time: "10:00"
  },
  {
    name: "JavaScript ES6+",
    category_id: "cat-web",
    month_index: 1,
    duration: "6 jam",
    date: "2026-02-15",
    time: "10:00"
  },
  {
    name: "React Fundamentals",
    category_id: "cat-web",
    month_index: 2,
    duration: "8 jam",
    date: "2026-03-15",
    time: "10:00",
    certificate_template_id: "1TEMPLATE123",
    gas_url: "https://script.google.com/macros/s/GAS_ID/exec",
    certificate_folder_id: "1CERTFOLDER456"
  }
];

// Create all trainings
for (const training of trainings) {
  await createTraining(training);
}
```

## Example 7: Form Validation

### Valid Inputs
```typescript
✅ date: "2026-03-15" (YYYY-MM-DD)
✅ time: "14:30" (HH:MM)
✅ certificate_template_url: "https://docs.google.com/presentation/d/1ABC/edit"
✅ gas_url: "https://script.google.com/macros/s/ID/exec"
✅ drive_folder_url: "https://drive.google.com/drive/folders/1XYZ"
```

### Invalid Inputs (but handled gracefully)
```typescript
⚠️ date: "15-03-2026" (wrong format, but browser may auto-correct)
⚠️ time: "2:30 PM" (wrong format, use 24-hour)
⚠️ certificate_template_url: "not-a-url" (will be stored as-is)
```

## Example 8: Query Training Data

### Get Training with Certificate Info
```sql
SELECT 
  t.id,
  t.name,
  t.date,
  t.time,
  t.certificate_template_id,
  'https://docs.google.com/presentation/d/' || t.certificate_template_id AS template_url,
  'https://drive.google.com/drive/folders/' || t.drive_folder_id AS assignments_folder_url,
  'https://drive.google.com/drive/folders/' || t.certificate_folder_id AS certificates_folder_url
FROM trainings t
WHERE t.certificate_template_id IS NOT NULL
ORDER BY t.date DESC;
```

### Get Upcoming Trainings
```sql
SELECT *
FROM trainings
WHERE date >= CURRENT_DATE
ORDER BY date ASC, time ASC
LIMIT 10;
```

### Get Trainings by Month
```sql
SELECT *
FROM trainings
WHERE month_index = 2  -- March
ORDER BY date ASC;
```

## Example 9: Error Handling

### Scenario: Invalid Template ID
```typescript
try {
  const response = await fetch(gas_url, {
    method: 'POST',
    body: JSON.stringify({
      templateId: 'INVALID_ID',
      // ... other data
    })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    toast.error('Certificate Generation Failed', {
      description: result.error
    });
  }
} catch (error) {
  toast.error('Network Error', {
    description: 'Failed to connect to certificate service'
  });
}
```

## Example 10: Custom GAS URL

### Scenario: Different GAS for Different Training Types

```typescript
// Training 1: Basic (no certificate)
{
  name: "Free Webinar",
  gas_url: null  // No certificate generation
}

// Training 2: Premium (with certificate)
{
  name: "Premium Workshop",
  gas_url: "https://script.google.com/macros/s/PREMIUM_GAS_ID/exec"
}

// Training 3: Corporate (custom certificate)
{
  name: "Corporate Training",
  gas_url: "https://script.google.com/macros/s/CORPORATE_GAS_ID/exec",
  certificate_template_id: "CORPORATE_TEMPLATE_ID"
}
```

## Tips & Best Practices

1. **Always test URL extraction** before saving to production
2. **Use consistent date/time formats** across the application
3. **Validate GAS endpoint** before deploying
4. **Keep template IDs organized** in a separate document
5. **Monitor certificate generation** for failures
6. **Backup templates** regularly
7. **Test with real Google Drive URLs** during development
8. **Document custom GAS endpoints** if using multiple
9. **Set proper permissions** on Drive folders
10. **Log all certificate generations** for audit trail
