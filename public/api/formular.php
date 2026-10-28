<?php
// Nimmt Formulare der Website entgegen: Spamschutz, Prüfung, Speicherung, Mailversand.
declare(strict_types=1);
require __DIR__ . '/_gemeinsam.php';

$willJson = str_contains((string)($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');

function antwort(bool $ok, string $text, int $status = 200): never
{
    global $willJson;
    http_response_code($status);
    if ($willJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'fehler' => $text], JSON_UNESCAPED_UNICODE);
    } else {
        // Ohne JavaScript: einfache Rückmeldeseite
        header('Content-Type: text/html; charset=utf-8');
        $t = htmlspecialchars($ok ? 'Vielen Dank! Ihre Nachricht wurde gesendet.' : $text);
        $zurueck = htmlspecialchars((string)($_SERVER['HTTP_REFERER'] ?? '/'));
        echo "<!doctype html><html lang=\"de-CH\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\">"
            . "<title>Formular</title><body style=\"font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem\">"
            . "<p>$t</p><p><a href=\"$zurueck\">Zurück zur Website</a></p></body></html>";
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, 'Nur POST erlaubt.', 405);
}

// --- Spamschutz -------------------------------------------------------------
// Honeypot ausgefüllt oder in unter 3 Sekunden abgeschickt: still «erfolgreich» antworten.
$zeit = (int)($_POST['_zeit'] ?? 0);
if (trim((string)($_POST['_website'] ?? '')) !== '' || ($zeit > 0 && (microtime(true) * 1000 - $zeit) < 3000)) {
    antwort(true, '');
}

// Einfache Begrenzung: höchstens 5 Einsendungen pro 10 Minuten und Adresse
$ip = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? '') . date('Y-m-d'));
$sperrDatei = sys_get_temp_dir() . '/formular-' . substr($ip, 0, 32);
$zeiten = array_filter(
    array_map('intval', explode(',', (string)@file_get_contents($sperrDatei))),
    fn($t) => $t > time() - 600
);
if (count($zeiten) >= 5) {
    antwort(false, 'Zu viele Anfragen. Bitte warten Sie einige Minuten.', 429);
}
$zeiten[] = time();
@file_put_contents($sperrDatei, implode(',', $zeiten));

// --- Formular prüfen --------------------------------------------------------
$id = formularId((string)($_POST['_formular'] ?? ''));
$formulare = formulare();
if ($id === '' || !isset($formulare[$id])) {
    antwort(false, 'Unbekanntes Formular.', 400);
}
$formular = $formulare[$id];

// --- Dateien prüfen ---------------------------------------------------------
const MAX_DATEI = 10 * 1024 * 1024;
const MAX_GESAMT = 20 * 1024 * 1024;
const MAX_ANZAHL = 5;
const ENDUNGEN = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'doc', 'docx'];

/** @return list<array{name:string, tmp:string, groesse:int}> */
function dateienVon(string $feld): array
{
    $f = $_FILES[$feld] ?? null;
    if (!$f) {
        return [];
    }
    $liste = [];
    $namen = (array)$f['name'];
    foreach ($namen as $i => $name) {
        $fehler = (array)$f['error'];
        if (($fehler[$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($fehler[$i] !== UPLOAD_ERR_OK) {
            antwort(false, 'Eine Datei konnte nicht hochgeladen werden (zu gross?).', 422);
        }
        $liste[] = ['name' => (string)$name, 'tmp' => (string)((array)$f['tmp_name'])[$i], 'groesse' => (int)((array)$f['size'])[$i]];
    }
    return $liste;
}

function sichererName(string $name): string
{
    $name = preg_replace('/[^A-Za-z0-9._-]+/', '_', basename($name)) ?? 'datei';
    return trim($name, '._') ?: 'datei';
}

$werte = [];
$anhaenge = [];
$gesamt = 0;
$antwortAn = '';
foreach ($formular['felder'] as $feld) {
    if ($feld['typ'] === 'datei') {
        $dateien = dateienVon($feld['name']);
        if ($feld['pflicht'] && !$dateien) {
            antwort(false, 'Bitte laden Sie «' . $feld['bezeichnung'] . '» hoch.', 422);
        }
        if (count($dateien) > MAX_ANZAHL) {
            antwort(false, 'Bitte höchstens ' . MAX_ANZAHL . ' Dateien pro Feld hochladen.', 422);
        }
        foreach ($dateien as $d) {
            $endung = strtolower(pathinfo($d['name'], PATHINFO_EXTENSION));
            if (!in_array($endung, ENDUNGEN, true)) {
                antwort(false, 'Dateityp nicht erlaubt: ' . $d['name'], 422);
            }
            if ($d['groesse'] > MAX_DATEI) {
                antwort(false, 'Datei zu gross (max. 10 MB): ' . $d['name'], 422);
            }
            if (!is_uploaded_file($d['tmp'])) {
                antwort(false, 'Ungültiger Upload.', 400);
            }
            $gesamt += $d['groesse'];
            $anhaenge[] = $d + ['feld' => $feld['bezeichnung']];
        }
        if ($gesamt > MAX_GESAMT) {
            antwort(false, 'Alle Dateien zusammen dürfen höchstens 20 MB gross sein.', 422);
        }
        $werte[$feld['bezeichnung']] = implode(', ', array_map(fn($d) => sichererName($d['name']), $dateien));
        continue;
    }
    $wert = $_POST[$feld['name']] ?? '';
    $wert = is_string($wert) ? trim($wert) : '';
    $wert = mb_substr(str_replace("\0", '', $wert), 0, $feld['typ'] === 'textarea' ? 10000 : 500);
    if ($feld['pflicht'] && $wert === '') {
        antwort(false, 'Bitte füllen Sie «' . $feld['bezeichnung'] . '» aus.', 422);
    }
    if ($feld['typ'] === 'email' && $wert !== '') {
        if (!filter_var($wert, FILTER_VALIDATE_EMAIL)) {
            antwort(false, 'Die E-Mail-Adresse ist ungültig.', 422);
        }
        $antwortAn = $antwortAn ?: $wert;
    }
    $werte[$feld['bezeichnung']] = $wert;
}

// --- Speichern (ausserhalb des Webroots) -------------------------------------
$eintragId = date('Ymd-His') . '-' . bin2hex(random_bytes(3));
$eintrag = ['Eingang' => date('d.m.Y H:i:s')] + $werte;
if ($anhaenge) {
    $ordner = dateiOrdner($id) . '/' . $eintragId;
    @mkdir($ordner, 0700, true);
    foreach ($anhaenge as $i => $a) {
        $ziel = $ordner . '/' . sichererName($a['name']);
        if (is_file($ziel)) {
            $ziel = $ordner . '/' . $i . '-' . sichererName($a['name']);
        }
        if (move_uploaded_file($a['tmp'], $ziel)) {
            $anhaenge[$i]['pfad'] = $ziel;
        }
    }
}
$gespeichertEintrag = $eintrag + ['_id' => $eintragId, '_zeitstempel' => time()];
$datei = datenOrdner() . '/' . $id . '.jsonl';
$gespeichert = @file_put_contents(
    $datei,
    json_encode($gespeichertEintrag, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
) !== false;

// --- Zammad: Ticket anlegen (z. B. Serviceanfrage) ----------------------------
// Zugang in <Webroot>/../formulardaten/config.php:
//   'zammad' => ['url' => 'https://support.tafag.ch', 'token' => '…', 'gruppe' => 'Users']
// Klappt die Übergabe nicht, geht die Einsendung wie jedes Formular per Mail raus.
$ticketNummer = null;
$zammad = einstellungen()['zammad'] ?? null;
if (($formular['ziel'] ?? '') === 'zammad' && is_array($zammad) && !empty($zammad['url']) && !empty($zammad['token'])) {
    $inhalt = '';
    foreach ($werte as $k => $v) {
        $inhalt .= '<p><strong>' . htmlspecialchars((string)$k) . ':</strong><br>' . nl2br(htmlspecialchars($v === '' ? '–' : (string)$v)) . '</p>';
    }
    $dateienZammad = [];
    foreach ($anhaenge as $a) {
        if (isset($a['pfad'])) {
            $dateienZammad[] = [
                'filename' => sichererName($a['name']),
                'data' => base64_encode((string)file_get_contents($a['pfad'])),
                'mime-type' => function_exists('mime_content_type') ? (mime_content_type($a['pfad']) ?: 'application/octet-stream') : 'application/octet-stream',
            ];
        }
    }
    $titel = $formular['titel'];
    foreach (['Fahrzeug / Gerät', 'Maschine / Anlage', 'Anliegen', 'Bereich'] as $feld) {
        if (!empty($werte[$feld])) {
            $titel .= ': ' . $werte[$feld];
            break;
        }
    }
    $dringend = ($formular['zammad_dringend'] ?? '') !== '' && in_array($formular['zammad_dringend'], $werte, true);
    $ticket = [
        'title' => mb_substr($titel, 0, 200),
        'group' => $zammad['gruppe'] ?? 'Users',
        'customer_id' => 'guess:' . $antwortAn,
        'priority' => $dringend ? '3 high' : '2 normal',
        'article' => [
            'subject' => $titel,
            'body' => $inhalt,
            'content_type' => 'text/html',
            'type' => 'web',
            'internal' => false,
            'attachments' => $dateienZammad,
        ],
    ];
    $ch = curl_init(rtrim((string)$zammad['url'], '/') . '/api/v1/tickets');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($ticket, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Token token=' . $zammad['token']],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $antwortZammad = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status >= 200 && $status < 300) {
        $ticketNummer = (string)(json_decode((string)$antwortZammad, true)['number'] ?? '');
    } else {
        error_log('Zammad-Ticket fehlgeschlagen (HTTP ' . $status . '): ' . substr((string)$antwortZammad, 0, 500));
    }
}
if ($ticketNummer !== null) {
    // Ticket angelegt – Zammad benachrichtigt das Team selbst
    loeschfristAnwenden($id, $formular['loeschfrist_tage'] ?? null);
    antwort(true, '');
}

// --- Mail -------------------------------------------------------------------
$host = preg_replace('/^www\./', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.-]/i', '', (string)$host);
$text = "Neue Einsendung über das Formular «{$formular['titel']}»\n\n";
foreach ($eintrag as $k => $v) {
    $text .= $k . ":\n" . ($v === '' ? '–' : $v) . "\n\n";
}
// Dateien bis 15 MB gesamt hängen an der Mail, grössere sind nur in der Liste abrufbar
$anhaengeMail = array_filter($anhaenge, fn($a) => isset($a['pfad']));
if ($anhaengeMail && $gesamt > 15 * 1024 * 1024) {
    $text .= "Die Dateien sind zu gross für den Mailversand und liegen in der Formular-Liste.\n";
    $anhaengeMail = [];
}
$grenze = 'grenze-' . bin2hex(random_bytes(8));
$kopf = [
    'MIME-Version: 1.0',
    'From: Website <noreply@' . $host . '>',
];
if ($anhaengeMail) {
    $kopf[] = 'Content-Type: multipart/mixed; boundary="' . $grenze . '"';
    $koerper = "--$grenze\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n" . $text . "\r\n";
    foreach ($anhaengeMail as $a) {
        $dateiname = sichererName($a['name']);
        $koerper .= "--$grenze\r\nContent-Type: application/octet-stream; name=\"$dateiname\"\r\n"
            . "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$dateiname\"\r\n\r\n"
            . chunk_split(base64_encode((string)file_get_contents($a['pfad']))) . "\r\n";
    }
    $koerper .= "--$grenze--";
} else {
    $kopf[] = 'Content-Type: text/plain; charset=UTF-8';
    $kopf[] = 'Content-Transfer-Encoding: 8bit';
    $koerper = $text;
}
if ($antwortAn !== '') {
    $kopf[] = 'Reply-To: ' . str_replace(["\r", "\n"], '', $antwortAn);
}
$betreff = '=?UTF-8?B?' . base64_encode($formular['betreff']) . '?=';
$gesendet = false;
foreach ($formular['empfaenger'] as $an) {
    if (filter_var($an, FILTER_VALIDATE_EMAIL)) {
        $gesendet = mail($an, $betreff, $koerper, implode("\r\n", $kopf), '-fnoreply@' . $host) || $gesendet;
    }
}

loeschfristAnwenden($id, $formular['loeschfrist_tage'] ?? null);

if (!$gesendet && !$gespeichert) {
    antwort(false, 'Die Nachricht konnte nicht übermittelt werden.', 500);
}
antwort(true, '');
