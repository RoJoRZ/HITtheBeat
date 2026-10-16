De eerste definitieve versie van HITtheBeat — Jouw muziekmoment. Vind je ritme, ontwikkel je spel.

## Installeren

- **Mac Apple Silicon:** download HITtheBeat-1.0.0-mac-arm64.dmg, open de schijfkopie en sleep HITtheBeat naar Programma's. Geen Rosetta nodig.
- **Windows x64:** download HITtheBeat-1.0.0-win-x64.exe en installeer voor je eigen gebruiker. Als alternatief is er een ZIP; pak die volledig uit voordat je HITtheBeat.exe opent.
- Sluit een bestaande app vóór installatie en maak vooraf een reservekopie van je eigen appdatamap. Je bibliotheek staat los van de installatie. Er is geen automatische updater.
- Controleer downloads met SHA256SUMS.txt. De Mac-app is ad-hoc ondertekend en niet genotariseerd; de Windows-installer is niet ondertekend. Het OS kan daarom een waarschuwing tonen. Geen Intel Mac-/Windows ARM-uitgave.

## Functionaliteit

- Lokale MP3-/AAC-M4A-oefeningen met opdracht, tablatuur en volumenormalisatie.
- BPM-detectie/correctie, tempo 25–300%, onafhankelijke toonhoogte en volume.
- Benoemde A–B-fragmenten, waveform, looptraining en hervatten van je sessie.
- Opgeslagen oefensessies met tempo-opbouw, herhalingen, metronoom en aftellen per oefening.
- Evaluaties met toetsenbord of muis, tempo-afspraken en voortgangsdashboard.
- Los tablatuurvenster; Windows-fullscreenstatus en Escape hersteld.
- Oefeningen delen met informele makerherkenning, Nederlands/Engels en Info.
- Taalkeuze uitsluitend in Instellingen; Oefening verwijderen naast Oefening importeren.

De app werkt offline zonder account of telemetry. Downloads bevatten geen persoonlijke oefenmedia of database. De eigen projectlicentie is nog niet gekozen (UNLICENSED); dependencyvermeldingen zijn meegeleverd. De bestaande RC1-tag en downloads blijven behouden.

## Validatie en grenzen

Windows-RC2 is op een echte Windows 11-computer gecontroleerd: 103 domein-/opslagtests en 31 desktoptests, installer, upgrade RC1 → RC2 en behoud van geïsoleerde testgegevens. De definitieve versie krijgt daarnaast een native Windows-runnerbuild met domeintests, gerichte tests van het uitgepakte ZIP-pakket en installatie/opstart/deïnstallatie. Mac krijgt productie-/pakketcontroles inclusief het tablatuurherstel. De bijbehorende Actions-run en PR bevatten de exacte resultaten.

Muzikale luisterbeoordeling op diverse echte opnamen, interactieve SmartScreen/Gatekeeper-bediening en behoud van persoonlijke gegevens op elk mogelijk systeem zijn geen geautomatiseerd testbewijs. De release kiest geen nieuwe projectlicentie. Issue #8 blijft open voor volledige platformbrede releaseautomatisering.
