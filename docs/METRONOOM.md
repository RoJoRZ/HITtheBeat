# Metronoom-oefeningen — issue #1, v0.0.17

Status: implementatie ter acceptatie via een afzonderlijke PR. Voorbereiding en werkwijze goedgekeurd door gebruiker op 15 oktober 2026; geen zelfstandige merge. Aftelmaat is issue #2 en volgt later.

## Gedrag en grenzen

- Oefening aanmaken als Audiotrack of Metronoom. Bij metronoom geen audio-upload; naam, BPM, maatsoort, optionele opdracht en tablatuur.
- Maatsoorten 3/4, 4/4, 6/8. BPM per kwartnoot, 20–300 BPM. Bij 6/8 zes achtstetellen met twee klikken per kwartnoot; accent op één, lichter klankaccent op vier.
- Sessiestap: standaard 8 maten, instelbaar 1–128; eigen herhalingen en BPM. Geen A/B of toonhoogte bij metronoom. Audiostappen behouden de bestaande fragmentbediening en 25–300%-grens.
- Gewone sessieroute met pauze/herstart/overslaan, evaluatie tussen oefeningen, tempo-aanpassing voor één oefenblok en voortgang. Gemengde sessies ondersteund. Vrije fragmenttraining blijft alleen voor audio.
- Losse speler oefent een eindig aantal maten zonder een sessieregistratie te maken. Lokale instellingen veranderen geen opgeslagen opbouw. Volume en dempen worden gedeeld met de bestaande spelers.

## Impact en technische keuzes

Schema 6 voegt type/maatsoort/maten toe. Geen databaseherbouw: bestaande NOT NULL-audiokolommen gebruiken voor metronoom lege strings en bronduur nul; er wordt geen audiobestand aangemaakt. De werkelijke duur volgt uit maten/tempo, niet uit deze nulwaarde. Oude snapshots blijven ongewijzigd en gelden zonder typeveld als audio. Oude appversies kunnen schema 6 niet openen; dit is geen downgradefunctie.

Kleine gedeelde validatie/duurmodule en een tweede transportengine. Metronoomoscillators worden voor één begrensde herhaling op de audioklok gepland, met afbreken bij pauze/seek/dispose. Geen extra dependency. UI-timer verzorgt telindicatie en overgangen, niet de klik-timing binnen een herhaling. De ruimte tussen herhalingen kan nog afhangen van de UI-loop; een volledig gapless scheduler is niet toegevoegd.

## Acceptatie en zelf proberen

1. Oefeningen → Oefening toevoegen → Oefentype Metronoom zonder audiobestand. Kies 6/8 en 120 BPM, geef een naam en sla zonder bestand op.
2. Speel de losse oefening; probeer spatie, 1, pauze, volume/dempen. In 6/8 duurt één maat bij 120 BPM 1,5 seconde.
3. Maak een sessie met de metronoom. De tabel begint met 8 maten; kies 2 maten en 2 herhalingen: gepland 6 seconden. Voeg een audio-oefening toe.
4. Speel, pauzeer, herstart en beoordeel. De audio-oefening volgt na de metronoom; bestaande fragmenttraining werkt daar nog.
5. Bekijk Voortgang en herstart de app. Maatsoort/maten en resultaten blijven herkenbaar. Een gebruikte oefening kan pas na verwijderen uit opgeslagen sessies worden verwijderd; historie blijft bewaard.

## Verificatie

De definitieve testresultaten staan in de issue-PR. Node-tests omvatten maatduur/accentschema/tempos, validatiegrenzen, herhalingen en gemengde runner, voortgangsgroepering, offline opslag, heropenen, type-/fragmentbeveiliging en migratie vanaf schema 5 met oude snapshots zonder typevelden. De bestaande migratiefixtures voor schema 2/3/4 zijn aangepast om ook de nieuwe kolommen te verwijderen wanneer ze een oude database simuleren.

Electron-test voert het gebruikersscenario uit met een geïsoleerde bibliotheek, plus audioprobes voor gerenderde klikafstanden bij verschillende tempi, stilte na einde, mute en pauze. Voor de live analyzer wordt een nulbron aangesloten zodat de analyzer na het beëindigen van oscillator-input blijft renderen; piekmetingen bemonsteren meerdere klikmomenten om niet alleen de stilte tussen klikken te meten. Dit is geen muzikale luisteracceptatie.

Mac-proefpakket wordt afzonderlijk gecontroleerd; Windows-gebruikstest en luisterbeoordeling blijven expliciet open. Geen release/tag/publicatie of updater onderdeel van dit issue.

Resultaten op 15 oktober 2026: productiebuild met beide TypeScript-configuraties geslaagd; **53 Node-tests** en de volledige **17 Mac-desktoptests** geslaagd. Het Mac-arm64-pakket doorstaat **4 pakkettests** (bibliotheek/audio, metronoom/gemengde sessie, bestaande sessie en ontbrekende audio); 1 DSP-bronmoduletest wordt in het pakket bewust overgeslagen en is wel in de bronreeks uitgevoerd. Mac-arm64- en Windows-x64-zip gebouwd. `git diff --check` schoon. Geen echte Windows-gebruikstest uitgevoerd. Visuele controle van de metronoomsessie uitgevoerd via de testscreenshot.
