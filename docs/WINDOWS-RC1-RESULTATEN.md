# Windows-controle van v1.0.0-rc.1 — 16 oktober 2026

## Geteste release

- Tag: `v1.0.0-rc.1`, commit `7ac1656e4b68665e3aa678b46eb6137a89d2bad1`.
- Branch bij publicatie: `codex/issue-8-first-release`; gerelateerd aan issue #8.
- De broncode van deze exacte tag is met `git archive` uitgepakt naar `release/rc-source/`. De bestaande main-checkout en eerdere resultaten zijn apart gehouden.
- De originele GitHub-download `HITtheBeat-1.0.0-rc.1-win-x64.zip` is gecontroleerd tegen het gepubliceerde SHA256SUMS.txt. Beide geven `0a66397736183ac3181099c8018fbefdd612c3fa96fe59209835e1a0d7a53fb7`.
- Geteste uitgepakte app: `release/HITtheBeat-1.0.0-rc.1-Windows/HITtheBeat.exe`.
- Windows 11 Home, 10.0.26200, x64; Node 24.15.0, pnpm 11.25.0, Electron 44.7.0. De AudioContext van de Windows-uitvoer gebruikt 48000 Hz.
- Alle appcontroles gebruiken afzonderlijke tijdelijke testbibliotheken, niet de persoonlijke appbibliotheek.

De eerdere controle van 0.0.16 vanuit main is geen testbewijs voor deze RC.

## Resultaten van de ongewijzigde RC

| Controle | Resultaat |
| --- | --- |
| Installatie met frozen lockfile en Electron-setup | Geslaagd |
| TypeScript en productiebuild | Geslaagd |
| Node-domein/opslagtests | 102 geslaagd, 1 mislukt van 103 |
| Desktoptests tegen originele GitHub Windows-zip | 26 geslaagd, 1 mislukt, 4 bewust overgeslagen van 31 |
| Vier overgeslagen ontwikkel-/DSP-tests alsnog vanuit bron | 2 geslaagd, 2 mislukt |
| Lokale Windows x64 ZIP- en NSIS-installerbuild | Geslaagd |
| Installeren als huidige gebruiker in pad met spaties | Geslaagd, exitcode 0 |
| Geïnstalleerde app starten en testaudio/taalvoorkeur opslaan | Geslaagd; app meldt versie 1.0.0-rc.1 en win32 |
| Zelfde versie opnieuw installeren en testgegevens heropenen | Geslaagd; oefen-ID, originele AAC-bytes en Engelse voorkeur behouden |
| Tijdelijke installatie deïnstalleren en gegevens heropenen met officiële ZIP-app | Geslaagd; exitcode 0, geïnstalleerde executable verwijderd, testgegevens behouden |

De volledige desktoprun controleerde onder meer offline audio, MP3/AAC-import, correctie van BPM, metronoom, aftellen en tijdregistratie, evaluatie, fragmenten, Info, taalwissel en taalvoorkeur, bibliotheek, sessieopslag, voortgang, oefeningen delen, volume en waveform.

## Appbevinding: volledig scherm in het tablatuurvenster

**Nog niet opgelost in de gepubliceerde RC.** Het losse venster gaat op Windows daadwerkelijk naar volledig scherm, maar de knop blijft `Volledig scherm` tonen. Escape verlaat het volledig scherm niet. Opnieuw op de schermknop klikken keert wel terug; daarna kan ook de knopstatus achterlopen.

Gerichte reproductie tegen de originele release bevestigde:

- Bij het Electron-event `enter-full-screen` was `isFullScreen()` nog `false`.
- Na de overgang was de native status `true`, met venstergrenzen 1920 × 1080.
- `getState()` gaf daarna `fullscreen: true` bij dezelfde versie 3; de al gepubliceerde rendererstatus bleef `false`.
- Na Escape bleef native `fullscreen: true`; na de schermknop werd dit `false`.

Dit past bij het direct publiceren vanuit het vensterevent in `electron/notation-window.mjs` en het uitsluitend accepteren van hogere versienummers in `src/ui/NotationWindow.tsx`. De oorzaak is in deze testfase niet in productcode aangepast.

De bestaande tablatuurtest stopt op de knopstatus. In een aparte testkopie is daarom de native vensterstatus gecontroleerd en de werkende schermknop gebruikt. Daarmee slagen ook de resterende controles: zoom, passend maken, venster hergebruiken, actieve oefening volgen, ontbrekende tablatuur, sluiten zonder playback te stoppen en sluiten van het hoofdvenster. Dit maakt de oorspronkelijke test niet alsnog geslaagd en heft de Escape-fout niet op.

## Drie testproblemen, afzonderlijk gevalideerd

De originele releasebron en gepubliceerde binaries zijn niet aangepast. Alleen aanvullende testkopieën zijn gebruikt om deze oorzaken te controleren.

1. **Node-vertaalcatalogus:** `tests/language.test.mjs:31` importeert het resultaat van `require.resolve()` rechtstreeks. Op Windows levert een absoluut stationspad `ERR_UNSUPPORTED_ESM_URL_SCHEME`. Met `pathToFileURL(...).href` slaagden alle drie tests uit dat bestand in een aparte kopie. De originele reeks blijft gerapporteerd als 102/103.
2. **Ontwikkeltest:** `tests/desktop/development.spec.ts:19` zoekt versie-informatie met `getByText()`, maar die tekst staat tweemaal in de RC. De test faalt door een strict-mode-overtreding. Met `.sidebar-bottom .version` als eenduidige selector slaagt de testkopie.
3. **Aftel-audioproef:** de test genereert een 440-Hz-buffer op 44100 Hz en geeft die rechtstreeks aan een engine met 48000-Hz-context. De oorspronkelijke proef faalde ook in twee gerichte herhalingen, met gemeten 440-Hz-niveau 0.0213 bij een ondergrens van 0.1. Met een testbuffer op de werkelijke contextsamplefrequentie slaagt dezelfde proef: niveau 0.2490, geen muziek tijdens aftellen, correcte klikfrequenties 3000/1800 Hz, stil na annuleren en stil bij dempen. De productroute decodeert audio met `decodeAudioData()` op de enginecontext; deze diagnose bewijst geen hoorbare muziekfout in de app.

De twee ongewijzigd geslaagde bronproeven betroffen tempo/toonhoogte/loops en metronoomtiming/dempen/pauzeren.

## Lokale bewijzen

Onder `release/rc-source/` staan:

- `rc-node-tests.log`, `rc-build.log`, `rc-packaged-tests.log`.
- `rc-source-probes.log`, `rc-count-in-recheck.log`.
- `rc-language-portable-test.log`, `rc-development-selector.log`, `rc-count-in-device-rate.log`.
- `rc-fullscreen-diagnostic.log`, `rc-fullscreen-escape.log`, `rc-notation-remainder-native.log`.
- `rc-windows-package.log`, `rc-installer-validation.log`.
- `test-results/`: screenshots en fouttraces, inclusief originele tablatuurfout en gerichte Escape-diagnose.
- `validation/`: aanvullende testkopieën; deze horen niet bij de tag. Voor herhalen moeten zij op hun oorspronkelijke tests/desktop- of tests/audio-locatie worden teruggezet.
- `scripts/rc-installer-validation.mjs`: lokale installatie-/gegevenscontrole.
- `release/HITtheBeat-1.0.0-rc.1-win-x64.exe`: lokaal gebouwde installer, niet gepubliceerd. De tijdelijke installatie is na de controle verwijderd.

De originele download en SHA256SUMS.txt staan onder `release/rc-download/`. Geen gepubliceerde assets of tags zijn vervangen.

## Acceptatie en resterende grenzen

Deze RC is technisch op Windows uitgevoerd, maar is **niet volledig groen** door het tablatuurprobleem en de drie fouten in de oorspronkelijke testharnassen. Herstel hoort in een afzonderlijke reviewbare wijziging en vervolgens een nieuwe releaseversie.

Er is met synthetische fixtures en geautomatiseerde bediening getest. Muzikale luisterkwaliteit, hoorbare timing met echte muziek, systeemwaarschuwingen bij een handmatige eerste download en interactieve installerbediening zijn niet door een gebruiker beoordeeld. De installertest was stil, per gebruiker, met hetzelfde versienummer; een upgrade vanaf een andere versie en gegevensbehoud op de standaard persoonlijke appdatamap zijn niet getest. Voor gegevensbehoud is uitsluitend de expliciete geïsoleerde testmap gebruikt.

Dit verslag sluit issue #8 niet af en bevestigt geen CI/tag-automatisering, definitieve 1.0 of gebruikersacceptatie.
