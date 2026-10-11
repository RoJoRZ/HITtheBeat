# Recent sessieoverzicht — v0.0.13

Mijn oefensessies opent met maximaal tien kaarten. Iedere kaart toont een opgeslagen opbouw met geplande duur, aantal oefeningen en laatste oefenmoment. Starten opent direct de speler; Bewerken opent de tabel. Nieuwe oefensessie maakt een nieuwe opbouw.

Bij meer dan tien opbouwen verschijnt Alle oefensessies. Daar zijn alle opbouwen beschikbaar en kun je op naam zoeken. Terug naar recente sessies wist het zoekfilter. Nieuwe sessies zijn meteen zichtbaar. Een eerder gestarte opbouw sorteert op haar laatste startmoment; nog nooit gestarte opbouwen op hun laatste opslagmoment. Alle uitvoeringen blijven apart bij Voortgang.

Stoppen of afronden brengt je terug naar het overzicht. De editor biedt Terug naar overzicht en beschermt onopgeslagen wijzigingen met de bestaande dialoog. Naar Oefeningen navigeren en terug behoudt de editorinvoer.

## Zelf proberen

1. Open de app: de editor is gesloten en je eigen recente opbouwen verschijnen.
2. Start een sessie rechtstreeks vanaf een kaart en stop: het overzicht verschijnt opnieuw.
3. Kies Bewerken, wijzig de naam en ga terug: kies verder bewerken of wijzigingen verwerpen.
4. Maak een nieuwe sessie, sla op en ga terug: de nieuwe kaart staat bovenaan.
5. Bij elf of meer opbouwen: open Alle oefensessies en zoek op naam.
6. Heropen de app: de volgorde blijft gebaseerd op bewaarde gegevens.

## Controles

- Typecontrole en productiebuild geslaagd.
- Alle 35 tests voor opslag, migraties, audioanalyse en sessielogica geslaagd.
- De twaalf bestaande desktoptests slagen met de nieuwe navigatie.
- De nieuwe overzichtstest slaagt: nul/tien/elf sessies, nieuwe sessie bovenaan, zoeken met hoofdletters, geen zoekresultaat, direct starten, terug naar recent, bijgewerkte volgorde, onopgeslagen wijzigingen en heropenen.
- Het overzicht is visueel gecontroleerd op 960 pixels breed, zonder horizontale overflow. - Vier aanvullende tests op de verpakte Mac-app slagen: overzicht, volledige sessie, ontbrekende audio en offline heropenen.

De bestaande SQLite-opslag en mediabestanden veranderen niet. Windows-gebruik en muzikale luisterbeoordeling blijven afzonderlijke open controles.

Mac arm64- en Windows x64-proefpakketten v0.0.13 zijn succesvol gebouwd en staan lokaal in `release/`. De Mac-app is geopend en haar draaiende proces gecontroleerd. Pakketten gaan niet in Git; Windows is nog niet op een Windows-computer getest.
