# Release 1.1.1 — gepubliceerd 25 oktober 2026

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


## Volledige regressie en menselijke eindgoedkeuring

Vaste bron: `4ff243d0eedd0a1d36a2229c8bfa5fc896435947`, versie 1.1.1. [Release-run 40081653930](https://github.com/RoJoRZ/HITtheBeat/actions/runs/40081653930) slaagt op beide native platformen: elk 120 Node-tests en 32 desktop-/audiotests, plus build/typecheck. De Mac-ontwikkelapp is uit dezelfde Git-tree gebouwd; versie en lokale signature gecontroleerd, geïsoleerde offline shell-/herstarttest geslaagd.

Op 25 oktober 2026 heeft de gebruiker deze ontwikkelapp geopend en daarna expliciet bevestigd: “perfect, maak de release versie maar”. Dit menselijke akkoord is geregistreerd bij de bestaande release-approval-gate voor uitsluitend bovenstaande bron. Daarna zijn de native installerjobs gestart. De volledige regressie wordt op dezelfde ongewijzigde bron niet herhaald.


## Publicatie en gerichte pakketcontrole

Beide native installerjobs zijn geslaagd; elk vier tests op de daadwerkelijk geïnstalleerde app. Mac: DMG read-only aangekoppeld, app gekopieerd en signature gecontroleerd. Windows: per-user NSIS-installatie in een pad met spaties, na afloop verwijderd. Shell/offline, bibliotheek/media, import/opslag/herstart en tablatuur zijn met geïsoleerde gegevens gecontroleerd. Geen volledige regressie opnieuw gedraaid na akkoord.

Dezelfde run is volledig groen, inclusief automatische publicatie: [HITtheBeat 1.1.1](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.1.1), release-ID 423418421. Tag en target wijzen naar de goedgekeurde bron `4ff243d0eedd0a1d36a2229c8bfa5fc896435947`. Alle zeven assets staan uploaded: vier platformdownloads, SHA256SUMS.txt, RELEASE.md en THIRD-PARTY-NOTICES.txt. Het publicatiescript heeft bestandsset en upload-digests vóór en na publicatie gecontroleerd. Publicatie op 25 oktober 2026 om 14:23 Nederlandse tijd (CET). Eerdere releases/tags/assets blijven behouden.

| Bestand | SHA-256 |
| --- | --- |
| HITtheBeat-1.1.1-mac-arm64.dmg | c4626c6b7fe8f87e6af76eba842e10bc1a8d0d732ff287fb91350fefc71410a0 |
| HITtheBeat-1.1.1-mac-arm64.zip | 52b1cdca8dd4a20e396db0e7dcf23f7153c232e6fabffa6b16c152ab97dd7b45 |
| HITtheBeat-1.1.1-win-x64.exe | 7e53c236619b679113e5d8ed3827bd9f8f8c1b621ec43657c0879454d0547bdd |
| HITtheBeat-1.1.1-win-x64.zip | 7bf2d742952b3f8545145f45e7c73d004552f6808c89e5e5b1afc30402008d67 |

Issue #36 is gesloten; PR #37 en versievoorbereiding #38 zijn samengevoegd. Voor deze losse patch is geen nieuwe milestone gestart of gewijzigd. De oorspronkelijke gebruikersmachine en muzikale luisterbeoordeling blijven buiten deze automatische acceptatie. Deze afsluiting wijzigt alleen documentatie; de releasebron/downloads blijven exact gelijk.
