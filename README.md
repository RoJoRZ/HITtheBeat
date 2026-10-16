# HITtheBeat

Een desktop-oefenmaatje voor muzikanten. Ontwikkeling gebeurt in kleine, afzonderlijk testbare fases.

## Documenten

- [Release 1.0: analyse en implementatievoorstel (ter goedkeuring)](docs/RELEASE-1.0-ANALYSE.md)
- [Voorgestelde permanente ontwikkelwerkwijze](docs/AGENTS-VOORSTEL.md)

- [Functionele afspraken](FUNCTIONEEL.md)
- [Goedgekeurde designrichting](DESIGN.md)
- [Technisch ontwerp](TECHNISCH-ONTWERP.md)
- [Ontwikkelplan](ONTWIKKELPLAN.md)
- [Voortgang en controles van fase 0](docs/FASE-0.md)
- [Audioproef en teststappen van fase 1](docs/FASE-1.md)
- [Voorbeeldschermen en nieuw tempobereik van fase 2](docs/FASE-2.md)
- [Eigen bibliotheek en BPM-proef van fase 3](docs/FASE-3.md)
- [Opgeslagen rondjes en proefstappen van fase 4](docs/FASE-4.md)
- [Rondjespeler en fragmenttraining van fase 5](docs/FASE-5.md)
- [Evaluatie en sessiehistorie van fase 6](docs/FASE-6.md)
- [Normalisatie en volumeregeling](docs/VOLUME.md)
- [Evaluatie met toetsenbord](docs/EVALUATIE-TOETSEN.md)
- [Benoemde fragmenten bewaren en hergebruiken](docs/FRAGMENTEN.md)
- [Direct starten met eigen gegevens](docs/FASE-6B.md)
- [Recent sessieoverzicht](docs/SESSIEOVERZICHT.md)
- [Voortgangsdashboard](docs/FASE-7.md)
- [M4A-import en Instellingen](docs/IMPORT-INSTELLINGEN.md)

## Downloadbare testrelease

[HITtheBeat 1.0.0-rc.1 downloaden](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.0.0-rc.1): Mac Apple Silicon (DMG of ZIP) en Windows x64 (ZIP). Windows is nog niet in gebruik getest. Op Windows de volledige ZIP uitpakken voordat je HITtheBeat.exe opent. De Mac-app is niet genotariseerd en Windows is niet ondertekend; het besturingssysteem kan een waarschuwing tonen. Geen Rosetta nodig voor de Mac-app.

Zie [installatie, bouwstappen en beperkingen](docs/RELEASE.md) en [Windows-testoverdracht](docs/WINDOWS-TEST.md). Automatische updates en een Windows-installer zijn nog niet geleverd. De projectlicentie is nog niet gekozen (`UNLICENSED`).

## Functionaliteit

Versie 1.0.0-rc.1 biedt een **eigen bibliotheek**: MP3 of M4A met AAC importeren, BPM schatten en corrigeren, optionele afbeelding en opdracht toevoegen, bewaren en opnieuw openen. De app opent op Mijn oefensessies met maximaal tien recente sessie-opbouwen. Kies Starten of Bewerken; bij meer dan tien opent Alle oefensessies het volledige overzicht met zoeken. Kies ‘Oefeningen’ om MP3 of M4A met AAC toe te voegen; een lege bibliotheek wijst je hierheen. Media worden gekopieerd naar de lokale appbibliotheek. De speler ondersteunt onafhankelijk tempo (25–300%) en toonhoogte, zoeken, pauzeren en A/B-loopen.

Onder **Mijn oefensessies** kun je eigen rondjes opslaan met geordende oefenblokken en per stap fragment, herhalingen en BPM. Kies per stap de volledige track, een benoemd fragment van de oefening of eigen A–B-grenzen. De geplande totale duur rekent direct mee. Met **Rondje starten** speelt de speler alle stappen en herhalingen, met evaluatie bij fragmentwissels en tussen oefeningen. Je kunt een passage vrij loopen en daarna dezelfde geplande herhaling opnieuw starten.

Eigen rondjes evalueren nu na iedere fragmentserie. Hetzelfde/Sneller/Rustiger past de volgende sessie aan voor alleen het gekozen oefenblok. Voortgang toont oefentijd, oefendagen, sessies en tempo-ontwikkeling met beoordelingen en notities. Kies week, maand of alle tijd; volledige tracks, fragmenten en vrije training blijven herkenbaar gescheiden. Instellingen bevat Bibliotheekmap openen en uitleg over de ongewijzigde lokale kopieën. De losse Audioproef is verwijderd. Evalueren kan met toetsen: eerst een cijfer 1–5, daarna 1 langzamer / 2 gelijk / 3 sneller, eventueel een aantal BPM. Enter bewaart de huidige keuzes en gaat door; zonder invoer zijn dat 3/5 en gelijk houden. Alles is ook aanklikbaar.

Nieuwe audiobestanden krijgen standaard volumenormalisatie zonder het bronbestand te wijzigen. Voor bestaande oefeningen: **Bewerken → Volume normaliseren → Oefening opslaan**. De echte spelers hebben een gedeelde volumeschuif en dempenknop; de instelling blijft op deze computer bewaard.

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

De desktoptests controleren de ontwikkelserver en het gebouwde scherm uit `dist/`. Daarom komt `pnpm build` vóór `pnpm test:desktop`. De tests van de gebouwde app controleren navigatie, offline audio, MP3- en AAC-M4A-import, de geïsoleerde desktopkoppeling en de eigen oefenroute, inclusief lege start, duurberekening, fragmenten, evaluaties en kleinere vensters. De ontwikkeltest meet daarnaast tempo/transpositie en loops in een OfflineAudioContext. Ontwikkeltests gebruiken een tijdelijke gebruikersmap. Screenshots staan in `test-results/` en gaan niet automatisch naar Git. Met de omgevingsvariabele `HITTHEBEAT_TEST_EXECUTABLE` kun je dezelfde test op een verpakte executable richten; de ontwikkelservertest en de DSP-bronmoduletest worden dan overgeslagen. De bibliotheek- en heropentests gebruiken een tijdelijke gebruikersmap via `--user-data-dir`, ook in de verpakte app.

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

Benoemde fragmenten maak je bij **Oefeningen → Opgeslagen fragmenten → Fragment toevoegen**. Tijdens vrije fragmenttraining en in de losse speler kun je de huidige A–B-selectie met **Fragment opslaan** bewaren en later kiezen in iedere oefensessie.

Audio-import ondersteunt MP3 en onbeveiligde M4A met AAC tot 50 MB. Apple Lossless (ALAC) wordt nog niet ondersteund; exporteer zulke tracks eerst als MP3 of M4A met AAC.

Metronoom-oefeningen zonder audio: kies bij Oefening toevoegen het type Metronoom, BPM en maatsoort. Maten per herhaling stel je bij de oefening in (standaard 8); sessies nemen dit over. In de sessie kies je per stap herhalingen en BPM. BPM betekent kwartnoten per minuut, ook bij 6/8. Zie [metronoom en controles](docs/METRONOOM.md). Bij het bewerken van een sessie kun je naast iedere oefennaam Aftellen aanvinken en een eigen maatsoort kiezen. Dit geldt voor alle herhalingen van die oefening in de sessie. Afteltijd staat apart en telt niet als oefentijd. Zie [aftelmaat en controles](docs/AFTELMAAT.md).


Tablatuur vergroten opent een los verplaatsbaar venster dat de actieve oefening volgt. Gebruik +/− voor beeldzoom, 0 voor Passend en F voor volledig scherm; Escape verlaat volledig scherm. Sluiten laat de sessie doorspelen. Zie [tablatuurvenster en controles](docs/TABLATUURVENSTER.md).


Sleep in de waveform om een audiopassage te kiezen of versleep A/B. Gebruik zoom, Toon selectie en de horizontale schuif om nauwkeurig te werken. Fragment beluisteren speelt de selectie als loop. In een sessie onderbreekt dit de geplande herhaling; Terug naar sessie hervat de bestaande opbouw. Zie [waveform en controles](docs/WAVEFORM.md).


BPM wordt overal als geheel getal getoond; opgeslagen precisie blijft behouden. De detector beperkt bepaalde dubbele-tempo-missers bij geaccentueerde onderverdelingen. In Oefeningen → Bewerken helpen Halveer BPM en Verdubbel BPM bij een andere bedoelde tel; handmatig corrigeren en Gebruik schatting blijven beschikbaar. Zie [BPM-onderzoek en controles](docs/BPM.md).

Oefeningen delen: kies **Oefeningen → Exporteren** voor één `.htbexercise`-bestand met audio, tablatuur, opdracht, instellingen en fragmenten. Voeg eventueel je makernaam en een persoonlijke boodschap toe. **Oefening importeren** toont eerst een preview waarin je de naam kunt aanpassen; bij een bestaande naam verschijnt een waarschuwing. Import maakt altijd een nieuwe oefening aan. De maker blijft zichtbaar en wordt bij opnieuw exporteren ingevuld. Alles werkt offline. Zie [oefeningen delen en controles](docs/OEFENING-DELEN.md).

Taal: de eerste start volgt de systeemtaal (nl → Nederlands, anders Engels). Kies **Instellingen → Taal** of de compacte keuze bovenaan voor Nederlands/English. De keuze blijft op deze computer bewaard en werkt direct, ook tijdens het spelen. Eigen inhoud blijft in de oorspronkelijke taal. Zie [taalkeuze en controles](docs/TAALKEUZE.md).

**Info over HITtheBeat** onderaan de zijbalk legt het concept uit en vat de functies puntsgewijs samen, in de gekozen taal. Het toont ook de appversie. Sluiten of Escape brengt je terug zonder de sessie of invoer te wijzigen. Zie [infovenster en controles](docs/INFO.md).
