# Fase 3 — Eigen bibliotheek, v0.0.4

Deze oplevering maakt eigen oefeningen testbaar. De volledige rondje-afspeellijst is toegevoegd aan de voorbeeldspeler. Opslaan en uitvoeren van rondjes volgen in fase 4 en 5.

## Proberen

1. Open de Mac-app. Kies ‘Eigen bibliotheek bekijken’, daarna ‘Oefeningen’.
2. Kies ‘Oefening toevoegen’ en selecteer een MP3. De app bepaalt duur en schat BPM op de achtergrond.
3. Controleer het BPM met je gehoor en corrigeer het. Voeg naam, opdracht en eventueel PNG/JPEG/WebP-tablatuur toe. Sla op.
4. Speel de oefening, verander tempo en toonhoogte, en kies A/B om een passage te loopen. Spatie en 1 werken buiten invoervelden/knoppen.
5. Vergroot de tablatuur en sluit met Escape. Probeer ook een oefening zonder afbeelding en met een lange opdracht.
6. Via Bewerken kun je gegevens aanpassen of opnieuw analyseren. De analyse verandert het bevestigde tempo alleen via ‘Gebruik schatting’.
7. Sluit de app met Cmd+Q en open opnieuw. Je oefening blijft bewaard, ook wanneer het oorspronkelijke MP3-bestand wordt verplaatst.
8. ‘Bibliotheekmap openen’ toont waar de lokale kopieën staan.
9. Schakel terug naar voorbeelden: open een rondje en ‘Speelscherm bekijken’. Alle oefenblokken staan in de lijst; klikken wisselt de voorbeeldweergave.

## Uitgevoerde controles

- TypeScript-controle en productiebuild.
- 12 Node-tests: tempo op synthetische klik- en geplukte signalen bij 60/75/90/95/120/180/220 BPM; geen schatting voor stilte, constante toon en te korte audio; opslag en heropenen; bevestigd versus geschat tempo; metadata/afbeelding wijzigen; ontbrekend mediabestand; ongeldige invoer en pad-ID’s; bestaande lokale assetrouter.
- Electron-desktoptests op Mac: import van echt MP3-formaat met synthetisch 120-BPM-ritme (schatting 119,9 BPM), correctie naar 118, afbeelding, bewerken en heranalyse zonder correctie te overschrijven, offline afspelen en heropenen nadat het oorspronkelijke bestand is verwijderd. Ook onleesbare MP3, handmatig BPM zonder schatting, geen afbeelding, lange opdracht en kleiner venster.
- Bestaande desktopcontroles voor audio, toetsen/focus, DSP bij 25–300%, voorbeeldschermen, offline openen en desktopisolatie.

De screenshots gebruiken uitsluitend gegenereerde testgegevens: [eigen bibliotheek](screenshots/fase-3-bibliotheek.png) en [volledig rondje in de voorbeeldspeler](screenshots/fase-3-rondje-in-speler.png).

## Grenzen en nog te beoordelen

De detector is een eerste eenvoudige pulsdetector (eerste 90 seconden, 40–240 BPM). Synthetische signalen bewijzen geen algemene nauwkeurigheid op muziek. Probeer meerdere echte gitaar-/andere oefeningen: half/dubbele telling, zachte aanslagen, syncopen en rubato vragen een gehoorcontrole. Handmatig BPM blijft beschikbaar.

Er zijn nog geen opgeslagen rondjes, sessies, evaluaties of echte voortgang. Voorbeeldwijzigingen blijven tijdelijk. Het testen van muzikale afspeelkwaliteit op echte oefeningen en de Windows-gebruikstest staan nog open. Het Windows-pakket wordt hier alleen gebouwd. Backup/export, verwijderen van hele oefeningen en vervangen van een audiotrack binnen dezelfde oefening zijn nog niet gebouwd.

Bibliotheekgegevens staan buiten deze repository onder de lokale HITtheBeat-appgegevens. Deze gegevens worden niet naar GitHub gestuurd.

## Proefpakketten en pakketcontrole

- Mac arm64: `release/HITtheBeat-0.0.4-mac-arm64.zip`, lokaal ad-hoc ondertekend. De verpakte app doorliep vier desktoptests: offline audio/bediening, eigen bibliotheek, voorbeeldschermen met volledige rondjelijst en heropenen/isolatie. Alle vier slaagden. Twee ontwikkel-/DSP-brontests zijn in dit pakket bewust overgeslagen; die zijn afzonderlijk in de ontwikkelcontrole geslaagd.
- Windows x64: `release/HITtheBeat-0.0.4-win-x64.zip` is succesvol gebouwd. Niet op Windows gestart of beluisterd.
- De automatische tests gebruiken synthetische testmedia en schrijven geen persoonlijke muziek naar Git. Screenshots zijn visueel bekeken. Bij 1440×960 passen de rondjelijst, tablatuur en volledige afspeelknop samen in beeld; kleinere vensters kunnen verticaal scrollen.

Volgende fase na feedback: opgeslagen rondjes met een eigen tempo-opbouw per oefenblok, tabelbediening en meerekenende totale duur. De echte automatische rondje-uitvoering wordt daarop aangesloten in fase 5.
