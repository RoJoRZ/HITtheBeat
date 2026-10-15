# Aftelmaat — issue #2, v0.0.20

Afzonderlijke implementatie na gebruiksgoedkeuring van de metronoom in v0.0.18. Geen zelfstandige merges of releasepublicatie. De instellingen gelden per oefenblok binnen de opgeslagen sessie; ze wijzigen de bibliotheekoefening niet.

## Impact en keuzes

- Routinevalidatie en SQLite-schema 9: nullable routine_blocks.count_in; oude sessies zonder aftelinstelling blijven uit, eerder ingestelde algemene aftelmaten worden naar de bestaande blokken gekopieerd. Nieuwe blokken beginnen uit, standaardkeuze 4/4. De gebruiker kan 3/4, 4/4 of 6/8 kiezen. De reeds goedgekeurde kwartnoot-BPM-definitie blijft gelden.
- Runner en beide engines: een eindige maat vóór iedere nieuwe geplande speelbeurt, eigen herkenbare klik, geannuleerd bij pauze/herstart/stop/overslaan. Geluid en muziek worden op dezelfde audioklok gepland, met één gedeelde volumeregeling. Geen timer die individuele klikken triggert.
- UI: checkbox en maatsoort naast iedere oefennaam in de sessietabel, gezamenlijke duurverdeling, telindicatie en aparte werkelijk verbruikte afteltijd. Muziekpauze hervat zonder aftellen, pauze tijdens aftellen begint de maat opnieuw. Terugkeer uit vrije training hervat de geplande herhaling met een nieuwe maat. Geen aftellen bij iedere vrije loop.
- Voortgang: voorbereiding is geen muziek en levert geen afspeelbeurt, oefendag of tempo-meetpunt. Tijden worden op de muziekstart gesplitst, ook als de UI-timer later komt. Historische snapshots en oude checkpoints zonder voorbereidingsveld blijven geldig.
- Regressierisico's: dubbele starts, na stop alsnog klinkende muziek, een oude sessie onbedoeld aanzetten, tellen bij het verkeerde tempo en voorbereiding als oefentijd opslaan. Bestaande tempo/toonhoogte, fragmenten, toetsen, volume en evaluaties worden mee gecontroleerd.

De maat is één maat in de voor dat oefenblok gekozen aftelmaatsoort. De geplande totale duur bevat oefentijd + aftellen, zonder pauzes/evaluaties. De werkelijke duur kan door herstarten/onderbreken langer worden. De overdracht van aftellen naar muziek gebruikt de audioklok; volgende herhaling starten blijft gekoppeld aan de bestaande UI-loop, geen belofte van een volledig gapless sessiescheduler.

## Zelf proberen

1. Mijn oefensessies → Bewerken. Vink Aftellen aan naast een oefennaam; standaardmaatsoort is 4/4. Geef de volgende oefening bijvoorbeeld 3/4, of laat die uit staan.
2. Bekijk oefentijd, aftellen en totaal. Kies verschillende BPM's en herhalingen en sla op.
3. Start de sessie: iedere geplande beurt heeft een aftelmaat op haar eigen tempo. Probeer spatie, 1 en overslaan.
4. Pauzeer tijdens aftellen en speel verder: de hele maat begint opnieuw. Pauzeer midden in de muziek: hervatten gaat zonder nieuwe aftelmaat.
5. Onderbreek een audiostap met Fragment oefenen en keer terug. Alleen de hervatte geplande beurt telt opnieuw af, de vrije loop niet.
6. Rond af en bekijk Voortgang. Afteltijd staat in de historie, terwijl geoefende tijd alleen de gespeelde muziek bevat.
7. Herstart de app: de instellingen per oefenblok blijven bewaard. Oude sessies zonder instelling spelen direct als voorheen.

## Controles

Domein-/opslagtests controleren maatduur, BPM-wissels, iedere herhaling, pauze/hervatten/herstart/skip/vrije training, aparte tijdvalidatie en dashboarduitsluiting, bewaren/heropenen en schema-7- en schema-8-upgrades. Oudere migratiefixtures verwijderen ook count_in om de bedoelde oude schema's werkelijk na te bootsen.

Electron-tests controleren een gemengde audio/metronoomsessie met herhalingen en tempowissel, de editor en opslag, toetsen, onderbreken en terugkeren, evaluaties, eigen tijdtellers en stoppen tijdens de aftelmaat zonder oefentijd of voltooide beurt. Een audioprobe meet verschillende klikfrequenties en klikafstanden, stilte van de muziek tijdens voorbereiding, muziek na de starttijd, annuleren van de toekomstige muziek en dempen.

TypeScript/build, volledige regressiereeks en controles van het verpakte Mac-programma worden vóór oplevering vastgelegd. Windows-gebruikstest en muzikale luisterbeoordeling blijven afzonderlijk open; een gebouwd Windows-pakket bewijst die niet.

Resultaten op 15 oktober 2026: productiebuild met beide TypeScript-configuraties geslaagd; **60 Node-tests en alle 20 Mac-desktoptests geslaagd**. Het verpakte Mac-arm64-programma doorstaat **5 pakkettests** voor audiobediening, gemengde aftelsessie, stoppen tijdens aftellen en bestaande sessieroutes. Twee DSP-bronprobes worden in een pakket bewust overgeslagen en zijn wel in de volledige bronreeks uitgevoerd. De stoptest wacht op werkelijk verstreken afteltijd vóór stoppen; een onmiddellijke stop vóór de eerste audiokloktick mag terecht nul tijd opslaan. Mac-arm64- en Windows-x64-zip gebouwd. Visuele controle van aftelpaneel, speler en tijdtellers uitgevoerd; `git diff --check` schoon. Windows-gebruikstest en muzikale luisterbeoordeling blijven open.


## Correctie v0.0.20 — aftelmaat per oefenblok

Gebruiker wil de bediening op dezelfde regel als de oefennaam, met onafhankelijke aftelmaat voor de volgende oefening. Het losse algemene paneel vervalt. Geraakt: bloktype/validatie, opslag/migratie, editor, runner-overgang, voorbereidingstotalen en speler/historie. Audio-engine en metronoominstellingen blijven gelijk. Belangrijkste regressierisico's zijn de maat van het vorige blok blijven gebruiken en opgeslagen voorbereiding weigeren zodra het volgende blok aftellen uit heeft. Tests controleren beide, ook wanneer dezelfde bron meerdere keren voorkomt. Nieuwe blokken erven geen oude algemene instellingen; oude snapshots gebruiken een compatibele fallback.

Resultaten v0.0.20 op 15 oktober 2026: productiebuild/typecheck en **62 Node-tests geslaagd**, inclusief onafhankelijke blokinstellingen, overstap naar aftellen-uit en migraties 7/8→9 met behouden historische gegevens. Visueel gecontroleerd dat de checkbox en maatsoort naast de oefennaam staan.

De volledige desktopreeks doorliep alle 20 tests: 18 slaagden direct; de stoptest las de status vóór de asynchrone opslag klaar was en wacht nu expliciet op stopped. Een bestaande evaluatietest stond na de start gepauzeerd en slaagde bij gerichte hercontrole. In die hercontrole werd een tweede timingaanname in de afteltest zichtbaar: Enter kon vóór het voltooien van evaluatie-opslag komen. De test wacht nu op de ingeschakelde vervolgknop; de aftelsessie slaagde daarna. De overige afteltests en beide evaluatietests slaagden bij de gerichte hercontrole. Er zijn hiervoor geen audiomotor- of evaluatiecodewijzigingen gedaan. De hierboven vermelde v0.0.19-resultaten blijven het historische testverslag van de eerste implementatie.


Verpakt Mac-arm64-programma v0.0.20: **5 tests geslaagd**, 2 DSP-bronprobes bewust overgeslagen (wel geslaagd in de broncontroles). Mac-arm64- en Windows-x64-zip gebouwd. Windows-gebruikstest en muzikale luisterbeoordeling blijven open. `git diff --check` schoon.
