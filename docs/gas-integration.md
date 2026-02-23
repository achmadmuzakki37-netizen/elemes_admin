# Google Apps Script Integration

## Overview
Sistem pelatihan terintegrasi dengan Google Apps Script (GAS) untuk otomasi pembuatan sertifikat.

## Flow Diagram

```
User Submit Form
    ↓
Training Data Saved (with IDs)
    ↓
Certificate Generation Triggered
    ↓
GAS Endpoint Called
    ↓
GAS Process:
  1. Read template from certificate_template_id
  2. Fill participant data
  3. Save to certificate_folder_id
  4. Return certificate URL
```

## Data Structure

### Training Object (yang dikirim ke GAS)

```typescript
{
  id: string,
  name: string,
  date: string,              // YYYY-MM-DD
  time: string,              // HH:MM
  certificate_template_id: string,  // Google Slides ID
  gas_url: string,           // GAS endpoint URL
  drive_folder_id: string,   // Folder untuk tugas
  certificate_folder_id: string  // Folder untuk sertifikat
}
```

## GAS Endpoint

### Default URL
```
https://script.google.com/macros/s/AKfycby4cMfj0iPt-p1PcW2OlMBogrLeXdqyINrsL3U5cRLstg-Envh8az8hkUhHDie_rHjk0Q/exec
```

### Request Format

**Method:** POST  
**Content-Type:** application/json

```json
{
  "action": "generateCertificate",
  "trainingId": "uuid-training-id",
  "participantName": "John Doe",
  "participantEmail": "john@example.com",
  "templateId": "1ABC123xyz",
  "outputFolderId": "1DEF456ghi",
  "trainingName": "Workshop React Advanced",
  "trainingDate": "2026-03-15",
  "trainingTime": "14:00"
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "certificateUrl": "https://drive.google.com/file/d/CERTIFICATE_ID/view",
  "certificateId": "CERTIFICATE_ID",
  "message": "Certificate generated successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Google Apps Script Code Example

### Basic Certificate Generator

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'generateCertificate') {
      return generateCertificate(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function generateCertificate(data) {
  // 1. Copy template
  const template = DriveApp.getFileById(data.templateId);
  const folder = DriveApp.getFolderById(data.outputFolderId);
  const copy = template.makeCopy(
    `Certificate_${data.participantName}_${data.trainingName}`,
    folder
  );
  
  // 2. Open and edit the presentation
  const presentation = SlidesApp.openById(copy.getId());
  const slides = presentation.getSlides();
  
  // 3. Replace placeholders
  slides.forEach(slide => {
    slide.replaceAllText('{{NAME}}', data.participantName);
    slide.replaceAllText('{{TRAINING}}', data.trainingName);
    slide.replaceAllText('{{DATE}}', formatDate(data.trainingDate));
    slide.replaceAllText('{{TIME}}', data.trainingTime);
  });
  
  // 4. Save and return URL
  presentation.saveAndClose();
  
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      certificateUrl: copy.getUrl(),
      certificateId: copy.getId()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}
```

## Setup GAS Project

### 1. Create New Apps Script Project
1. Buka https://script.google.com
2. Klik "New Project"
3. Paste code di atas
4. Save dengan nama "Certificate Generator"

### 2. Deploy as Web App
1. Klik "Deploy" > "New deployment"
2. Type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Klik "Deploy"
6. Copy URL yang diberikan
7. Paste URL tersebut ke field "URL GAS" di form training

### 3. Set Permissions
Script memerlukan permission untuk:
- Google Drive (read/write)
- Google Slides (read/write)

### 4. Test Deployment
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generateCertificate",
    "participantName": "Test User",
    "templateId": "YOUR_TEMPLATE_ID",
    "outputFolderId": "YOUR_FOLDER_ID",
    "trainingName": "Test Training",
    "trainingDate": "2026-03-15",
    "trainingTime": "14:00"
  }' \
  YOUR_GAS_URL
```

## Template Placeholders

Template Google Slides harus menggunakan placeholder berikut:

- `{{NAME}}` - Nama peserta
- `{{TRAINING}}` - Nama pelatihan
- `{{DATE}}` - Tanggal pelatihan (formatted)
- `{{TIME}}` - Waktu pelatihan
- `{{EMAIL}}` - Email peserta (optional)
- `{{ID}}` - ID peserta (optional)

## Security Considerations

1. **API Key**: Jangan expose GAS URL di client-side jika sensitive
2. **Rate Limiting**: Implement rate limiting di GAS
3. **Validation**: Validate semua input di GAS
4. **Permissions**: Set minimal required permissions
5. **Logging**: Log semua certificate generation untuk audit

## Error Handling

### Common Errors

1. **Template Not Found**
   - Cek apakah template_id valid
   - Pastikan GAS punya akses ke template

2. **Folder Not Found**
   - Cek apakah folder_id valid
   - Pastikan GAS punya akses ke folder

3. **Permission Denied**
   - Re-authorize GAS script
   - Cek sharing settings

4. **Quota Exceeded**
   - Google Apps Script punya daily quota
   - Implement retry mechanism

## Monitoring

### Log Certificate Generation

```javascript
function logCertificateGeneration(data, result) {
  const sheet = SpreadsheetApp.openById('LOG_SHEET_ID').getActiveSheet();
  sheet.appendRow([
    new Date(),
    data.trainingId,
    data.participantName,
    data.participantEmail,
    result.certificateId,
    result.success ? 'SUCCESS' : 'FAILED'
  ]);
}
```

## Advanced Features

### 1. Email Notification
Kirim email otomatis setelah sertifikat dibuat:

```javascript
function sendCertificateEmail(email, certificateUrl, trainingName) {
  MailApp.sendEmail({
    to: email,
    subject: `Sertifikat ${trainingName}`,
    htmlBody: `
      <p>Selamat! Sertifikat Anda telah dibuat.</p>
      <p><a href="${certificateUrl}">Download Sertifikat</a></p>
    `
  });
}
```

### 2. Batch Generation
Generate multiple certificates sekaligus:

```javascript
function batchGenerateCertificates(participants, trainingData) {
  const results = [];
  
  participants.forEach(participant => {
    const result = generateCertificate({
      ...trainingData,
      participantName: participant.name,
      participantEmail: participant.email
    });
    results.push(result);
  });
  
  return results;
}
```

### 3. PDF Export
Export sertifikat sebagai PDF:

```javascript
function exportToPDF(presentationId, folderId) {
  const presentation = DriveApp.getFileById(presentationId);
  const blob = presentation.getAs('application/pdf');
  const folder = DriveApp.getFolderById(folderId);
  const pdf = folder.createFile(blob);
  return pdf.getUrl();
}
```
