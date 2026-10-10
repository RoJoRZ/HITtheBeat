# Fase 4 — Opgeslagen oefenrondjes, v0.0.5

Deze oplevering verbindt de eigen bibliotheek met een echte rondje-editor. Het automatisch uitvoeren van rondjes volgt in fase 5.

## Proberen

1. Kies ‘Eigen bibliotheek bekijken’. Voeg zo nodig eerst een eigen oefening toe onder ‘Oefeningen’.
2. Open ‘Mijn oefenrondjes’ en kies ‘Oefenrondje maken’. Geef het een naam, bijvoorbeeld Warming-up.
3. Kies de bron-oefening in de blokkop. Voeg stappen toe en vul bijvoorbeeld 1×75, 2×95 en 1×85 BPM in. De bron bepaalt het toegestane bereik van 25–300%.
4. Kies bij een stap ‘Fragment A–B’ en vul begin/einde in bronseconden in. De totale duur rekent mee.
5. Voeg een andere oefening toe aan het rondje. Verplaats blokken en stappen met de pijlen.
6. Sla op. Maak een tweede rondje met dezelfde oefening en een andere opbouw. Controleer dat het eerste rondje zijn eigen instellingen houdt.
7. Sluit de app en open opnieuw: beide rondjes en hun volgorde zijn bewaard.
8. Probeer ongeldige fragmentgrenzen, leeg BPM of nul herhalingen. Opslaan is dan geblokkeerd en de duur wordt ‘—’.
9. Verander een rondje zonder opslaan en wissel naar een ander rondje. Kies verder bewerken of bewust verwerpen. Navigeren naar de bibliotheek en terug behoudt het concept. Sla op voordat je de app afsluit.
10. Verwijder desgewenst een testrondje. De app vraagt bevestiging en de oefeningen blijven in de bibliotheek.

## Controles

De automatische controles omvatten duurberekening (60 seconden op half tempo wordt 120; twee keer 10 seconden op half tempo wordt 40), tempogrenzen, ongeldige fragmenten/herhalingen, onafhankelijke opbouw per rondje, volgorde na heropenen en terugrollen van een mislukte transactie. Een versie-1-database wordt gemigreerd met behoud van bestaande oefeningmetadata.

De desktopcontrole maakt twee rondjes in een tijdelijke bibliotheek, past fragmenten en tempo-opbouw aan, verplaatst blokken/stappen, bewaart, heropent en verwijdert een rondje. Ook behoud van concept bij navigatie, verwerpen bij rondjewissel en tabelscroll op een kleiner venster worden gecontroleerd. Testmedia zijn synthetisch; persoonlijke oefeningen komen niet in Git.

## Grenzen

Toonhoogte per stap blijft een open functionele keuze. Er zijn nog geen automatische rondje-uitvoering, sessieresultaten of evaluaties op eigen gegevens. Conceptsherstel na app-afsluiting is nog niet gebouwd. Muzikale luisterkwaliteit, BPM-nauwkeurigheid op diverse echte oefeningen en Windows-gebruik blijven open. Een Windows-build is geen gebruikstest.

## Uitgevoerde controles op Mac

- TypeScript-controle en productiebuild geslaagd.
- Alle 16 Node-tests geslaagd, inclusief de vier nieuwe tests voor rondjes, transacties en schema-upgrade.
- Alle zeven desktoptests geslaagd: de nieuwe editorproef en de bestaande bibliotheek-, voorbeeldscherm-, audio-, DSP-, ontwikkelserver- en heropencontroles.
- [Screenshot van de editor](screenshots/fase-4-rondje-editor.png) visueel gecontroleerd. Alleen synthetische testgegevens zijn afgebeeld.

## Pakketcontrole

De verpakte Mac-app v0.0.5 heeft alle vijf toepasselijke desktoptests doorstaan: eigen rondjes, bibliotheek, voorbeeldschermen, audio/bediening en heropenen/isolatie. De twee bron-/ontwikkeltests zijn in het pakket bewust overgeslagen en zijn apart geslaagd. Het Mac-proefpakket staat in `release/HITtheBeat-0.0.5-mac-arm64.zip` en is lokaal ad-hoc ondertekend.

Het Windows-x64-proefpakket `release/HITtheBeat-0.0.5-win-x64.zip` is succesvol gebouwd. Het is nog niet op Windows uitgevoerd. Pakketten zijn geen distributierelease met installatieprogramma of certificaat.
