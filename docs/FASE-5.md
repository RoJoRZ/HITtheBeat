# Fase 5 — Het hele rondje spelen, v0.0.6

Eigen opgeslagen rondjes zijn aangesloten op de speler. Resultaten en evaluaties worden in deze fase nog niet bewaard.

## Proberen

1. Open de eigen omgeving, kies een rondje met meerdere oefeningen en sla eventuele wijzigingen op.
2. Kies ‘Rondje starten’. Alle oefeningen staan in de lijst. Start de eerste speelbeurt met Afspelen.
3. Controleer de opgeslagen tempo-opbouw, bijvoorbeeld 1×75, 2×95 en 1×85 BPM. Stap en herhaling lopen automatisch door; een gepland fragment stopt bij B.
4. Pauzeer halverwege. Afspelen gaat op dezelfde positie verder. Met 1 of de herstartknop begint dezelfde herhaling opnieuw.
5. Kies tijdens de tweede speelbeurt ‘Fragment oefenen’. Stel een kort A/B-fragment, een ander BPM en een andere toonhoogte in. Start de vrije loop.
6. Kies ‘Terug naar rondje’. Het oorspronkelijke BPM/fragment/toonhoogte zijn terug; dezelfde herhaling begint opnieuw. Was het rondje voor de onderbreking gepauzeerd, start dan zelf met Afspelen.
7. Na de opbouw verschijnt de tijdelijke terugblik. Kies opnieuw oefenen of Verder. De volgende oefening laadt haar eigen opbouw. Na de laatste oefening kun je het rondje afronden.
8. Probeer overslaan: de lijst noemt dit expliciet en de afsluiting suggereert niet dat alle oefeningen zijn gespeeld.
9. Navigeren of ‘Rondje stoppen’ pauzeert en vraagt bevestiging. Verder oefenen behoudt de tellers en blijft gepauzeerd; stoppen behoudt je opgeslagen rondje.
10. Beoordeel de scheiding tussen resterende geplande tijd en werkelijk afgespeelde tijd in rondje-/fragmentmodus. Tijden verdwijnen bij afsluiten: er is nog geen sessiehistorie.

## Grenzen

Er is geen aftellen of ingestelde extra pauze. Audio stopt op de audioklok bij B, maar de volgende speelbeurt wordt vanuit de UI-toestand gestart; naadloze overgangen zijn nog niet gegarandeerd. Toetsen werken buiten invoervelden, knoppen en dialogen. Toonhoogte per tabelrij, definitieve evaluatie, tijdregistratie en bewaren van sessies zijn nog volgende keuzes/fases.

BPM-herkenning en muzikale afspeelkwaliteit op diverse echte oefeningen blijven te beoordelen. Windows moet op Windows worden uitgevoerd en beluisterd. Tijdelijke testmedia en screenshots bevatten geen persoonlijke muziek.

## Gerichte controles

- 19 Node-tests geslaagd, waaronder de nieuwe toestandsproeven voor exact vier speelbeurten (75/95/95/85), overgang na terugblik, meerdere vrije onderbrekingen, pauze, herstart, overslaan, resterende duur en onafhankelijkheid van de momentopname.
- De volledige desktoproute met MP3 is geslaagd: tijdens de tweede stap vrij loopen op ander tempo/toonhoogte, terugkeren naar dezelfde herhaling op 95 BPM, pauzeren/herstarten, Verder naar de andere oefening en vijf afgeronde speelbeurten tellen. De bestaande desktopcontroles voor bibliotheek, editor, voorbeelden, audio/DSP en heropenen zijn eveneens geslaagd.
- Aanvullend zijn stoppen/annuleren, overslaan, ontbrekend mediabestand zonder tellerverhoging, opnieuw laden en de ontwikkelspeler onder React StrictMode gecontroleerd. De definitieve pakketcontrole volgt hieronder.
- Een onafhankelijke audio-uitgangsmeting bevestigt geluid tijdens een eenmalig segment, stilte na B en daarna hoorbare uitvoer van een blijvende vrije loop. De engine stopt dus niet alleen haar zichtbare teller.

## Pakketcontrole

Het Mac-pakket van versie 0.0.6 is gebouwd. De pakketcontroles voor opstarten, bibliotheek, rondjes, audio en de volledige speelroute zijn geslaagd (7 geslaagd; 2 controles voor broncode apart uitgevoerd). De twee sessiecontroles zijn na de laatste correctie aan veldinvoer opnieuw op het definitieve Mac-pakket geslaagd. Een klik op Afspelen of Terug naar rondje verwerkt daarbij ook een nog actief invoerveld.

Het Windows x64-pakket is eveneens gebouwd. Het is nog niet op een Windows-computer uitgevoerd of beluisterd.

- [Speler met het volledige rondje](screenshots/fase-5-speler.png)
- [Vrije fragmenttraining tijdens een rondje](screenshots/fase-5-fragmenttraining.png)
