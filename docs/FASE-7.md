# Fase 7 — Voortgangsdashboard (v0.0.14)

Voortgang toont eigen oefentijd, oefendagen, geoefende sessies, tempo-ontwikkeling en de laatste beoordeling van het gekozen onderdeel. Kies Deze week, Deze maand of Alle tijd. De bestaande sessiehistorie blijft onderaan beschikbaar, inclusief status, fragmenten, notities en beoordelingen.

De grafiek staat naast het laatste resultaat in de goedgekeurde donkere Mandarijn-stijl. Onder de grafiek staan dagbalken voor het oefenritme. Beide grafieken hebben uitklapbare tabellen met waarden voor toetsenbord- en schermlezergebruik.

## Betekenis van de resultaten

- Oefentijd is afgespeelde rondjetijd plus vrije fragmenttijd. Evaluaties en pauzes tellen niet mee.
- Een oefendag heeft positieve afgespeelde tijd. Een sessie zonder muziek telt niet als geoefend.
- Gestopt, onderbroken of met overgeslagen oefeningen blijft herkenbaar; afgespeelde tijd telt wel mee. Alleen volledig afgeronde sessies krijgen die status.
- De lokale startdag van de sessie bepaalt de dagindeling. De tijdzone staat in beeld. Spelen over middernacht wordt aan die startdag toegerekend omdat segmenten geen eigen tijdstempels hebben.
- Een tempo-punt is de hoogste werkelijk gespeelde BPM met een afgeronde geplande speelbeurt voor dit onderdeel in één sessie. Alleen begonnen beurten leveren geen punt, maar wel oefentijd.
- Vrije training blijft apart en toont daadwerkelijk afgespeelde BPM, zonder afgeronde beurten te suggereren. Toonhoogte, fragmentgrenzen, oefenblok, oorspronkelijke bronduur en oorspronkelijk BPM blijven in de vergelijking herkenbaar.
- Een cijfer is de laatste passende zelfevaluatie van dit onderdeel in die sessie. Het is geen automatische beoordeling van speelkwaliteit en hoort niet noodzakelijk bij uitsluitend de snelste herhaling.
- Bij Alle tijd gebruiken totalen, tempo-grafiek en historie alle opgeslagen resultaten. Alleen de dagbalken zijn beperkt tot de laatste 28 dagen; dat staat bij de grafiek.

De berekeningen gebruiken historische momentopnamen. Bewerken of verwijderen van actuele oefeningen en opbouwen verandert die resultaten niet. Deze fase verandert geen bestanden, databasevelden of audiogedrag.

## Zelf proberen

1. Open Voortgang. Zonder gespeelde muziek verschijnen nulwaarden en een uitnodiging om te oefenen.
2. Speel een sessie met volledige track en een kort fragment. Evalueer en bekijk de resultaten.
3. Kies bij Tempo-ontwikkeling een onderdeel. Volledige track en fragment krijgen verschillende meetpunten.
4. Kies vrije training: de grafiek beschrijft gespeeld tempo zonder voltooiing te claimen.
5. Open de meetpuntentabel en de sessiedetails om cijfers en notities te controleren.
6. Wissel week, maand en alle tijd. Heropen de app; resultaten blijven lokaal beschikbaar, ook offline.

## Controles

- Typecontrole en productiebuild geslaagd.
- Alle 43 Node-tests geslaagd, waaronder zeven dashboardberekeningen en een opslagtest die de grafiek vóór/na wijzigen en verwijderen vergelijkt.
- Bekende tijdtotalen gecontroleerd: 23 seconden rondje + 3 seconden vrij = 26 seconden, zonder de 170 seconden pauze.
- Kalendercontroles omvatten lokale middernacht, maandag, maandwisseling, verschillende tijdzones en wintertijd.
- Tempo-controles omvatten meerdere tempi per fragment, niet-afgeronde beurten, ontbrekende cijfers, herhaalde evaluaties, aparte rondjes/blokken, andere toonhoogte en oorspronkelijke BPM-correcties.
- Vier desktopcontroles geslaagd: volledige dashboardroute, beide evaluatieroutes en offline navigatie/heropenen. De dashboardroute controleert lege historie, volledige track, fragment, vrije training, beoordelingen, periodeselectie, gewijzigde opbouw en 960-pixelvensters.

- Vier aanvullende controles op de verpakte Mac-app geslaagd: dashboard, beide evaluatieroutes en offline navigatie/heropenen.
- Het scherm is visueel gecontroleerd; [screenshot met geïsoleerde testgegevens](screenshots/fase-7-dashboard.png). Een echte Windows-gebruikstest en muzikale luisterbeoordeling blijven open.

Mac arm64- en Windows x64-proefpakketten v0.0.14 zijn succesvol gebouwd en staan lokaal in `release/`. De Mac-app is geopend; de draaiende app en versie zijn gecontroleerd. Pakketten gaan niet in Git.
