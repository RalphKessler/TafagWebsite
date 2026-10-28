<?php
// Passwortgeschützte Liste der Formular-Einsendungen mit Download als Excel-Datei.
declare(strict_types=1);
require __DIR__ . '/_gemeinsam.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']), 'samesite' => 'Strict']);
session_start();

$cfg = einstellungen();
$hash = (string)($cfg['passwort_hash'] ?? '');

function seite(string $inhalt): never
{
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="de-CH"><meta charset="utf-8"><meta name="viewport" content="width=device-width">'
        . '<title>Formular-Einsendungen</title><style>body{font-family:system-ui,sans-serif;max-width:60rem;margin:2rem auto;padding:0 1rem}'
        . 'table{border-collapse:collapse;width:100%;font-size:.9rem}td,th{border:1px solid #ccc;padding:.3rem .5rem;text-align:left;vertical-align:top}'
        . 'input,button{font:inherit;padding:.4rem .6rem}code{background:#eee;padding:.1rem .3rem;word-break:break-all}</style><body>'
        . $inhalt . '</body></html>';
    exit;
}
$h = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES);

// Noch kein Passwort eingerichtet: Anleitung mit Hash-Generator anzeigen
if ($hash === '') {
    $neu = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && strlen((string)($_POST['neu'] ?? '')) >= 10) {
        $neu = password_hash((string)$_POST['neu'], PASSWORD_DEFAULT);
    }
    seite('<h1>Liste noch nicht eingerichtet</h1><p>Legen Sie auf dem Server die Datei <code>'
        . $h(datenBasis() . '/config.php') . '</code> an (ausserhalb des Webroots) mit folgendem Inhalt:</p>'
        . '<pre><code>&lt;?php return [\'passwort_hash\' =&gt; \'' . $h($neu ?: 'HIER-DEN-HASH-EINSETZEN') . '\'];</code></pre>'
        . '<form method="post"><label>Passwort (mind. 10 Zeichen) in Hash umwandeln: <input type="password" name="neu" minlength="10" required></label> <button>Hash erzeugen</button></form>'
        . '<p>Alternativ setzt der Deploy-Workflow die Datei automatisch, wenn das GitHub-Secret <code>FORMULAR_PASSWORT</code> gesetzt ist.</p>');
}

// Anmeldung
if (isset($_GET['abmelden'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: liste.php');
    exit;
}
if (empty($_SESSION['angemeldet'])) {
    $fehler = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        usleep(500000); // bremst das Durchprobieren von Passwörtern
        if (password_verify((string)($_POST['passwort'] ?? ''), $hash)) {
            session_regenerate_id(true);
            $_SESSION['angemeldet'] = true;
            header('Location: liste.php');
            exit;
        }
        $fehler = '<p style="color:#b3261e">Falsches Passwort.</p>';
    }
    seite('<h1>Formular-Einsendungen</h1>' . $fehler
        . '<form method="post"><label>Passwort <input type="password" name="passwort" autofocus required></label> <button>Anmelden</button></form>');
}

$formulare = formulare();
$gewaehlt = formularId((string)($_GET['formular'] ?? ''));
if ($gewaehlt !== '') {
    loeschfristAnwenden($gewaehlt, $formulare[$gewaehlt]['loeschfrist_tage'] ?? null);
}

// Hochgeladene Datei herunterladen
if ($gewaehlt !== '' && isset($_GET['eintrag'], $_GET['datei'])) {
    $eintragId = preg_replace('/[^0-9a-f-]/', '', (string)$_GET['eintrag']);
    $pfad = dateiOrdner($gewaehlt) . '/' . $eintragId . '/' . basename((string)$_GET['datei']);
    if ($eintragId === '' || !is_file($pfad)) {
        http_response_code(404);
        exit('Datei nicht gefunden.');
    }
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($pfad) . '"');
    header('Content-Length: ' . filesize($pfad));
    readfile($pfad);
    exit;
}

// Download als Excel
if ($gewaehlt !== '' && isset($_GET['excel'])) {
    $eintraege = eintraegeLesen($gewaehlt);
    $spalten = [];
    foreach ($eintraege as $e) {
        foreach (array_keys($e) as $k) {
            if ($k[0] !== '_') {
                $spalten[$k] = true;
            }
        }
    }
    $zeilen = [array_keys($spalten)];
    foreach ($eintraege as $e) {
        $zeilen[] = array_map(fn($k) => (string)($e[$k] ?? ''), array_keys($spalten));
    }
    $name = $gewaehlt . '-' . date('Y-m-d');
    if (class_exists('ZipArchive')) {
        $datei = xlsxErstellen($zeilen, $formulare[$gewaehlt]['titel'] ?? $gewaehlt);
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $name . '.xlsx"');
        header('Content-Length: ' . filesize($datei));
        readfile($datei);
        unlink($datei);
    } else {
        // Rückfall: CSV, das Excel direkt öffnet (UTF-8 mit BOM, Semikolon)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $name . '.csv"');
        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF");
        foreach ($zeilen as $z) {
            fputcsv($out, $z, ';', '"', '');
        }
    }
    exit;
}

// Übersicht
$html = '<p style="float:right"><a href="?abmelden=1">Abmelden</a></p><h1>Formular-Einsendungen</h1><ul>';
foreach ($formulare as $id => $f) {
    $anzahl = count(eintraegeLesen($id));
    $html .= '<li><a href="?formular=' . $h($id) . '">' . $h($f['titel']) . "</a> ($anzahl)</li>";
}
$html .= '</ul>';
if ($gewaehlt !== '') {
    $eintraege = array_reverse(eintraegeLesen($gewaehlt));
    $html .= '<h2>' . $h($formulare[$gewaehlt]['titel'] ?? $gewaehlt) . '</h2>'
        . '<p><a href="?formular=' . $h($gewaehlt) . '&amp;excel=1">Als Excel herunterladen</a></p>';
    if ($eintraege) {
        $spalten = array_values(array_filter(array_keys(array_merge(...$eintraege)), fn($k) => $k[0] !== '_'));
        $dateiFelder = array_column(array_filter($formulare[$gewaehlt]['felder'] ?? [], fn($f) => $f['typ'] === 'datei'), 'bezeichnung');
        $html .= '<table><tr>' . implode('', array_map(fn($s) => '<th>' . $h((string)$s) . '</th>', $spalten)) . '</tr>';
        foreach ($eintraege as $e) {
            $zelle = function ($s) use ($e, $h, $dateiFelder, $gewaehlt) {
                $wert = (string)($e[$s] ?? '');
                if (in_array($s, $dateiFelder, true) && $wert !== '' && isset($e['_id'])) {
                    return '<td>' . implode('<br>', array_map(fn($n) => '<a href="?formular=' . $h($gewaehlt) . '&amp;eintrag='
                        . $h((string)$e['_id']) . '&amp;datei=' . $h(rawurlencode(trim($n))) . '">' . $h(trim($n)) . '</a>', explode(',', $wert))) . '</td>';
                }
                return '<td>' . nl2br($h($wert)) . '</td>';
            };
            $html .= '<tr>' . implode('', array_map($zelle, $spalten)) . '</tr>';
        }
        $html .= '</table>';
    } else {
        $html .= '<p>Noch keine Einsendungen.</p>';
    }
}
seite($html);

/** Schreibt eine einfache .xlsx-Datei (eine Tabelle, Text-Zellen) und gibt den Pfad zurück. */
function xlsxErstellen(array $zeilen, string $blatt): string
{
    $x = fn(string $s): string => htmlspecialchars(
        preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $s) ?? '',
        ENT_XML1 | ENT_QUOTES
    );
    $spalte = function (int $n): string {
        $s = '';
        for ($n++; $n > 0; $n = intdiv($n - 1, 26)) {
            $s = chr(65 + ($n - 1) % 26) . $s;
        }
        return $s;
    };
    $daten = '';
    foreach ($zeilen as $i => $zeile) {
        $r = $i + 1;
        $daten .= "<row r=\"$r\">";
        foreach (array_values($zeile) as $j => $wert) {
            $stil = $i === 0 ? ' s="1"' : '';
            $daten .= '<c r="' . $spalte($j) . $r . "\" t=\"inlineStr\"$stil><is><t xml:space=\"preserve\">" . $x((string)$wert) . '</t></is></c>';
        }
        $daten .= '</row>';
    }
    $blatt = $x(mb_substr(preg_replace('/[\\\\\/?*\[\]:]/', '', $blatt) ?: 'Einsendungen', 0, 31));
    $ns = 'http://schemas.openxmlformats.org';
    $pfad = tempnam(sys_get_temp_dir(), 'xlsx');
    $zip = new ZipArchive();
    $zip->open($pfad, ZipArchive::OVERWRITE);
    $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="' . $ns . '/package/2006/content-types">'
        . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
        . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
    $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="' . $ns . '/package/2006/relationships">'
        . '<Relationship Id="rId1" Type="' . $ns . '/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="' . $ns . '/spreadsheetml/2006/main" xmlns:r="' . $ns . '/officeDocument/2006/relationships">'
        . '<sheets><sheet name="' . $blatt . '" sheetId="1" r:id="rId1"/></sheets></workbook>');
    $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="' . $ns . '/package/2006/relationships">'
        . '<Relationship Id="rId1" Type="' . $ns . '/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        . '<Relationship Id="rId2" Type="' . $ns . '/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="' . $ns . '/spreadsheetml/2006/main">'
        . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
        . '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
        . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        . '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
    $zip->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="' . $ns . '/spreadsheetml/2006/main">'
        . '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        . '<sheetData>' . $daten . '</sheetData></worksheet>');
    $zip->close();
    return $pfad;
}
