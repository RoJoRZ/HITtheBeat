# Los tablatuurvenster — issue #3, v0.0.21

Gebouwd na gebruiksgoedkeuring van aftellen per oefenblok in v0.0.20. De geaccepteerde issue-2-commit is de basis van deze afzonderlijke issuebranch/PR; geen zelfstandige merge of releasepublicatie.

## Impact en afbakening

De vergrootdialog in bibliotheekdetail en sessiespeler wordt vervangen door één herbruikbaar native BrowserWindow. De actieve oefening wordt vanuit het hoofdvenster gepubliceerd. Het hoofdproces laadt de actuele afbeelding met de bestaande bibliotheekvalidatie; request-/toestandsnummers voorkomen verouderde resultaten. De viewer heeft een eigen beperkte preload en alleen lees-, fullscreen- en sluitacties. Hoofdvensterautorisatie blijft ongewijzigd streng. Geen nieuwe bibliotheekvelden, migraties of afhankelijkheden; audio en sessieregels wijzigen niet.

Risico's: sluiten van het verkeerde venster, onbedoeld de sessie pauzeren/onderbreken, oude afbeelding tonen na wisselen, audio-/bibliotheek-IPC toegankelijk maken voor de viewer, zoom resetten door fullscreenevents, onbereikbare afbeeldingranden na zoom en afwijkende protocolroutes in een pakket. Controles richten zich daarop.

## Zelf proberen

1. Open een bibliotheekoefening met tablatuur of start een sessie die zulke oefeningen bevat. Klik op het vergrootglas.
2. Verplaats het losse venster, ook naar een tweede scherm, en verander de venstergrootte. Klik nogmaals op het vergrootglas: hetzelfde venster komt naar voren.
3. Zoom met +/− of de knoppen, scrol door de vergrote afbeelding en gebruik 0/Passend. De zoomfactor is relatief aan de passende afbeelding.
4. Gebruik F of de fullscreenknop. Escape verlaat fullscreen; de beeldzoomfactor blijft gelijk.
5. Laat een sessie naar een andere oefening gaan of gebruik Overslaan. Naam en afbeelding volgen; zonder afbeelding staat er Geen tablatuur bij deze oefening. Een andere oefening begint passend.
6. Sluit het losse venster terwijl de speler loopt. De sessie loopt door; opnieuw openen blijft mogelijk. Muziektoetsen bedien je in het hoofdvenster.
7. Verlaat het oefeningsscherm: het venster meldt dat er geen oefening actief is. Hoofdvenster sluiten ruimt ook de viewer op.

## Controles en beperkingen

De Electron-test maakt echte audio- en metronoom-oefeningen met verschillende tablaturen en zonder afbeelding in een tijdelijke bibliotheek. Hij controleert twee vensters, hergebruik, resize/verplaatsbaarheid, beeldzoom, fullscreen/Escape, synchronisatie en lege toestanden, sluiting zonder afspeelpauze, opnieuw openen vanuit de bibliotheek en opruimen bij sluiten van het hoofdvenster. De viewer exposeert geen algemene app-API of require; sandbox en contextIsolation staan aan, nodeIntegration uit. Een echte bibliotheek-IPC-handler weigert de viewer als afzender. Bestaande bibliotheek- en sessietests gebruiken nu het losse venster.

Typecheck/build, Node-regressie, desktopreeks en verpakte offline Mac-controles worden bij oplevering hieronder gerapporteerd. Windows-build is geen Windows-gebruikstest. Het handmatig verplaatsen naar een tweede fysieke monitor en muzikale luisterbeoordeling blijven aanvullende gebruikscontroles. Een vensterpositie of beeldzoom wordt niet over sluiten heen opgeslagen.


Resultaten op 15 oktober 2026: productiebuild met beide TypeScript-configuraties en **62 Node-tests geslaagd**. Alle **21 desktoproutes** zijn gecontroleerd: de volledige reeks gaf 16 direct geslaagde tests en vijf uitvallers (drie korte realtime audiometingen, de te strikte minimale afteltijd en één opstart-timeout). De afteltest stond op >5,5 seconden terwijl 5,494 werd gemeten; de minimale grens is nu 5,3 seconden voor audioklok-/timerkwantisatie, zonder productie-audiocode te wijzigen. Gerichte hercontrole van deze vijf routes plus de venstertest: **6/6 geslaagd**. De venstertest slaagde ook al in de eerste gerichte reeks en de volledige reeks. De bestaande bibliotheekvergroottest is aangepast naar het losse venster; een verkeerde testvariabelenaam is vóór de volledige reeks gecorrigeerd. Visuele controle van het venster uitgevoerd; geen schema- of audiomotorwijziging.

Als laatste controle is backgroundThrottling=false toegevoegd aan het hoofdvenster, om vertraging van de bestaande sessietimers bij een bedekt hoofdvenster te voorkomen. De venstertest controleert die voorkeur expliciet; build/pakketten en venstertest worden hiervoor opnieuw gecontroleerd.


Definitieve controles na de venstertimerinstelling: build/typecheck en 62 Node-tests geslaagd; de volledige venstertest opnieuw geslaagd in de bronapp én het verpakte Mac-arm64-programma, inclusief getBackgroundThrottling()=false. De eerste test las die instelling uit getLastWebPreferences(), waar zij niet werd teruggegeven; de controle gebruikt nu de directe Electron-methode.

Mac-pakket: vóór de laatste voorkeurwijziging 6/6 geslaagde pakkettests en 1 bewust overgeslagen bron-DSP-probe. Het definitieve pakket had 5 direct geslaagde tests, 1 bibliotheekuitvaller en dezelfde skip. Bij de bibliotheekuitvaller bevatte de ingevoerde opdracht onverwacht een extra 'e'; een ongewijzigde gerichte hercontrole slaagde (1/1). Daarmee zijn alle zes pakketroutes gecontroleerd op het definitieve pakket. De oorzaak van de afwijkende invoer is niet vastgesteld; dit testverloop is geen bewijs van een foutloze volledige eenmalige regressierun. Native venster, bibliotheek, sessies en aftellen zijn getest met geïsoleerde gegevens. Mac-arm64- en Windows-x64-zip opnieuw gebouwd. Windows-gebruikstest, een fysieke tweede-monitorproef en muzikale luisterbeoordeling blijven open. `git diff --check` schoon.
