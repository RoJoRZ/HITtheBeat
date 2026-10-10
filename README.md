# HITtheBeat

Een desktop-oefenmaatje voor muzikanten. Ontwikkeling gebeurt in kleine, afzonderlijk testbare fases.

## Documenten

- [Functionele afspraken](FUNCTIONEEL.md)
- [Goedgekeurde designrichting](DESIGN.md)
- [Technisch ontwerp](TECHNISCH-ONTWERP.md)
- [Ontwikkelplan](ONTWIKKELPLAN.md)
- [Voortgang en controles van fase 0](docs/FASE-0.md)
- [Audioproef en teststappen van fase 1](docs/FASE-1.md)
- [Voorbeeldschermen en nieuw tempobereik van fase 2](docs/FASE-2.md)
- [Eigen bibliotheek en BPM-proef van fase 3](docs/FASE-3.md)

## Eerste proefversie

Versie 0.0.4 biedt een **eigen bibliotheek**: MP3 importeren, BPM schatten en corrigeren, optionele afbeelding en opdracht toevoegen, bewaren en opnieuw openen. Kies ‘Eigen bibliotheek bekijken’ en vervolgens ‘Oefeningen’. Media worden gekopieerd naar de lokale appbibliotheek. De speler ondersteunt onafhankelijk tempo (25–300%) en toonhoogte, zoeken, pauzeren en A/B-loopen.

De **voorbeeldschermen** tonen daarnaast een rondjetabel, het gehele rondje in de speler, evaluatie en dashboard. Voorbeeldwijzigingen worden niet opgeslagen. Rondjes bewaren en automatisch uitvoeren, evaluaties en echte voortgang volgen in de volgende fases. De losse Audioproef blijft beschikbaar.

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

De desktoptests controleren de ontwikkelserver en het gebouwde scherm uit `dist/`. Daarom komt `pnpm build` vóór `pnpm test:desktop`. De tests van de gebouwde app controleren navigatie, offline audio, MP3-import, de geïsoleerde desktopkoppeling en de route door de voorbeeldschermen, inclusief duurberekening en kleinere vensters. De ontwikkeltest meet daarnaast tempo/transpositie en loops in een OfflineAudioContext. Ontwikkeltests gebruiken een tijdelijke gebruikersmap. Screenshots staan in `test-results/` en gaan niet automatisch naar Git. Met de omgevingsvariabele `HITTHEBEAT_TEST_EXECUTABLE` kun je dezelfde test op een verpakte executable richten; de ontwikkelservertest en de DSP-bronmoduletest worden dan overgeslagen. De bibliotheek- en heropentests gebruiken een tijdelijke gebruikersmap via `--user-data-dir`, ook in de verpakte app.

Een browservoorvertoning is mogelijk met `pnpm preview`; dit is geen vervanging voor de Electron-test en toont geen informatie uit het desktopproces.

## Proefpakketten

```sh
pnpm package:mac
pnpm package:win
```

Output staat in `release/` en wordt niet gecommit. Het Mac-zipbestand bevat een `.app`; pak het uit en open de app. Het Windows-zipbestand bevat een map met `HITtheBeat.exe` en benodigde bestanden; pak de hele map uit voordat je de executable opent. Dit zijn proefpakketten zonder installatieprogramma. De Mac-build gebruikt lokale ad-hocondertekening, zonder Apple Developer-certificaat of notarisatie. Windows is niet ondertekend. Windows moet ook op Windows worden gestart en beoordeeld; een geslaagde cross-build bewijst dat niet.

Meegeleverde fonts en schermcode werken zonder netwerkverbinding. Persoonlijke audio, tablatuur en databasebestanden staan in de lokale appbibliotheek en niet in deze Git-repository.

## Licenties

De broncode heeft nog geen door de eigenaar gekozen open-sourcelicentie (`UNLICENSED`). De gebruikte afhankelijkheden hebben eigen licenties. Kies vóór externe broncodedistributie een projectlicentie en lever voor de uiteindelijke app de vereiste derdepartijvermeldingen mee. Dit staat los van het gratis kunnen ontwikkelen en lokaal testen.
