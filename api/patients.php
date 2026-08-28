<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/patients.php';

$user = requireCurrentUserApi();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string) ($_GET['search'] ?? ''));
    $status = trim((string) ($_GET['status'] ?? ''));

    $conditions = ['user_id = ?'];
    $params = [$user['id']];

    if ($search !== '') {
        $conditions[] = 'full_name LIKE ?';
        $params[] = '%' . $search . '%';
    }
    if (in_array($status, PATIENT_STATUSES, true)) {
        $conditions[] = 'status = ?';
        $params[] = $status;
    }

    $rows = dbAll(
        'SELECT id, full_name, phone, email, treatment_frequency, status, created_at
         FROM patients WHERE ' . implode(' AND ', $conditions) . ' ORDER BY full_name ASC',
        $params
    );

    jsonResponse(['patients' => $rows]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireValidCsrfApi();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $parsed = validatePatient($body);
    if (!$parsed['ok']) {
        jsonResponse(['error' => $parsed['error']], 400);
    }
    $data = $parsed['data'];
    $id = uuid();

    dbExec(
        'INSERT INTO patients (
           id, user_id, full_name, birth_date, phone, email,
           emergency_contact_name, emergency_contact_phone,
           medical_history, medications, treatment_frequency, status, reminders_enabled,
           reminder_lead_7_dias, reminder_lead_2_dias, reminder_lead_24_horas
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            $id, $user['id'], $data['fullName'], $data['birthDate'], $data['phone'], $data['email'],
            $data['emergencyContactName'], $data['emergencyContactPhone'],
            $data['medicalHistory'], $data['medications'], $data['treatmentFrequency'], $data['status'],
            $data['remindersEnabled'], $data['reminderLead7Dias'], $data['reminderLead2Dias'], $data['reminderLead24Horas'],
        ]
    );

    logAccess($user['id'], $id, 'patient', $id, 'criou');
    jsonResponse(['id' => $id], 201);
}

jsonResponse(['error' => 'Metodo nao permitido.'], 405);
