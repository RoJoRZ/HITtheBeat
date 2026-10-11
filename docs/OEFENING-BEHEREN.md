# Oefeningen beheren en appicoon — v0.0.16

- Oefeningen heeft nu Oefening verwijderen met bevestiging. Bij gebruik in opgeslagen opbouwen noemt de foutmelding de sessies waaruit de oefening eerst moet worden verwijderd. Historische resultaten blijven behouden.
- Bewerken bevat Audiobestand vervangen (MP3 of M4A). De bestaande naam, opdracht, tablatuur en fragmenten blijven behouden. Opslaan past de audio toe; Annuleren bewaart de bestaande versie. De nieuwe audio krijgt opnieuw duur-, BPM- en volumeniveauanalyse. Origineel BPM blijft een handmatige keuze.
- Fragmentgrenzen en opgeslagen sessies worden vóór vervanging gecontroleerd. Een korter bestand of een BPM-verandering die bestaande stappen ongeldig maakt wordt geweigerd met uitleg.
- Alle zichtbare rondje-termen heten nu sessie, inclusief starten, opslaan, verwijderen, speler en voortgang. Historische opgeslagen titels worden niet gewijzigd.
- Nieuw compact icoon: H en audiostreepjes, Mandarijn op Studio donker. Het volledige logo linksboven blijft behouden.

## Controles

47 Node-tests geslaagd, inclusief vervanging, weigering bij ongeldige grenzen/tempo, mediabewaring en -opruiming, verwijderbeveiliging en behoud van historische resultaten na heropenen. TypeScript en productiebuild geslaagd. Volledige Mac-desktopreeks: 15 tests geslaagd, inclusief audiovervanging, annuleren en bevestigen van verwijderen. Visuele controle van het gegenereerde icoon uitgevoerd. Het gebouwde Mac-pakket doorstaat aanvullend de vier desktopcontroles voor bibliotheek, sessie-editor, fragmenten en appnavigatie. Mac- en Windows-zipproefpakketten gebouwd met eigen icoon. Een Windows-build is geen Windows-gebruikstest.

## Zelf proberen

1. Open Oefeningen, kies een oefening en klik Bewerken. Kies nieuwe audio en sla op. Controleer BPM, fragmenten en afspelen.
2. Verwijder een ongebruikte oefening; probeer eerst Annuleren. Een gebruikte oefening vermeldt de opbouwen die je eerst moet aanpassen.
3. Bewerk een oefensessie: de acties heten Sessie opslaan en Sessie starten.
4. Bekijk het icoon in het Dock en bij de app in Finder.

Windows-gebruikstest, muzikale luisterbeoordeling en fase 8 blijven open.

## Gebruiksfeedback

Op 11 oktober 2026 meldt de gebruiker na gebruik van v0.0.16 dat alles lijkt te werken. De wijzigingen zijn in gebruik goedgekeurd; de hierboven genoemde open controles blijven afzonderlijk staan.
