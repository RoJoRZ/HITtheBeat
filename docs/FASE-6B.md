# Fase 6B — Direct naar eigen gegevens (v0.0.12)

De app opent meteen op Mijn oefensessies met de lokale bibliotheek. De voorbeeldomgeving, omschakelknoppen, fictieve schermgegevens en voorbeeldtablatuur zijn verwijderd. Historische designrenders en faseverslagen blijven bewaard als ontwikkelmateriaal.

Zonder oefeningen toont de startpagina Begin met jouw oefeningen en Naar oefeningen. Daar kun je via Oefening toevoegen een MP3 importeren. Met bestaande gegevens staat de sessie-editor direct klaar. Onopgeslagen wijzigingen in de editor blijven behouden bij navigeren. Voortgang toont de echte sessiehistorie; het dashboard volgt in fase 7. De aparte Audioproef blijft beschikbaar.

Er is geen opslagmigratie of wijziging aan eigen gegevens nodig. Oefeningen, media, fragmenten, sessie-opbouwen en historische momentopnamen gebruiken dezelfde opslag als v0.0.11.

## Zelf proberen

1. Open de app: Mijn oefensessies verschijnt zonder omgevingkeuze.
2. Kies een eigen sessie of voeg eerst een oefening toe via Oefeningen.
3. Start een sessie, onderbreek voor een fragmentloop, sla het fragment op en hervat.
4. Evalueer met toetsen of muis en bekijk de resultaten bij Voortgang.
5. Sluit en heropen: eigen sessies en fragmenten blijven beschikbaar.

## Controles en proefpakketten

- Typecontrole en productiebuild geslaagd.
- Alle 35 tests voor audioanalyse, opslag, migraties, fragmenten en sessielogica geslaagd.
- Alle 12 desktoptests geslaagd: eigen navigatie, lege start, offline audio, import, sessie-editor, fragmenttraining, evaluaties, heropenen en volume.
- De lege startpagina is visueel gecontroleerd.
- Vier aanvullende controles op de verpakte Mac-app geslaagd: lege start/offline heropenen, fragmenten bewaren/hergebruiken en beide evaluatieroutes.
- Mac arm64- en Windows x64-pakketten succesvol gebouwd.

De Mac arm64- en Windows x64-proefpakketten staan in `release/` en gaan niet in Git. Windows moet ook op een Windows-computer in gebruik worden getest; een cross-build bewijst dat niet. Muzikale luisterkwaliteit en BPM-detectie op uiteenlopende echte muziek blijven open.
