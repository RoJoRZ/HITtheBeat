# HITtheBeat — Technisch ontwerpvoorstel

Datum: 10 oktober 2026.

Status: de gebruiker heeft op 10 oktober 2026 opdracht gegeven om volgens het ontwikkelplan te beginnen. Electron, React en TypeScript worden in fase 0 als technische basis geïmplementeerd. Audio-engine, BPM-detector en opslag worden in hun eigen fases gevalideerd. De functionele eisen staan in `FUNCTIONEEL.md`.

## 1. Aanbevolen richting

Bouw een desktopapp met **Electron, React en TypeScript**, met lokale opslag en een aparte audio-engine. Hiermee onderhouden we één applicatiecodebasis voor macOS en Windows.

Electron levert Chromium en Node.js mee. Dat maakt de installatie groter, maar geeft op beide platforms dezelfde versie van de browsermotor. Voor deze app weegt voorspelbaar gedrag van audio, toetsenbediening en weergave zwaarder dan een zo klein mogelijke installatie. Platformtests blijven nodig.

Tauri is een goed alternatief voor een kleinere installatie. Tauri gebruikt de webview van het platform: WKWebView op macOS en WebView2 op Windows. Daardoor moeten we de webaudio-integratie op twee verschillende motoren valideren. Een browserapp is later ook mogelijk, maar lokale bestandsopslag en het delen van een zelfstandige desktopapp passen nu beter bij de gekozen richting.

## 2. Onderdelen

| Onderdeel | Voorstel | Doel |
| --- | --- | --- |
| Desktop | Electron | Venster, bestandsimport, lokale opslag en installatiepakketten. |
| Interface | React + TypeScript | Bibliotheek, bewerkbare tabel, speler, evaluatie en dashboard. |
| Vormgeving | Centrale CSS-tokens en herbruikbare componenten; in fase 0 gewone CSS | Een consistente, strakke interface met zichtbare focus en goede toetsenbediening. Tailwind is voor deze basis niet nodig. |
| Audio | Web Audio + AudioWorklet + Signalsmith Stretch (WebAssembly) | Tempo en toonhoogte onafhankelijk veranderen en fragmenten herhalen. |
| BPM-analyse | Achtergrondtaak op gedecodeerde audio | Tempo schatten bij import zonder de interface te blokkeren; bibliotheek nog te selecteren. |
| Gegevens | SQLite, met schemawijzigingen per versie | Rondjes, stappen, sessies, beoordelingen en voortgang lokaal bewaren. |
| Bestanden | Eigen lokale mediamap van de app | MP3 en afbeeldingen bij import kopiëren zodat verplaatsen van het origineel geen oefening breekt. |

Voorstel: de eerste versie werkt offline, zonder account, server of abonnement. Gegevens zijn dan per computer opgeslagen; automatische synchronisatie tussen Mac en Windows zit hier niet in. Export en import van een reservekopie met database en mediabestanden is een zinvolle aanvulling, maar nog geen vastgestelde functionele eis.

## 3. Audio is het eerste technische bewijsstuk

Signalsmith Stretch heeft een officiële Web Audio-versie met WASM/AudioWorklet en instellingen voor afspeelverhouding, toonhoogte in halve tonen, bronpositie en loopgrenzen. De bibliotheek is MIT-gelicentieerd. Deze maakt de vereiste combinatie aannemelijk, maar bewijst nog niet dat onze integratie goed klinkt en werkt.

Vóór het bouwen van de volledige interface moet een kleine audioproef op Mac en Windows aantonen dat:

- MP3 correct wordt gedecodeerd en afgespeeld.
- Tempo en toonhoogte onafhankelijk werken, zowel los als gecombineerd.
- Fragmenten herhaald kunnen worden zonder hinderlijke klik of gat.
- Start, pauze, zoeken en het herstellen van instellingen voorspelbaar werken.
- Snelle overgangen tussen stappen en het onderbreken/hervatten van een rondje correct zijn.
- Het geluid bruikbaar blijft bij de gewenste vertragingen en versnellingen.

De maker beschrijft het beste resultaat voor gematigde tempoveranderingen, ongeveer 0,75–1,5 maal. Dit is geen harde functionele limiet: sterkere vertragingen moeten we expliciet beluisteren met representatieve oefeningen voordat we een ondersteund bereik vastleggen.

BPM-herkenning gebeurt één keer bij import en kan opnieuw worden uitgevoerd. Het herkende tempo en het door de gebruiker bevestigde brontempo worden afzonderlijk opgeslagen. Korte passages zonder duidelijke puls kunnen onbetrouwbare of halve/dubbele tempi opleveren. Handmatige correctie blijft beschikbaar. De detector kiezen we na vergelijking op echte oefentracks, met controle van licentie en onderhoud.

## 4. Tabel als editor

Iedere rij is een afspeelstap met oefening, A/B of volledige track, herhalingen, BPM en voorgestelde toonhoogteverschuiving. Visueel worden de stappen gegroepeerd onder een oefening binnen het rondje. Eén oefening kan meerdere keren in een rondje voorkomen als afzonderlijk blok.

De fragmentmarkers blijven tijden in de oorspronkelijke audio, onafhankelijk van het gekozen afspeeltempo. Voor een stap zonder pauzes is de verwachte duur:

`(B - A) × (brontempo / doeltempo) × aantal herhalingen`

Bij de volledige track zijn A en B het begin en einde van die track. Toonhoogteverschuiving verandert de berekende duur niet.

De editor controleert onder andere dat A vóór B ligt, beide binnen de track vallen, het aantal herhalingen een positief geheel getal is en BPM positief is. De duur wordt bij invoer opnieuw berekend. Praktische grenzen volgen uit de audioproef.

## 5. Gegevens en afspeeltoestand

Scheid de bibliotheekoefening van het oefenblok binnen een rondje en van de stappen binnen dat blok. Zo blijven tempo-opbouw, fragmentkeuze en eventuele toonhoogte per rondje instelbaar. Iedere voltooide sessie bewaart een kopie van de gebruikte instellingen; latere wijzigingen mogen oude voortgang niet herschrijven.

De speler heeft expliciete toestanden: gereed, speelt rondje, gepauzeerd, vrije fragmenttraining, evaluatie en afgerond. Bij vrije fragmenttraining wordt de rondjestoestand bewaard. Bij terugkeer wordt de onderbroken speelbeurt opnieuw gestart met de oorspronkelijke instellingen. Fragmenttraining krijgt eigen tijdregistratie, los van de geplande herhalingen.

Gebruik de audioklok voor de timing en afspeelovergangen; de interface volgt de audio. Laat herhalingen niet afhangen van timers voor het tekenen van de interface. Pauzetijd telt niet als werkelijk oefenen. Verdere definities van tijdregistratie worden functioneel afgestemd.

## 6. Toetsenbediening

Gebruik één centrale set spelercommando's voor zowel knoppen als toetsen. Voorlopige indeling:

| Toets | Actie |
| --- | --- |
| Spatie | Afspelen/pauzeren. |
| 1 | Begin huidige speelbeurt; in fragmenttraining begin A. |
| A / B | Begin- of eindmarker plaatsen op de huidige positie. |
| L | Loop aan/uit. |

Deze indeling is een voorstel. Toetsen worden binnen het actieve appvenster afgehandeld en genegeerd als de gebruiker tekst, getallen of een tabelcel bewerkt. Normale toetsenbediening van gefocuste knoppen moet blijven werken, zonder een dubbele speleractie. Systeembrede sneltoetsen zijn voor deze versie niet nodig.

## 7. Opslag en distributie

De database en mediabestanden staan buiten de broncoderepository in de gebruikersgegevensmap van de app. Databasewijzigingen krijgen versiebeheer binnen de applicatie; code, documentatie en bouwconfiguratie blijven in Git. Audiobestanden van gebruikers worden niet automatisch naar GitHub geüpload.

De interface krijgt geen rechtstreekse toegang tot het bestandssysteem. Electron gebruikt context isolation, sandboxing, een beperkte preload-interface en gevalideerde communicatie met het hoofdproces. De app laadt meegeleverde code en media via gecontroleerde lokale toegang.

Ontwikkelen kan met gratis gereedschappen. Ook het beschikbaar stellen van installatiebestanden hoeft geen appstore te vereisen. Voor macOS is betaalde Apple-ondertekening/notarisatie relevant voor probleemloze distributie; zonder die stap zijn extra handelingen of beveiligingsmeldingen mogelijk. Op Windows kunnen niet-ondertekende apps SmartScreen-meldingen geven. Ondertekening is een apart besluit en geen reden om ontwikkeling uit te stellen.

Maak en test pakketten op hun doelplatform: macOS en Windows. Ondersteunde OS-versies en Mac-architecturen worden vóór de eerste release vastgesteld. GitHub Releases is een mogelijke distributieplek; eventuele geautomatiseerde builds worden afgestemd op de beschikbare gratis gebruiksruimte.

## 8. Voorgestelde volgorde na akkoord op de richting

1. Audio- en BPM-proef met echte oefeningen op beide platforms.
2. Bibliotheek, opslag, speler en tabel met geplande duur.
3. Rondje uitvoeren, vrije fragmenttraining en hervatten.
4. Evaluatie, sessiehistorie en dashboard.
5. Installatiepakketten en gebruikstest op Mac en Windows.

De eerste stap valideert de lastigste technische aanname voordat we veel werk in de interface steken.

## Bronnen

Geraadpleegd op 10 oktober 2026:

- [Electron: introductie](https://www.electronjs.org/docs/latest/).
- [Electron: beveiliging](https://www.electronjs.org/docs/latest/tutorial/security).
- [Electron: toetsenbediening](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts).
- [Tauri: procesmodel en platformwebviews](https://v2.tauri.app/concept/process-model/).
- [Signalsmith Stretch: mogelijkheden, kwaliteit en MIT-licentie](https://github.com/Signalsmith-Audio/signalsmith-stretch).
- [Signalsmith Stretch: officiële Web Audio-integratie](https://github.com/Signalsmith-Audio/signalsmith-stretch/blob/main/web/release/README.md).
- [macOS-ondertekening en ad-hocdistributie](https://tauri.app/distribute/sign/macos/).
- [Windows-ondertekening en SmartScreen](https://tauri.app/distribute/sign/windows/).

## 10. Stand na de audioproef

Fase 1 gebruikt Signalsmith Stretch 1.3.2, gebundeld als lokale module met ingebouwde WASM. `src/audio/engine.ts` verzorgt AudioContext, decodering, afspeeltoestand, tempo/transpositie, loop en audioklok; React toont en bedient deze engine. Het trackeinde wordt op de audioklok begrensd met GainNode-automatisering. De CSP voegt alleen `wasm-unsafe-eval` toe aan de lokale scriptpolicy.

Automatische Mac-metingen bevestigen onafhankelijke tempo-/toonhoogteverwerking, ook gecombineerd; offline desktoptests controleren MP3-import en bediening. Luisterkwaliteit op echte oefeningen, loopovergangen en Windows-werking zijn nog niet geaccepteerd. Het proefbereik en tijdelijke toetsen staan in `FUNCTIONEEL.md`; resultaten en resterende controles in `docs/FASE-1.md`. De proef bewaart geen media, gebruikt geen SQLite en loopt niet vooruit op de BPM-detector.
