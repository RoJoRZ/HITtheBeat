# Benoemde fragmenten — v0.0.11

Fragmenten horen nu bij een oefening en zijn herbruikbaar in meerdere oefensessies. De eigen tabel en voorbeeldtabel delen de fragmentkiezer en tijdinvoer. De wijziging is op 11 oktober 2026 door de gebruiker goedgekeurd.

## Proberen

1. Open **Oefeningen** en kies een oefening. Onder de speler staat **Opgeslagen fragmenten → Fragment toevoegen**.
2. Geef een naam, bijvoorbeeld Lastige overgang, en vul Begin A en Einde B in seconden in. Een komma of punt is mogelijk. Bewaar het fragment.
3. Maak of bewerk een oefensessie. Kies bij Fragment de naam. De A/B-grenzen verschijnen en de totale geplande duur rekent mee. Herhalingen en BPM blijven vrij instelbaar.
4. Je kunt ook **Eigen fragment A–B** kiezen en rechtstreeks seconden invullen. Een veld tijdelijk leegmaken of een decimaal getal typen blijft mogelijk; ongeldige grenzen verhinderen opslaan.
5. Start de sessie en kies **Fragment oefenen**. Stel A en B in en loop de passage. Kies **Fragment opslaan**, geef een naam en klik **Fragment bewaren**. Een lopende loop gaat door tijdens bewaren.
6. Kies **Terug naar rondje**. De oorspronkelijke instellingen worden hersteld; de onderbroken geplande speelbeurt begint opnieuw en het rondje gaat verder.
7. Het nieuwe fragment is daarna in de sessietabel beschikbaar. Het wordt niet automatisch aan de lopende opbouw toegevoegd. Sluit en heropen de app: naam en grenzen blijven bewaard.

De losse oefeningspeler biedt eveneens Fragment opslaan. Een opgeslagen fragment bevat alleen naam en A/B-grenzen. Het bewaart geen tempo of toonhoogte. De speler beperkt een opgeslagen eindgrens tot de bekende originele trackduur, zodat kleine verschillen tussen decodeersamplers geen fragment buiten de track opleveren.

## Bestaande opbouwen behouden

Bij het kiezen kopieert een sessiestap naam en grenzen. Later een bibliotheekfragment bewerken of verwijderen verandert bestaande opbouwen en gespeelde historie niet. De kiezer toont dan de **bewaarde selectie** met haar oorspronkelijke tijden. Kies opnieuw het actuele fragment om nieuwe grenzen over te nemen. Handmatig A of B wijzigen maakt de stap een eigen fragment.

Benoemde fragmenten kunnen bij de oefening worden bewerkt of verwijderd. Namen zijn uniek per oefening. Media en bestaande opbouwen blijven bewaard bij de upgrade naar schema 5.

## Controles

- Build en TypeScript-controles geslaagd.
- 35 Node-tests geslaagd, inclusief fragmentvalidatie, namen per oefening, behoud van metadata en media, bewaren/heropenen, ongewijzigde opbouwen en sessiemomentopnamen en migratie vanaf schema 4.
- De bestaande desktoproutes voor bibliotheek, sessietabel, speler, ontbrekende audio en evaluaties zijn geslaagd.
- De nieuwe desktoproute is geslaagd: fragment bij de oefening toevoegen, decimale komma typen, kiezen in een training, een lopende vrije loop bewaren, oorspronkelijke speelbeurt hervatten, nieuw fragment hergebruiken, heropenen en gewijzigde bron als bewaarde selectie tonen.
- De voorbeeldschermen zijn gecontroleerd met de gedeelde fragmentkiezer en tijdvelden.

## Schermafbeeldingen

- [Fragmenten bij de oefening](screenshots/fragmenten-bibliotheek.png)
- [Een benoemd fragment kiezen in de sessietabel](screenshots/fragmenten-sessietabel.png)
- [Fragment bewaren tijdens vrije training](screenshots/fragmenten-vrije-training.png)

## Pakketten

Het Mac arm64-proefpakket staat in release/. Op de verpakte app zijn drie desktopcontroles geslaagd: de volledige fragmentroute, de eigen sessie-editor en de voorbeeldschermen. Het Windows x64-proefpakket staat eveneens in release/; een echte Windows-gebruikstest blijft open.
