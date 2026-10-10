# Fase 0 — Desktopbasis

Status: Mac-proefversie 0.0.1 gereed voor feedback. Het Windows-x64-pakket is gebouwd; de Windows-gebruikstest staat nog open. Fase 0 is daarom nog niet volledig op beide platforms geaccepteerd.

## Omvang

- Electron met een React/TypeScript-interface.
- Studio donker, B — Mandarijn, met lokaal meegeleverde Source Sans 3.
- Navigatie tussen Mijn oefenrondjes, Oefeningen en Voortgang, met eerlijke lege beginstaten.
- Hoofdproces, beperkte preload-koppeling en geïsoleerde interface. De ingebouwde lokale URL geeft uitsluitend toegang tot de gebundelde schermbestanden.
- Afzonderlijke plaatsen voor UI, domeinlogica, audio en opslag. De laatste drie worden in volgende fases ingevuld.
- Build, gerichte tests en proefpakketconfiguratie voor macOS en Windows.

## Uitgevoerde controles op 10 oktober 2026

Testomgeving: macOS 27.0.1, Apple Silicon (arm64), Node.js 24.19.0, pnpm 11.25.0, Electron 44.7.0.

| Controle | Resultaat |
| --- | --- |
| Typecontrole van interface, Electron en startscripts | Geslaagd. |
| Productiebuild | Geslaagd. |
| Twee tests van de lokale bestandsrouter | Geslaagd: normale bestanden; afwijzen van vreemde origins, ongeldige URL's en gecodeerde padtraversal. |
| Desktoptest met ontwikkelruntime en gebouwde interface | Geslaagd: offline herladen, drie pagina's, niet-actieve toekomstige bediening, beperkte bridge, sandbox, sluiten en tweede start. |
| Toetsen en smaller venster | Geslaagd in desktoptest: Tab/Enter-navigatie en geen horizontale overflow op 960×700. |
| Ontwikkelserver | Geslaagd: desktopbridge, lokaal font en geïnjecteerde ontwikkelstijlen. |
| Mac-zip bouwen en verpakte app testen | Geslaagd: dezelfde desktoptest tegen het verpakte programma, inclusief twee starts. |
| Windows-x64-zip bouwen | Geslaagd; cross-build op deze Mac. |
| Windows-app starten en gebruiken | **Open**: er is hier geen Windows-testcomputer beschikbaar. |

De ruime screenshot is visueel bekeken. Het smallere venster is op overflow en navigatie gecontroleerd; uitgebreide toegankelijkheids- en schermcontroles volgen bij de gevulde interface in fase 2. De Vite-build meldt dat de `use client`-directive van de icoonbibliotheek niet wordt behouden; deze app heeft geen servercomponenten en de desktoptests tonen werkende iconen. De melding blokkeert deze build niet.

De Mac-app gebruikt lokale ad-hocondertekening, geen Apple Developer-ondertekening of notarisatie. Windows is niet ondertekend. Beveiligingsmeldingen bij overdracht naar een andere computer zijn nog niet in een distributietest beoordeeld. Beide proefpakketten gebruiken voorlopig het standaard Electron-appicoon.

## Oplevering

- `release/mac-arm64/HITtheBeat.app`: direct op deze Mac te openen.
- `release/HITtheBeat-0.0.1-mac-arm64.zip`: Mac-proefpakket, circa 128 MB.
- `release/HITtheBeat-0.0.1-win-x64.zip`: Windows-proefpakket, circa 153 MB.
- [Screenshot van de gebouwde basis](screenshots/fase-0-desktop.png).

De programma's, dependencies, caches en testtraces blijven buiten Git; broncode, lockfile, documentatie en de kleine screenshots zijn wel geversioneerd. Er is niets gepubliceerd als publieke release.

## Tussentijdse gebruikstest

1. Open de app en controleer lettergrootte, oranje accent en vensterindeling.
2. Wissel tussen de drie pagina's; de actieve navigatie moet duidelijk blijven.
3. Maak het venster smaller en navigeer met Tab en Enter.
4. Sluit met Cmd+Q of de gebruikelijke Windows-bediening en open opnieuw.

Hiermee beoordeel je de basis, nog niet het definitieve gevulde speelscherm. Audio wordt in fase 1 getest. Het plan voorziet in feedback voordat de volgende grote fase wordt uitgevoerd.

## Volgende stap

Na feedback volgt fase 1: de losse audioproef met echte MP3, onafhankelijk tempo/toonhoogte en A/B-loops. De Windows-startcontrole blijft een expliciet open acceptatiepunt en moet vóór een claim van volledige platformondersteuning worden uitgevoerd.
