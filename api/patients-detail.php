<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/patients.php';

$user = requireCurrentUserApi();
$patientId = (string) ($_GET['id'] ?? '');

function findPatientRow(string $patientId, string $userId): ?array
{
    return dbOne('SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $userId]);
}

$patient = findPatientRow($patientId, $user['id']);
if ($patient === null) {
    jsonResponse(['error' => 'Paciente nao encontrado.'], 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    logAccess($user['id'], $patient['id'], 'patient', $patient['id'], 'visualizou');
    jsonResponse(['patient' => $patient]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireValidCsrfApi();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $parsed = validatePatient($body);
    if (!$parsed['ok']) {
        jsonResponse(['error' => $parsed['error']], 400);
    }
    $data = $parsed['data'];

    dbExec(
        'UPDATE patients SET
           full_name = ?, birth_date = ?, phone = ?, email = ?,
           emergency_contact_name = ?, emergency_contact_phone = ?,
           medical_history = ?, medications = ?, treatment_frequency = ?, status = ?,
           reminders_enabled = ?, reminder_lead_7_dias = ?, reminder_lead_2_dias = ?, reminder_lead_24_horas = ?
         WHERE id = ? AND user_id = ?',
        [
            $data['fullName'], $data['birthDate'], $data['phone'], $data['email'],
            $data['emergencyContactName'], $data['emergencyContactPhone'],
            $data['medicalHistory'], $data['medications'], $data['treatmentFrequency'], $data['status'],
            $data['remindersEnabled'], $data['reminderLead7Dias'], $data['reminderLead2Dias'], $data['reminderLead24Horas'],
            $patientId, $user['id'],
        ]
    );

    logAccess($user['id'], $patientId, 'patient', $patientId, 'editou');
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Metodo nao permitido.'], 405);
