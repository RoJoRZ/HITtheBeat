# Release 1.1.1 — voorbereiding

Gebruiker heeft op 24 oktober 2026 PR #37 gecontroleerd en expliciet merge en nieuwe release opgedragen. PR #37 is samengevoegd op 283065a5dc136269bd8a9054b0a711185b4595b2; issue #36 gesloten. Gerichte native Mac/Windows-CI: run 40079726724 geslaagd.

## Wijziging en beperkingen

Defensieve A/B-sleepbediening in beide audioplayers: terugval wanneer pointer capture faalt, loslaten buiten waveform en definitieve loslaatpositie zonder laatste bewegingsevent. Klik/annuleren behoudt de oude selectie. Opslag, schema 10, snapshots, audio-engine en dependencies ongewijzigd. Oorzaak op de oorspronkelijke Windows-machine blijft onbevestigd; geen muzikale luisteracceptatie of signing/notariseringsclaim.

## Testmatrix en releaseketen

| Functie / grens | Issuebewijs | Releasegroep |
| --- | --- | --- |
| A/B, zoom/pan, pointercapture en terugval | 2 waveform Node-tests en 2 Electronvarianten op Mac; native CI groen | Volledige Node-/desktopgroep native Mac arm64 en Windows x64 |
| Audio, import/export, opslag/historie, vensters, evaluatie/dashboard | Bestaande tests behouden | Dezelfde volledige releasegroep, eenmaal op vaste bron |
| Installatie en echte pakketten | Nog niet gebouwd | Na expliciete eindgoedkeuring: native installerjobs en check-installer, vier tests/platform |

Geen tests geschrapt of nieuwe afhankelijkheden toegevoegd. Bestaande bundelwaarschuwingen blijven. Tijdelijke geïsoleerde testdata; geen persoonlijke bibliotheek. Volledige regressie start na versievoorbereiding op de vaste hoofdbranchcommit. Daarna wacht release-approval op expliciet akkoord van de gebruiker; geen tag, nieuwe release-installers of publicatie vóór dit akkoord.

Testbare Mac-ontwikkelapp: release/review-1.1.1/mac-arm64/HITtheBeat.app (appdirectory, geen installer). Controleer A/B-slepen in losse oefening en sessie, nieuwe loop beluisteren en terugkeer naar de sessie. Exacte broncommit en regressieresultaten worden bij de eindcontrole vermeld. De oorspronkelijke machine blijft een afzonderlijke praktijkcontrole.
