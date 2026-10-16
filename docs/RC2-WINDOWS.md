# Windows-herstel voor 1.0.0-rc.2 — Refs #8

Basis: tag `v1.0.0-rc.1`, commit `7ac1656e4b68665e3aa678b46eb6137a89d2bad1`. De gebruiker heeft op 16 oktober 2026 opdracht gegeven de Windows-bevindingen op een aparte fixbranch te herstellen. De gepubliceerde RC1-assets en tag blijven behouden.

## Impact en herstel

- Het tablatuurvenster gebruikt de betekenis van enter-/leave-full-screen-events als gepubliceerde toestand. Windows leverde tijdens het enter-event nog `isFullScreen() === false`, waardoor de knopstatus achterbleef en Escape niet werkte. De state-getter levert nu dezelfde versie/momentopname als de events; sluiten reset de vlag. Risico: platformverschillen bij native fullscreen. De bestaande desktoptest controleert daarom ook native status, Escape, F, knop, zoombehoud en vervolgbediening.
- De vertaalcatalogustest importeert het opgeloste modulepad via `pathToFileURL(...).href`, ook geldig voor een Windows-stationspad.
- De ontwikkeltest controleert de versietekst specifiek in de zijbalk; de Info-knop bevat dezelfde tekst en maakte de oude selector dubbelzinnig.
- De aftelproef maakt haar synthetische enginebuffer op de samplefrequentie van de AudioContext. Windows gebruikt hier 48 kHz; de vaste 44,1-kHz-testbuffer werd rechtstreeks aan een 48-kHz-engine gegeven. De afzonderlijke OfflineAudioContext-proef houdt haar vaste 44,1 kHz. De productaudio blijft ongewijzigd.

Geen nieuwe afhankelijkheid, functionele uitbreiding, ontwerpwijziging of opslagmigratie. Bestaande media, sessies, evaluaties en historische momentopnamen blijven ongewijzigd. FUNCTIONEEL hoofdstuk 35 en het technisch ontwerp leggen de RC2-stap vast; DESIGN blijft inhoudelijk gelijk.

## Validatie

Uitgevoerd op Windows 11 Home 10.0.26200 x64, Node 24.15.0, pnpm 11.25.0 en Electron 44.7.0. De Windows-AudioContext gebruikt hier 48000 Hz. Alle gegevens zijn synthetische fixtures in geïsoleerde testbibliotheken; de persoonlijke bibliotheek is niet gebruikt.

| Controle | Resultaat |
| --- | --- |
| TypeScript en productiebuild | Geslaagd |
| Volledige Node-domein/opslagreeks | 103/103 geslaagd |
| Volledige desktopreeks, inclusief vier ontwikkel-/DSP-proeven | 31/31 geslaagd |
| Volledige toepasselijke reeks tegen de daadwerkelijk uitgepakte RC2-ZIP | 27 geslaagd, 4 bronproeven bewust overgeslagen |
| Windows x64 ZIP en per-user NSIS-installer bouwen | Geslaagd |
| RC1 installeren in pad met spaties, audio en taalvoorkeur opslaan | Geslaagd |
| RC2 over die RC1-installatie installeren | Geslaagd; dezelfde oefen-ID, AAC-bytes en Engelse taalvoorkeur behouden |
| Geïnstalleerde RC2: offline starten/heropenen en tablatuurregressie | 2/2 geslaagd, inclusief native fullscreen, Escape, F en knop |
| Tijdelijke RC2-installatie verwijderen | Geslaagd; geïnstalleerde executable verwijderd |
| Testbibliotheek daarna met RC2-ZIP heropenen | Geslaagd; audio, oefen-ID en taalvoorkeur behouden |
| Screenshot tablatuur en git diff --check | Gecontroleerd / schoon |

De oorspronkelijke RC1-fouten en diagnose blijven bewaard in [WINDOWS-RC1-RESULTATEN.md](WINDOWS-RC1-RESULTATEN.md). De oorspronkelijke Node-test heeft nu een portable import, de ontwikkeltest een eenduidige selector en de aftelproef een context-rate-buffer. Er zijn geen verwachtingen afgezwakt. De tablatuurtest controleert zowel de zichtbare bediening als het native venster.

## Lokale pakketten en bewijs

De Windows-werkmap bevat de geteste checkout onder `release/rc2-source/`. Daar staan `rc2-build.log`, `rc2-node-tests.log`, `rc2-desktop-tests.log`, `rc2-package.log`, `rc2-packaged-tests.log`, `rc2-installed-tests.log` en `rc2-installer-upgrade.log`. Screenshots staan in `test-results/`; het lokale installatieharnas in `release/validation/installer-check.mjs`. De tijdelijke installatie is na de test verwijderd; de uitgepakte RC2-app blijft beschikbaar in `release/RC2-extracted/` binnen deze checkout.

| Lokaal bestand | SHA-256 |
| --- | --- |
| HITtheBeat-1.0.0-rc.2-win-x64.zip | `8e3ceb3997068094c93e598f42d1b516ed317ed722ef29728782164f52fc7a35` |
| HITtheBeat-1.0.0-rc.2-win-x64.exe | `6732f4d02c828f5cd8c47acd0ebb8b7e91bb3b26be7f63ddade1b3ab24b5c022` |

Deze bestanden en `SHA256SUMS-WINDOWS.txt` staan in de lokale `release/` van de RC2-checkout. Ze zijn niet gepubliceerd en vervangen geen RC1-assets. Het bestaande release-checksumscript verwacht ook Mac-pakketten; bovenstaande Windows-controlegetallen zijn apart berekend.

## Open acceptatie

Een Mac-regressie en muzikale luisterbeoordeling zijn op deze Windows-machine niet uitgevoerd en blijven open vóór platformbrede acceptatie/publicatie van RC2. De Windows-installatiecontrole was stil en per gebruiker, inclusief een echte upgrade RC1 → RC2 in een pad met spaties. Interactieve installerbediening, SmartScreen en persoonlijke appdata op het standaardpad zijn niet getest; behoud van gegevens is uitsluitend met de expliciete testmap gecontroleerd.

De PR richt zich op de RC1-releasebranch, zodat alleen het Windows-herstel en de RC2-documentatie worden beoordeeld. Geen automatische merge, tagverplaatsing of releasepublicatie. #8 blijft gedeeltelijk, inclusief CI/tag-automatisering en de genoemde acceptatiepunten.
