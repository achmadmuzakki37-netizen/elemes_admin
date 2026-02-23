// ==========================================
// KONFIGURASI SUPABASE
// ==========================================
const SUPABASE_URL = 'https://uttswvypqvchvduwlmdi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dHN3dnlwcXZjaHZkdXdsbWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTM0NDgsImV4cCI6MjA4NzAyOTQ0OH0.RjwqVMIuFgzTJfmq-0I5HXd9RSZe54HM2bQ51Mdfcyk';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// ==========================================
// 1. WEB APP ENTRY POINTS
// ==========================================

// GET: Serves UI or JSON data
function doGet(e) {
    const action = e.parameter.action;
    const trainingId = e.parameter.id;

    if (action === 'getData' && trainingId) {
        const result = getParticipants(trainingId);
        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    }

    if (!trainingId) {
        return HtmlService.createHtmlOutput('<h3>Error: ID Pelatihan tidak ditemukan.</h3>')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    let template = HtmlService.createTemplateFromFile('Index');
    template.trainingId = trainingId;
    return template.evaluate()
        .setTitle('LMS GESIT - Tugas & Sertifikat')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// POST: Handles form submissions and external triggers
function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents);
        const action = payload.action;

        if (action === 'upload') {
            const result = uploadAssignment(
                payload.trainingId,
                payload.registrationId,
                payload.fileData,
                payload.filename,
                { drive_folder_id: payload.folderId }
            );
            return ContentService.createTextOutput(JSON.stringify(result))
                .setMimeType(ContentService.MimeType.JSON);
        }

        if (action === 'approve') {
            return handleApproval(payload);
        } else if (action === 'reject') {
            return handleRejection(payload);
        }
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ==========================================
// 2. FETCH DATA DARI SUPABASE
// ==========================================
function getTrainingMetadata(trainingId) {
    const url = `${SUPABASE_URL}/rest/v1/trainings?id=eq.${trainingId}&select=name,drive_folder_id,certificate_template_id,certificate_folder_id`;
    try {
        const response = UrlFetchApp.fetch(url, { headers: headers, muteHttpExceptions: true });
        const data = JSON.parse(response.getContentText());
        if (data && data.length > 0) return { success: true, data: data[0] };
        return { success: false, message: 'Pelatihan tidak ditemukan' };
    } catch (error) {
        return { success: false, message: error.toString() };
    }
}

// Fetches participants WITH their assignment status and certificate link
function getParticipants(trainingId) {
    try {
        // Get registrations
        const regUrl = `${SUPABASE_URL}/rest/v1/registrations?training_id=eq.${trainingId}&select=id,nama,lembaga,certificate_url&order=nama.asc`;
        const regRes = UrlFetchApp.fetch(regUrl, { headers: headers, muteHttpExceptions: true });
        const registrations = JSON.parse(regRes.getContentText());

        if (!registrations || registrations.length === 0) {
            return { success: true, data: [] };
        }

        // Get all assignments for this training
        const asgUrl = `${SUPABASE_URL}/rest/v1/assignments?training_id=eq.${trainingId}&select=id,registration_id,status,feedback,file_url,created_at&order=created_at.desc`;
        const asgRes = UrlFetchApp.fetch(asgUrl, { headers: headers, muteHttpExceptions: true });
        const assignments = JSON.parse(asgRes.getContentText()) || [];

        // Map: registration_id -> latest assignment
        const assignmentMap = {};
        assignments.forEach(a => {
            if (!assignmentMap[a.registration_id]) {
                assignmentMap[a.registration_id] = a; // latest first (ordered desc)
            }
        });

        // Merge
        const merged = registrations.map(r => ({
            ...r,
            assignment: assignmentMap[r.id] || null
        }));

        return { success: true, data: merged };
    } catch (error) {
        return { success: false, message: error.toString() };
    }
}

// ==========================================
// 3. UPLOAD TUGAS KE GOOGLE DRIVE + RECORD
// ==========================================
function uploadAssignment(trainingId, registrationId, fileData, filename, metaDataCache) {
    try {
        const folderId = metaDataCache.drive_folder_id;
        if (!folderId) return { success: false, message: 'Folder Tugas tidak dikonfigurasi oleh admin' };

        let folder;
        try {
            folder = DriveApp.getFolderById(folderId);
        } catch (e) {
            return { success: false, message: 'ID Folder Google Drive Tugas tidak valid' };
        }

        // Decode & save file
        const contentType = fileData.substring(5, fileData.indexOf(';'));
        const bytes = Utilities.base64Decode(fileData.split(',')[1]);
        const blob = Utilities.newBlob(bytes, contentType, filename);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const fileUrl = file.getUrl();

        // Record in Supabase assignments table (status: pending)
        const insertUrl = `${SUPABASE_URL}/rest/v1/assignments`;
        const body = JSON.stringify({
            registration_id: registrationId,
            training_id: trainingId,
            file_url: fileUrl,
            status: 'pending'
        });

        const insertRes = UrlFetchApp.fetch(insertUrl, {
            method: 'post',
            headers: headers,
            payload: body,
            muteHttpExceptions: true
        });

        const statusCode = insertRes.getResponseCode();
        const responseText = insertRes.getContentText();

        if (statusCode >= 200 && statusCode < 300) {
            return { success: true, url: fileUrl };
        } else {
            console.error('Supabase insert error:', responseText);
            return {
                success: false,
                message: 'Gagal mencatat tugas ke database. Status: ' + statusCode + ' Error: ' + responseText
            };
        }

    } catch (error) {
        return { success: false, message: 'Error upload: ' + error.toString() };
    }
}

// ==========================================
// 4. APPROVAL HANDLER (called from doPost)
// ==========================================
function handleApproval(payload) {
    // payload: { action: 'approve', assignment_id, registration_id, training_id }
    const assignmentId = payload.assignment_id;
    const registrationId = payload.registration_id;
    const trainingId = payload.training_id;

    // 1. Update assignment status to 'valid'
    const patchUrl = `${SUPABASE_URL}/rest/v1/assignments?id=eq.${assignmentId}`;
    UrlFetchApp.fetch(patchUrl, {
        method: 'patch',
        headers: headers,
        payload: JSON.stringify({ status: 'valid' }),
        muteHttpExceptions: true
    });

    // 2. Fetch participant data
    const regUrl = `${SUPABASE_URL}/rest/v1/registrations?id=eq.${registrationId}&select=nama,lembaga`;
    const regRes = UrlFetchApp.fetch(regUrl, { headers: headers, muteHttpExceptions: true });
    const regData = JSON.parse(regRes.getContentText());
    if (!regData || regData.length === 0) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Peserta tidak ditemukan' }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    const participant = regData[0];

    // 3. Fetch training metadata
    const metaRes = getTrainingMetadata(trainingId);
    if (!metaRes.success) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: metaRes.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    const meta = metaRes.data;

    // 4. Generate certificate
    const certResult = generateCertificatePDF(participant.nama, participant.lembaga, meta);
    if (!certResult.success) {
        return ContentService.createTextOutput(JSON.stringify(certResult))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. Success! Return certificate_url (Next.js will save it to database)
    return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        certificate_url: certResult.url,
        registration_id: registrationId // Return this back for Next.js to use
    })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 5. REJECTION HANDLER (called from doPost)
// ==========================================
function handleRejection(payload) {
    // payload: { action: 'reject', assignment_id, feedback }
    const assignmentId = payload.assignment_id;
    const feedback = payload.feedback || 'Tugas belum memenuhi kriteria.';

    const patchUrl = `${SUPABASE_URL}/rest/v1/assignments?id=eq.${assignmentId}`;
    UrlFetchApp.fetch(patchUrl, {
        method: 'patch',
        headers: headers,
        payload: JSON.stringify({ status: 'invalid', feedback: feedback }),
        muteHttpExceptions: true
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Assignment ditolak' }))
        .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 6. GENERATE CERTIFICATE PDF (internal)
// ==========================================
function generateCertificatePDF(participantName, lembaga, trainingMeta) {
    try {
        const templateId = trainingMeta.certificate_template_id;
        const certFolderId = trainingMeta.certificate_folder_id;
        if (!templateId || !certFolderId) {
            return { success: false, message: 'Template/Folder Sertifikat belum dikonfigurasi admin' };
        }

        let folder;
        try { folder = DriveApp.getFolderById(certFolderId); }
        catch (e) { return { success: false, message: 'Folder sertifikat tidak dapat diakses' }; }

        // Copy template
        const templateFile = DriveApp.getFileById(templateId);
        const copyFile = templateFile.makeCopy(`Sertifikat - ${participantName}`, folder);
        const copyId = copyFile.getId();

        // Replace placeholders
        const presentation = SlidesApp.openById(copyId);
        presentation.getSlides().forEach(slide => {
            slide.replaceAllText('{{nama}}', participantName);
            slide.replaceAllText('{{lembaga}}', lembaga || '-');
        });
        presentation.saveAndClose();

        // Convert to PDF
        const pdfBlob = copyFile.getAs(MimeType.PDF);
        const pdfFile = folder.createFile(pdfBlob);
        pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const downloadUrl = pdfFile.getUrl();

        // Cleanup temp slide copy
        copyFile.setTrashed(true);

        return { success: true, url: downloadUrl };
    } catch (error) {
        return { success: false, message: 'Error sertifikat: ' + error.toString() };
    }
}
