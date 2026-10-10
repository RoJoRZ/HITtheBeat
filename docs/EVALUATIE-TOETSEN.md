# Evaluatie met toetsenbord — v0.0.9

De gebruiker heeft het voorstel voor opeenvolgende invoerstappen goedgekeurd. De echte rondjespeler biedt nu een cijfer 1–5, een tempokeuze en zo nodig een BPM-aanpassing. De bestaande fragmentgrenzen, tijdregistratie en toepassing op één oefenblok blijven gelden.

## Proberen

1. Start een eigen oefenrondje en speel tot de evaluatie. De beoordeling krijgt automatisch de toetsenbordfocus.
2. Druk bijvoorbeeld **4**, daarna **3**, typ **7** en druk **Enter**: bewaar 4/5 en verhoog alle stappen van deze oefening binnen dit rondje de volgende keer met 7 BPM.
3. Bij de volgende evaluatie kun je direct **Enter** drukken: bewaar 3/5 en houd het tempo gelijk.
4. Voor langzamer: kies een cijfer, druk **1**, vul het aantal BPM in en druk Enter. **2** houdt het tempo gelijk.
5. Gebruik dezelfde knoppen met de muis. Tab/Shift+Tab of aanklikken laat je eerdere keuzes corrigeren. Vanuit het notitieveld bewaart Enter ook en gaat het door.
6. Bekijk de cijfers en tempo-aanpassingen bij **Voortgang → Fragmenten en evaluaties bekijken**. Sluit en heropen de app om te zien dat ze bewaard blijven.

Het BPM-veld begint met geselecteerde **5**, zodat typen dit direct vervangt. Ongeldige invoer of een opslagconflict laat de evaluatie open. Tijdens bewaren worden dubbele acties geblokkeerd; de bestaande evaluatie-ID voorkomt dubbele tempo-aanpassingen. Deze serie opnieuw blijft beschikbaar met de muis en via Tab gevolgd door Spatie. Enter betekent steeds bewaren en door.

Nieuwe evaluaties krijgen een cijfer; historische evaluaties zonder cijfer worden niet achteraf beoordeeld. Persoonlijke gegevens blijven in de lokale bibliotheek.

## Controles

- Build en TypeScript-controles geslaagd.
- 32 Node-tests geslaagd, inclusief geldige/ongeldige cijfers, standaard 3, bewaren en opnieuw openen.
- Vijf relevante desktoptests geslaagd: cijfers en tempo met toetsenbord/muis, Enter met standaardwaarden en vanuit notitie, ongeldige BPM-invoer, dezelfde serie herhalen, een gewijzigd toekomstig rondje, historie na heropenen, speler/fragmenttraining, ontbrekende media en volumeregeling.

## Pakketten

De Mac arm64- en Windows x64-proefpakketten staan in `release/`. De twee evaluatiecontroles zijn ook op de verpakte Mac-app geslaagd. Windows-gebruik en luisterbeoordeling blijven op een Windows-computer uit te voeren.

[Schermafbeelding van de evaluatie](screenshots/evaluatie-toetsen.png)
