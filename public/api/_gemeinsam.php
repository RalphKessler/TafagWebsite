<?php
// Gemeinsame Funktionen für formular.php und liste.php
declare(strict_types=1);
date_default_timezone_set('Europe/Zurich');

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_gemeinsam.php') {
    http_response_code(404);
    exit;
}

/**
 * Ablage ausserhalb des Webroots:
 *   <Webroot>/../formulardaten/config.php            (Passwort für die Liste)
 *   <Webroot>/../formulardaten/<Ordnername>/*.jsonl  (Einträge, getrennt für Test und Live)
 */
function datenBasis(): string
{
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/');
    return dirname($root) . '/formulardaten';
}

function datenOrdner(): string
{
    $root = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/');
    $ordner = datenBasis() . '/' . basename($root);
    if (!is_dir($ordner)) {
        @mkdir($ordner, 0700, true);
        @file_put_contents(datenBasis() . '/.htaccess', "Require all denied\n");
    }
    return $ordner;
}

function einstellungen(): array
{
    $datei = datenBasis() . '/config.php';
    $cfg = is_file($datei) ? include $datei : [];
    return is_array($cfg) ? $cfg : [];
}

/** @return array<string, array{titel:string, empfaenger:string[], betreff:string, felder:array}> */
function formulare(): array
{
    $f = include __DIR__ . '/formulare.php';
    return is_array($f) ? $f : [];
}

function formularId(string $id): string
{
    return preg_replace('/[^a-z0-9_-]/i', '', $id) ?? '';
}

/** @return list<array<string,string>> */
function eintraegeLesen(string $formular): array
{
    $datei = datenOrdner() . '/' . formularId($formular) . '.jsonl';
    if (!is_file($datei)) {
        return [];
    }
    $liste = [];
    foreach (file($datei, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $zeile) {
        $e = json_decode($zeile, true);
        if (is_array($e)) {
            $liste[] = $e;
        }
    }
    return $liste;
}

/** Ordner für hochgeladene Dateien eines Formulars (ausserhalb des Webroots). */
function dateiOrdner(string $formular): string
{
    return datenOrdner() . '/dateien/' . formularId($formular);
}

/** Löscht Einträge und Dateien, die älter als die Löschfrist des Formulars sind. */
function loeschfristAnwenden(string $formular, ?int $tage): void
{
    if (!$tage) {
        return;
    }
    $grenze = time() - $tage * 86400;
    $datei = datenOrdner() . '/' . formularId($formular) . '.jsonl';
    if (is_file($datei)) {
        $fh = fopen($datei, 'c+');
        if ($fh && flock($fh, LOCK_EX)) {
            $behalten = [];
            while (($zeile = fgets($fh)) !== false) {
                $e = json_decode($zeile, true);
                if (is_array($e) && (int)($e['_zeitstempel'] ?? PHP_INT_MAX) >= $grenze) {
                    $behalten[] = rtrim($zeile, "\n");
                }
            }
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, $behalten ? implode("\n", $behalten) . "\n" : '');
            flock($fh, LOCK_UN);
        }
        if ($fh) {
            fclose($fh);
        }
    }
    foreach (glob(dateiOrdner($formular) . '/*', GLOB_ONLYDIR) ?: [] as $ordner) {
        if (filemtime($ordner) < $grenze) {
            array_map('unlink', glob($ordner . '/*') ?: []);
            @rmdir($ordner);
        }
    }
}
