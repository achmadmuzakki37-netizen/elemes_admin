// Approve
fetch('YOUR_GAS_WEB_APP_URL', {
  method: 'POST',
  body: JSON.stringify({
    action: 'approve',
    assignment_id: '...',     // ID dari tabel assignments
    registration_id: '...',   // ID dari tabel registrations
    training_id: '...'        // ID dari tabel trainings
  })
});

// Reject
fetch('YOUR_GAS_WEB_APP_URL', {
  method: 'POST',
  body: JSON.stringify({
    action: 'reject',
    assignment_id: '...',
    feedback: 'Tugas kurang lengkap di bagian praktik.'
  })
});
