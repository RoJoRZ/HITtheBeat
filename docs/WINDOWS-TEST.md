# Windows-testoverdracht — 1.0.0-rc.1

Status: nog niet uitgevoerd. De gebruiker stelt later een Windows-machine met Codex beschikbaar. De bestaande ZIP is een cross-build voor Windows x64; er is geen geslaagde installerbuild of Windows-gebruikstest. Een buildresultaat bewijst geen correcte audio of Windows-bediening.

## Download en eerste start

1. Download HITtheBeat-1.0.0-rc.1-win-x64.zip van de GitHub-pre-release en vergelijk SHA-256 met SHA256SUMS.txt (`Get-FileHash .\HITtheBeat-1.0.0-rc.1-win-x64.zip -Algorithm SHA256`).
2. Pak de gehele ZIP uit in een schrijfbare lokale map. Start HITtheBeat.exe vanuit de uitgepakte map; bewaar alle bijbehorende bestanden. Windows kan waarschuwen omdat het programma niet ondertekend is. Schakel beveiliging niet algemeen uit. Noteer een eventuele blokkade.
3. Begin voor acceptatie met een aparte testbibliotheek. In PowerShell, vanuit de uitgepakte map:

```powershell
$htbTestData = Join-Path $env:TEMP ('HITtheBeat-rc-test-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $htbTestData
& '.\HITtheBeat.exe' "--user-data-dir=$htbTestData"
```

Gebruik diezelfde testmap bij herstart. Zonder dit argument gebruikt de app `%APPDATA%\HITtheBeat`; test nooit migraties of verwijderacties op een persoonlijke bibliotheek zonder aparte reservekopie. Kopieer geen persoonlijke muziek of database naar GitHub.

## Handmatige acceptatie

- Start offline, controleer versie in Info en lege-bibliotheekroute. Nederlands/Engels wisselen, voorkeur bewaren na volledig sluiten en herstarten.
- Importeer een eigen test-MP3 en onbeveiligde AAC-M4A; voeg een PNG/JPEG/WebP toe. ALAC en beschermde M4A zijn niet ondersteund. Controleer annuleren en leesbare foutmeldingen.
- Sluit de app, verplaats alleen de oorspronkelijke testmedia en heropen: de geïmporteerde lokale kopieën moeten blijven spelen. Controleer Instellingen → Bibliotheekmap openen.
- Luister met normale Windows-audio-uitvoer naar tempo 25%, 75%, 100%, 150%, 300%, onafhankelijk toonhoogte aanpassen, volume/dempen en normalisatie. Controleer tikken, klikken, drift en vervorming met echte muziek; noteer bron/tempo/instelling en resultaat, deel geen auteursrechtelijk materiaal zonder toestemming.
- Benoem een A–B-fragment, sleep waveformmarkeringen, zoom/pan, loop en hervat de geplande sessie. Grenzen moeten na herstart gelijk blijven.
- Maak een sessie met meerdere oefeningen en BPM-stappen; aftellen per oefenblok met verschillende maatsoorten. Controleer metronoom, maten per herhaling en hoorbare timing.
- Controleer Spatie/play/pause, toetsenbordbeoordeling 1–5, langzamer/gelijk/sneller en Enter-defaults. Evaluatie bij fragment-/oefenwissel; geen evaluatie bij alleen BPM-wissel. Aanpassing geldt voor het gekozen oefenblok.
- Los tablatuurvenster openen, zoomen, volledig scherm, oefening volgen en sluiten; speler blijft werken. Info en taalwissel behouden spelen/invoer.
- Exporteer .htbexercise met makernaam/boodschap, importeer met preview en aangepaste naam. Bron blijft bestaan, import is een nieuwe oefening. Annuleren schrijft niets.
- Controleer sessieopslag, evaluaties en dashboard na herstart; oefentijd zonder evaluatiepauzes/afteltijd. Alleen tijdelijke gegevens verwijderen.

## Met Codex op Windows

Werk vanaf tag `v1.0.0-rc.1` of de releasebranch, lees AGENTS.md. Benodigd Node 24 en pnpm 11.25.0. Gebruik een korte lokale werkmap met normale gebruikersrechten.

```powershell
pnpm install --frozen-lockfile
pnpm setup:desktop
pnpm build
pnpm test
$env:HITTHEBEAT_TEST_EXECUTABLE = 'C:\pad\naar\uitgepakt\HITtheBeat.exe'
pnpm test:desktop
Remove-Item Env:HITTHEBEAT_TEST_EXECUTABLE
pnpm package:win
```

Desktoptests gebruiken eigen tijdelijke gegevens. DSP-proeven die expliciet bronmodules nodig hebben worden bij pakkettests overgeslagen; voer die zo nodig ook vanuit bron uit. Bouw/test de NSIS-installer op deze Windows-machine: installatie als gewone gebruiker, pad met spaties, starten, herinstallatie/update met bewaarde testbibliotheek en deïnstallatie zonder verlies van appdata. Een fout oplossen levert eerst een afzonderlijke reviewbare wijziging op; vervang de gepubliceerde RC-assets niet stilzwijgend maar gebruik een nieuwe versie.

Leg vast: Windows-versie/architectuur, audioapparaat, release/tag + SHA-256, testdatum, geautomatiseerde aantallen, handmatige resultaten, fouten en resterende beperkingen. Een definitieve 1.0 en afsluiting van #8 volgen pas na de ontbrekende criteria en acceptatie.
