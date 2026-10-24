# Waveformselectie — issue #4, v0.0.22

Gebouwd na gebruiksgoedkeuring van het losse tablatuurvenster in v0.0.21. Afzonderlijke issuebranch vanaf de geaccepteerde issue-3-commit; geen zelfstandige merge of releasepublicatie.

## Impact

Een gedeelde WaveformEditor vervangt de vaste 220-balkjesweergave in SessionPlayer en AudioLab. De piekenpiramide bewaart detail uit alle kanalen bij zoom; canonieke selectiegrenzen blijven bronseconden. Alleen de viewport verandert bij zoomen/pannen. Selectie- en markersleepbewegingen worden lokaal getoond en pas bij loslaten naar de speler gestuurd. De sessiespeler gebruikt de bestaande fragmentfase, pauzeert en bewaart haar hervatcontext; preview start de gekozen loop expliciet. De losse speler deelt de bediening. Geen wijziging aan audiomotor, IPC, schema of geplande stappen.

Regressierisico's: pixels als opgeslagen grenzen gebruiken, zoom die selectie verschuift, omgekeerde/korte/buiten-track-selecties, overspoelen van de audioqueue tijdens slepen, onbedoeld aanpassen van een sessie-opbouw of historische tijdcontext, verloren afspeelplek en verdwenen korte pieken bij zoom. Coördinaten-/piekentests en echte Electron-muisbediening controleren deze routes.

## Zelf proberen

1. Open een audio-oefening of start een sessie met audio. Sleep over de waveform om een passage te kiezen. In een sessie verschijnt Vrij fragment oefenen en pauzeert de muziek.
2. Versleep A en B. Linksom selecteren kan ook. Bij de markeringen werken pijltjestoetsen (0,01 s), Shift+pijl (0,1 s) en Home/End.
3. Zoom met +/−, verschuif met de onderste schuif/pijlen en gebruik Toon selectie. A/B blijven dezelfde bronseconden. Zet Verschuiven aan om het beeld met de muis te slepen; zet het uit om opnieuw te selecteren.
4. Gebruik de bestaande numerieke A/B-velden; Enter bevestigt de invoer. De waveform toont dezelfde grenzen. Hele track herstelt het overzicht.
5. Klik Fragment beluisteren: de selectie loopt op het gekozen tempo en met gekozen toonhoogte. Gebruik Pauzeren om de preview te stoppen.
6. Sla de passage met een naam op voor later gebruik. De geplande sessiestappen veranderen hierdoor niet.
7. Terug naar sessie herneemt de onderbroken geplande herhaling volgens de bestaande pauze-/aftelregels. Vrije loops tellen niet als geplande herhalingen. Metronoom heeft geen waveformselectie.

## Controles

Node-tests: geheugenbegrensde piekenpiramide, korte transiënten in beide stereokanalen, zichtbare uitsnedes, omgekeerde selectie, trackgrenzen/minimumduur, broncoördinaten na zoom en geklemde viewports.

Electron-test: echte muisselectie, zoom/pan zonder grenswijziging, marker slepen na zoom, toetsen, omgekeerde selectie, handmatige invoer, looppreview en aparte fragmenttijd, benoemd fragment bewaren, ongewijzigde sessie-opbouw en hervatten, metronoomtoestand en losse oefeningspeler. Bestaande fragment- en sessietests worden meegenomen. Testdata blijven geïsoleerd van de persoonlijke bibliotheek.

Productiebuild/typecheck, regressieresultaten en pakketcontroles worden hieronder vastgelegd. Windows-gebruikstest en muzikale luisterbeoordeling blijven aanvullende controles; een cross-build bewijst die niet.


Resultaten op 16 oktober 2026: productiebuild met beide TypeScript-configuraties en **64 Node-tests geslaagd**. De gerichte fragment-/sessie-/waveformreeks slaagde 4/4. De volledige desktopreeks doorliep 22 tests: 19 direct geslaagd, drie bestaande realtime audioprobes uitgevallen. De definitieve waveformtest met expliciete muis-pancontrole slaagde ook bij de hercontrole.

Een extra diagnose van de realtime probes liet zien dat een AudioContext na resume als running stond, maar de audioklok aanvankelijk ongeveer 0,6 seconde op 0,0058 seconde bleef staan. De probes wachtten op computertijd en lazen daardoor vóór de geplande audiosignalen. Een onderzochte analyser-aftakking verklaarde dit niet; die wijziging is teruggenomen. Alleen de meetopstelling is aangepast: segment-, volume-, aftel- en metronoomprobes wachten via tests/audio/audio-clock.ts op verstreken audiotijd, met een begrensde computertijd als timeout. Signaal-, frequentie- en stiltecriteria blijven gelijk; productie-audiomotor is ongewijzigd. De drie audiotests slaagden daarna **3/3**, inclusief alle tempo/toonhoogte-, normalisatie/volume-, B-grens-, aftel- en klikcontroles. Geen claim van een foutloze volledige eenmalige regressierun.


Verpakt Mac-arm64-programma v0.0.22: **6/6 pakkettests geslaagd**, één bron-DSP-probe bewust overgeslagen (wel geslaagd in de broncontrole). Audio/toetsen, bestaande fragmentopslag, tablatuurvenster, sessiehervatting en de volledige waveformroute inclusief muis-pan en losse speler zijn getest. Visuele controle uitgevoerd; `git diff --check` schoon. Mac-arm64- en Windows-x64-zip gebouwd. Echte Windows-gebruikstest en muzikale luisterbeoordeling blijven open.


## Gerichte reparatie #36 — 24 oktober 2026

Risico: een invoeromgeving zonder succesvolle pointer capture kan slepen buiten de SVG verliezen; een ontbrekend laatste move-event laat verouderde grenzen staan. De gedeelde editor krijgt een terugval en verwerkt de loslaatcoördinaat. Geen wijziging aan audio-engine, opslag of snapshots. Zelfreview controleert listeneropruiming en pointeridentiteit; dit is geen onafhankelijke menselijke review.

| Controle | Reden / resultaat |
| --- | --- |
| Typecheck + productiebuild | Gedeelde React-bediening; geslaagd (bestaande bundelwaarschuwingen) |
| tests/waveform.test.mjs | Broncoördinaten/minimumgrenzen/pieken; 2/2 geslaagd |
| tests/desktop/waveform.spec.ts | 2/2 geslaagd op Mac: normale capture en geforceerde capturefout in beide spelers; zoom/pan, A/B, buiten waveform loslaten, release zonder move, klik/annuleren, preview, opslaan en sessiehervatting |
| Windows/invoerapparaat betrokken gebruiker | Open; oorzaak op die machine niet bevestigd |
| Volledige releasegroep/installers/luisteracceptatie | Uitgesteld naar release; niet nodig voor deze lokale pointerwijziging |

Tests gebruiken uitsluitend tijdelijke geïsoleerde gebruikersdata. Eerste sandboxstart van Electron werd door de omgeving geblokkeerd; uitvoering buiten de sandbox is nodig. De nieuwe opeenvolgende sleepcontrole wacht expliciet tot de eerdere audio-opdracht klaar is.
