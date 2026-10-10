# HITtheBeat

Een desktop-oefenmaatje voor muzikanten. Ontwikkeling gebeurt in kleine, afzonderlijk testbare fases.

## Documenten

- [Functionele afspraken](FUNCTIONEEL.md)
- [Goedgekeurde designrichting](DESIGN.md)
- [Technisch ontwerp](TECHNISCH-ONTWERP.md)
- [Ontwikkelplan](ONTWIKKELPLAN.md)
- [Voortgang en controles van fase 0](docs/FASE-0.md)
- [Audioproef en teststappen van fase 1](docs/FASE-1.md)

## Eerste proefversie

Versie 0.0.2 bevat de desktopbasis en een afzonderlijke **Audioproef**: MP3/WAV laden, onafhankelijk tempo en toonhoogte aanpassen, zoeken, pauzeren en A/B-loopen. Probeer de ingebouwde voorbeeldmelodie of een eigen bestand. Automatische BPM-herkenning en het opslaan van oefeningen, rondjes en voortgang volgen later. De nog niet aangesloten bibliotheek- en rondjeknoppen zijn zichtbaar als niet-actieve bediening; er worden geen fictieve resultaten als eigen voortgang getoond.

## Ontwikkelen

Benodigd: Node.js 24 en pnpm 11.25.0. Gebruik het lockbestand voor dezelfde afhankelijkheden.

```sh
pnpm install --frozen-lockfile
pnpm setup:desktop
pnpm dev
```

`pnpm dev` start de lokale Vite-server en het Electron-venster samen. Sluiten van het Electron-proces stopt ook de ontwikkelserver. Op macOS blijft de app na het sluiten van het laatste venster actief volgens de gebruikelijke Mac-bediening; gebruik Cmd+Q om af te sluiten.

## Bouwen en controleren

```sh
pnpm build
pnpm test
pnpm test:desktop
pnpm start
```

De desktoptests controleren de ontwikkelserver en het gebouwde scherm uit `dist/`. Daarom komt `pnpm build` vóór `pnpm test:desktop`. De test van het gebouwde scherm start twee keer een echte Electron-app, navigeert, controleert offline laden en de geïsoleerde desktopkoppeling en sluit weer af. Ontwikkeltests gebruiken een tijdelijke gebruikersmap. Screenshots staan in `test-results/` en gaan niet automatisch naar Git. Met de omgevingsvariabele `HITTHEBEAT_TEST_EXECUTABLE` kun je dezelfde test op een verpakte executable richten; de ontwikkelservertest wordt dan overgeslagen. Een verpakte app gebruikt haar normale appgegevensmap.

Een browservoorvertoning is mogelijk met `pnpm preview`; dit is geen vervanging voor de Electron-test en toont geen informatie uit het desktopproces.

## Proefpakketten

```sh
pnpm package:mac
pnpm package:win
```

Output staat in `release/` en wordt niet gecommit. Het Mac-zipbestand bevat een `.app`; pak het uit en open de app. Het Windows-zipbestand bevat een map met `HITtheBeat.exe` en benodigde bestanden; pak de hele map uit voordat je de executable opent. Dit zijn proefpakketten zonder installatieprogramma. De Mac-build gebruikt lokale ad-hocondertekening, zonder Apple Developer-certificaat of notarisatie. Windows is niet ondertekend. Windows moet ook op Windows worden gestart en beoordeeld; een geslaagde cross-build bewijst dat niet.

Meegeleverde fonts en schermcode werken zonder netwerkverbinding. Persoonlijke audio, tablatuur en databasebestanden horen later in de lokale appbibliotheek en niet in deze Git-repository.

## Licenties

De broncode heeft nog geen door de eigenaar gekozen open-sourcelicentie (`UNLICENSED`). De gebruikte afhankelijkheden hebben eigen licenties. Kies vóór externe broncodedistributie een projectlicentie en lever voor de uiteindelijke app de vereiste derdepartijvermeldingen mee. Dit staat los van het gratis kunnen ontwikkelen en lokaal testen.
