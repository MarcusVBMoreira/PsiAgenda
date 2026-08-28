<?php
// Envio de e-mail via PHPMailer/SMTP, portado de src/lib/mailer.ts. Sem
// SMTP_HOST/SMTP_USER configurados, so loga no lugar de enviar de verdade —
// mesmo comportamento da versao Next.js, pra dev local sem SMTP.

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// Erro de envio de e-mail — sempre pego pelas rotas que chamam sendMail(),
// nunca deixado estourar cru (isso quebraria a resposta JSON da API,
// devolvendo uma pagina de erro em HTML pro frontend).
class MailSendException extends Exception {}

function sendMail(string $to, string $subject, string $html): void
{
    $host = env('SMTP_HOST');
    $user = env('SMTP_USER');

    if (!$host || !$user) {
        error_log("[mailer] SMTP nao configurado — e-mail para $to nao enviado. Assunto: \"$subject\".");
        return;
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = (int) env('SMTP_PORT', '587');
        $mail->SMTPAuth = true;
        $mail->Username = $user;
        $mail->Password = env('SMTP_PASSWORD', '');
        $mail->SMTPSecure = envBool('SMTP_SECURE') ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet = 'UTF-8';

        $from = env('SMTP_FROM', $user);
        $mail->setFrom($from, 'PsiAgenda');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html;

        $mail->send();
    } catch (PHPMailerException $e) {
        error_log('[mailer] Falha ao enviar e-mail para ' . $to . ' ("' . $subject . '"): ' . $mail->ErrorInfo);
        throw new MailSendException('Nao foi possivel enviar o e-mail no momento. Tente novamente em alguns minutos.');
    }
}

function sendTwoFactorCodeEmail(string $to, string $code): void
{
    sendMail(
        $to,
        'Seu codigo de verificacao — PsiAgenda',
        '<p>Seu codigo de verificacao em duas etapas e:</p>'
        . '<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">' . h($code) . '</p>'
        . '<p>Este codigo expira em 10 minutos. Se voce nao tentou fazer login, ignore este e-mail.</p>'
    );
}

function sendPasswordResetCodeEmail(string $to, string $code): void
{
    sendMail(
        $to,
        'Recuperacao de senha — PsiAgenda',
        '<p>Recebemos uma solicitacao para redefinir sua senha. Use o codigo abaixo:</p>'
        . '<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">' . h($code) . '</p>'
        . '<p>Este codigo expira em 10 minutos. Se voce nao solicitou, ignore este e-mail.</p>'
    );
}

function sendSessionReminderEmail(string $to, array $params): void
{
    sendMail(
        $to,
        'Lembrete de sessao — PsiAgenda',
        '<p>Ola, ' . h($params['patientName']) . '.</p>'
        . '<p>Este e um lembrete da sua sessao com ' . h($params['professionalName']) . ':</p>'
        . '<p style="font-size: 18px; font-weight: bold;">' . h($params['dateLabel']) . ' as ' . h($params['timeLabel']) . '</p>'
        . '<p>Se precisar reagendar, entre em contato com seu psicologo(a).</p>'
    );
}

function sendSessionConfirmationEmail(string $to, array $params): void
{
    sendMail(
        $to,
        'Consulta confirmada — PsiAgenda',
        '<p>Ola, ' . h($params['patientName']) . '.</p>'
        . '<p>Sua sessao com ' . h($params['professionalName']) . ' foi confirmada:</p>'
        . '<p style="font-size: 18px; font-weight: bold;">' . h($params['dateLabel']) . ' as ' . h($params['timeLabel']) . '</p>'
        . '<p>Se precisar reagendar, entre em contato com seu psicologo(a).</p>'
    );
}
