# Oefeningen delen — v0.0.24, issue #7

De gebruiker heeft v0.0.23 geaccepteerd en vraagt bij de volgende export/importstap een informele vermelding van de maker. Functionele afspraken staan in FUNCTIONEEL.md hoofdstuk 32; interface in DESIGN.md en proces/opslag in TECHNISCH-ONTWERP.md. Dit is één afzonderlijke levering, geen afronding van taalkeuze of distributie.

## Impact en risico's

Geraakt: library-serialisatie en atomaire import, SQLite schema 10, beperkte hoofdvenster-IPC/preload, native bestandsdialogen, bibliotheekpreview en makerweergave. Geen nieuwe dependency, account, server, audiomotor- of sessieschemaverandering. De export bevat één oefening; sessies en persoonlijke voortgang blijven erbuiten. De eerdere ZIP-suggestie is uitgevoerd als versieerbaar JSON-deelbestand om extra archiefafhankelijkheden en extractiepaden te vermijden.

Import is toevoegen: eigen oefening-/fragment-UUID's en eigen mediabestanden. Een gelijke naam geeft in de preview een waarschuwing en gelegenheid tot hernoemen, maar mag bewust nogmaals worden geïmporteerd. Bestaande opbouwen en historische momentopnamen blijven onaangetast. De schema-upgrade voegt alleen nullable makerinformatie toe; oefeningen en snapshots zonder veld blijven geldig. Export heeft geen opslagneveneffect in de bronoefening: een ingevulde makernaam staat in dat exportbestand en na import in de ontvangende bibliotheek.

Risico's zijn onbetrouwbare bestanden, mediaomvang, beschadiging, gedeeltelijke import en onverwacht overschrijven. Daarom begrensd lezen, strikte formaat-/versie- en inhoudsvalidatie, inhoudschecksums, nieuwe identiteiten, SQLite-transactie plus mediabestandsrollback en eerst volledig naar een tijdelijk bestand exporteren. De maker is vrije tekst en vormt geen bewijs van identiteit. Onbekende formaatversies worden geweigerd, niet gedeeltelijk ingelezen.

## Deelbestandspecificatie v1

Extensie `.htbexercise`, UTF-8 JSON, maximaal 84 MiB. Topniveau:

- `format`: exact `hitthebeat-exercise`; `version`: exact `1`.
- `exercise`: titel, opdracht, type audio/metronome, precieze BPM, gedetecteerde BPM/status, duur, normalisatiekeuze/-dB, maatsoort/maten en benoemde fragmenten met naam/start/eind. Credit is null of `{name,message}`. Er staan geen bron-UUID's, sessies of interne paden in de structuur.
- `audio` en `image`: null of `{name,data,sha256}`. Data is canonieke base64, SHA-256 is de hexinhoudscontrole van de oorspronkelijke bytes. De naam is uitsluitend metadata en wordt nooit als opslagpad gebruikt.

Audio behoudt bestaande ondersteuning MP3/AAC-M4A tot 50 MiB, beeld PNG/JPEG/WebP tot 12 MiB. Geen ALAC. Metronoom heeft geen audio of audiofragmenten, wel eventueel beeld/opdracht. Maximaal 100 fragmenten, geldige grenzen en unieke namen per oefening. Makernaam maximaal 120 tekens, boodschap maximaal 1000 en alleen met makernaam. Bron-BPM en tijdgrenzen behouden hun precisie. Het formaat wordt uitsluitend door het hoofdproces gelezen/geschreven; de renderer krijgt previewmetadata plus één tijdelijk token.

## Controles

- `pnpm build`: beide TypeScript-configuraties en productiefrontend geslaagd.
- `pnpm test`: 100/100 geslaagd. Inclusief byte-identieke media-roundtrip, behouden precisie/fragmenten/credit, metronoom zonder audio, ongeldige of te grote pakketten, checksumfouten, fragmentgrenzen, databasefout na mediakopie met rollback, cancel/preview/tokenhergebruik, hernoemen en dubbele import. Schema 9 → 10 en oudere migraties gecontroleerd; oude snapshot-JSON blijft letterlijk gelijk.
- Gerichte Electron-test: offline export met makernaam/boodschap, bestaande-naamwaarschuwing, annuleren, hernoemen, nieuwe ID's, identieke M4A-bytes, tablatuur, maker behouden bij opdrachtwijziging en herexport, fout bestand en native cancel geslaagd. De bestandsdialogen worden in de tests van vaste tijdelijke keuzepaden voorzien; de echte OS-dialoog wordt niet automatisch aangeklikt.
- Volledige Electron-regressiereeks: 25/25 geslaagd, inclusief bestaande DSP/audio-, sessie-, aftel-, evaluatie-, waveform-, dashboard- en vensterroutes.
- Mac arm64- en Windows x64-zip voor v0.0.24 gebouwd. Verpakte Mac-app: 6 geslaagd, 1 bewuste skip (bronmodule-DSP-test; deze slaagt in de volledige bronreeks). Inclusief offline delen met maker, bibliotheekimport, metronoomsessie, los tablatuurvenster en hoofdvenster/heropenen. Geen Windows-runtime- of OS-bestandsdialooggebruikstest geclaimd.

Testdata staat uitsluitend in tijdelijke geïsoleerde bibliotheken. Geen persoonlijke oefeningen gebruikt voor de tests. Windows-pakketbouw is geen Windows-gebruikstest. Muzikale luisterbeoordeling en nauwkeurigheid op diverse echte muziek blijven open uit eerdere fases.

## Zelf proberen

1. Open Oefeningen, kies een oefening en klik Exporteren. Vul eventueel een artiestennaam en boodschap in en kies Bestand opslaan.
2. Kies Oefening importeren en selecteer dat bestand. Controleer opdracht en maker; een al bestaande naam geeft een waarschuwing.
3. Annuleer eenmaal: er komt niets bij. Importeer daarna opnieuw met een andere naam.
4. Controleer bij de nieuwe oefening de maker, audio, afbeelding en fragmenten. Bewerken van de opdracht behoudt de vermelding; Exporteren stelt haar opnieuw voor.
5. Probeer ook een metronoom-oefening zonder audio en eventueel een deelbestand op een andere computer. De laatste stap is de nog open echte platformcontrole.
