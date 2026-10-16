# Release 1.0 — analyse en implementatievoorstel

Status: **goedgekeurd**, 15 oktober 2026. De gebruiker heeft na de analyse akkoord gegeven op volgorde, werkwijze en uitgangspunten 1–3 (8 maten per sessiestap, BPM per kwartnoot ook bij 6/8, afteltijd afzonderlijk van oefentijd). AGENTS.md is daarop bijgewerkt. Deze voorbereidings-PR bevat geen functionele codewijzigingen. Start met issue #1 in een afzonderlijke PR; geen zelfstandige merges.

## Onderzoeksbasis

Lokale versie 0.0.16, commit `06a33c8a65a419ccdeab7c2eb4f01db6b7194475`. Alle acht open issues uit milestone Release 1.0 (milestone 1) zijn volledig gelezen via GitHub, inclusief hun commentaren: op het onderzoeksmoment heeft geen van de acht commentaren. De issuecriteria hieronder zijn vastgestelde wensen; de technische uitwerking en volgorde zijn voorstellen, geen bestaande functionaliteit.

## 1. Huidige architectuur, uit de code

| Onderdeel | Implementatie | Betekenis voor Release 1.0 |
|---|---|---|
| Desktop | `electron/main.mjs`, één BrowserWindow, eigen hitthebeat-protocol en optionele lokale Vite-server | Extra tablatuurvenster is een echte uitbreiding; huidig vergroten is een HTML-dialog. |
| Isolatie | sandbox, contextIsolation, geen nodeIntegration; `preload.cjs` exposeert vaste IPC-acties; authorize controleert hoofdvenster en frame | Een extra venster krijgt een eigen beperkte interface. Niet alle huidige IPC openstellen voor het kindvenster. |
| UI | React 19/TypeScript, Vite 8, Source Sans 3/lucide, `src/ui` | Bestaande schermen en Mandarijn #FF922E behouden; teksten zijn momenteel Nederlands in code. |
| Bibliotheek | `electron/library.mjs`, Node SQLite, WAL, schema 5; UUID-media in userData/HITtheBeat/library | Audio is nu verplicht (audio_file/audio_name NOT NULL). Metronoom vereist expliciet type, migratie en aangepaste validatie. |
| Oefensessies | `routine-model.mjs` valideert stappen; `src/session/runner.ts` beheert herhalingen, fragmentseries en evaluatie; `SessionPlayer.tsx` bestuurt audio | Duur en voortgang rekenen met bronaudioduur × bron-BPM / speel-BPM. Ook de 25–300%-grens gaat uit van audio. |
| Historie | sessies bevatten JSON-momentopnamen, voortgang en evaluaties; `session-model.mjs` valideert; `progress.mjs` berekent dashboard | Oude momentopnamen zonder nieuwe velden moeten blijven werken. De snapshot bevat metadata; de spelers lezen media nog op oefening-ID uit de huidige bibliotheek. Dat is geen volledig historisch media-archief. |
| Audio | Web Audio in renderer, Signalsmith Stretch via AudioWorklet/WASM, seriële bediening en audioklok; gedeelde gain/volume | Geen bestaande metronoom of count-in. Audioklok gebruiken voor klikplanning, niet alleen UI-timers. Bestaand tempo/toonhoogte en mute hergebruiken. |
| Import/analyse | MP3 en AAC-M4A, header/containercontrole in beide processen; OfflineAudioContext decodeert; normalisatiemeting en BPM-Worker | Geen ALAC; originelen blijven bytegelijk. Geen cloud, accounts of server nodig. |
| BPM | onsetenergie plus autocorrelatie in `src/audio/bpm.ts`; eerste 90 seconden, 40–240 BPM | Algoritme prefereert de eerste sterke periodiciteit; kan onderverdelingen verwarren met muzikale puls. Uitkomst heeft nu één decimaal. |
| Tablatuur | optionele PNG/JPEG/WebP, Blob-URL; huidige dialog in LibraryScreen en SessionPlayer | Geen apart venster, beeldzoom of fullscreenbediening; lifecycle en synchronisatie moeten nieuw worden getest. |
| Waveform | beide spelers berekenen 220 pieken, tonen SVG + seek; vrije A/B via getallen en knoppen | Te grof voor inzoomen; selectiecoördinaten en peakresolutie moeten los van de schermbreedte worden gemaakt. |
| Instellingen | mapactie en importuitleg; volume/mute via lokale voorkeur | Taalkeuze nog niet aanwezig. Native menu's en foutmeldingen uit hoofdproces meenemen. |
| Tests | Node-tests voor opslag/domein/BPM/normalisatie/voortgang; Playwright Electron voor import, sessies, toetsen en GUI; offline DSP-probes | Veel regressiedekking aanwezig. Werkelijke luisterkwaliteit, muzikale BPM-correctheid en Windows-gebruikstest zijn nog open. |
| Build/release | pnpm, Electron 44, electron-builder; macOS- en Windows-zip; eigen icoon | Geen installers, automatische updates of workflows in `.github`. Mac ad-hoc ondertekend; projectlicentie UNLICENSED. |

Geen architectuurvervanging nodig. Behoud React/Electron, bestaande opslag en pure validatie. Kleine gedeelde modules voor timing, waveformcoördinaten, BPM-weergave en later vertalingen zijn voldoende binnen de betreffende issues.

## 2. Prioriteiten en afhankelijkheden

Prioriteit is hieronder de aanbevolen bouwvolgorde, geen wijziging van GitHub-labels. Complexiteit is relatief (M = middel, L = groot, XL = breed); geen tijdsbelofte.

| Volgorde | Issue en doel | Complexiteit | Afhankelijkheid | Waarom op deze plaats |
|---|---|---|---|---|
| 1 | [#1 Metronoom-oefeningen zonder audiobestand.](https://github.com/RoJoRZ/HITtheBeat/issues/1) | L | Eerst keuzes over duur en tel-eenheid | Legt oefentype en gedeelde klok/maatsoort vast voor #2 en #7. |
| 2 | [#2 aftelmaat](https://github.com/RoJoRZ/HITtheBeat/issues/2) | L | #1 voor klikplanning/maatsoort; apart sessieveld | Bouwt op de timingbasis zonder oefeningen met sessievoorkeuren te vermengen. |
| 3 | [#3 Tablatuur window](https://github.com/RoJoRZ/HITtheBeat/issues/3) | M–L | Geen harde afhankelijkheid van #1/#2 | Afzonderlijk zichtbare, goed te beoordelen verbetering vóór complexere waveformbediening. |
| 4 | [#4 audioloops in de sessie](https://github.com/RoJoRZ/HITtheBeat/issues/4) | L | Bestaande fragmenttraining; #1 bepaalt metronoomtoestand | Verrijkt dezelfde speler na stabilisering van timing en vensterbediening. |
| 5 | [#5 BPM detectie](https://github.com/RoJoRZ/HITtheBeat/issues/5) | M–L | Onafhankelijk; presentatie over alle nieuwe schermen nalopen | Onderzoek kan eerder; uitvoering hier voorkomt herhaald aanpassen van nieuwe BPM-weergaven. |
| 6 | [#7 Oefening export/import](https://github.com/RoJoRZ/HITtheBeat/issues/7) | L | #1 voor stabiel oefentype en metronoominstellingen | Eén offline bestandsformaat dat beide oefentypen en benoemde fragmenten ondersteunt. |
| 7 | [#6 Taal keuze](https://github.com/RoJoRZ/HITtheBeat/issues/6) | XL | Geen harde dependency, bewust na nieuwe UI/fouten; #8 kan daarna nieuwe teksten toevoegen | Alle schermen, vensters, dialogen, menu's en foutpaden in één volledige vertaalslag testen. Nieuwe teksten uit #8 direct tweetalig. |
| 8 | [#8 Release automatisering](https://github.com/RoJoRZ/HITtheBeat/issues/8) | L | Integreert #1–#7 | Start dit issue met PR-CI, daarna installers en tagrelease. Releaseacceptatie pas na platformcontroles. |

#1 en #2 samen ontwerpen (maatsoort en audioklok), afzonderlijk implementeren en accepteren. #3 en #4 delen de actieve oefening als context maar hoeven geen gedeeld nieuw framework. #1 en #7 stemmen het gegevensmodel af vóór het exportformaat wordt vastgezet. #6 omvat ook de tekst van het extra venster van #3. CI uit #8 kan desgewenst eerder in een aparte PR binnen #8 worden voorbereid; de milestone vereist niet dat dit pas als laatste begint.

Eén issue tegelijk bouwen, testen en aanbieden. Afhankelijke issues beginnen na acceptatie/merge van hun basis; geen stapeling van onbeoordeelde afhankelijkheden. Issues zonder afhankelijkheid kunnen na feedback anders worden geordend.

## 3. Impactanalyse per issue

### #1 — Metronoom-oefeningen zonder audiobestand

**Criteria:** oefening zonder MP3/M4A aanmaken, BPM en maatsoort (o.a. 3/4, 4/4, 6/8), werkt in sessies als gewone oefening.

**Componenten:** Exercise/SaveInput en gedeelde validatie; SQLite-migratie; library CRUD en media-uitlezen; bibliotheekformulier/detail; sessietabel en plannedSeconds; runner; AudioEngine of kleine metronoom-engine; SessionPlayer; momentopnamen, evaluaties en dashboard. Ook verwijderen/audio vervangen moeten per type kloppen.

**Voorstel:** expliciet `audio`/`metronome`-type met compatibele standaard audio voor oude records/snapshots; geen nep-MP3 opslaan. Hergebruik een kleine audioklokplanner voor metronoom en later aftellen. Een metronoomherhaling krijgt een eindig aantal maten; duur wordt uit maatsoort, BPM en maten berekend. Pas audiospecifieke bediening aan (geen toonhoogte/A-B-waveform bij een metronoom).

**Risico:** onbeperkt tikkende oefening blokkeert sessievoortgang; nieuwe typevelden verliezen in routinevalidatie/snapshots; tellen in 6/8 is ambigu; gedeelde volumeregeling wordt omzeild. De audiogrens 25–300% mag niet zonder keuze als metronoomregel worden overgenomen.

**Tests:** migratie van schema 5 met bestaande audio, oud sessieresultaat blijft gelijk; offline opslaan zonder audio, heropenen; 3/4, 4/4, 6/8, accenten, tempo en duur; mute/volume; pauze/restart/herhalen, gemengde audio/metronoomsessie, evaluatie en dashboard; geen readAudio-aanroep voor metronoom; verwijderen/verwijzingscontrole. Audio-onsetafstanden meten, plus luistercontrole.

**Documentatie:** FUNCTIONEEL (type, eindconditie, tempo/duur), DESIGN (typekeuze en passende speler), TECHNISCH (migratie/klok), README/plan.

### #2 — Aftelmaat

**Criteria:** optioneel vóór iedere herhaling, tempo van die herhaling, instelbare maatsoort standaard 4/4, herkenbaar ander geluid dan metronoom; instelling op sessie en niet oefening.

**Componenten:** routineopslag en validators, momentopname, sessie-editor, runnerfase/voortgangvalidator, klikplanner, speler, plannedSeconds/remainingSeconds en dashboardtijd.

**Voorstel:** één sessie-instelling met aan/uit en eigen maatsoort. Nieuwe count-in-fase, aan dezelfde audioklok gepland. Elke geplande herhaling doorloopt haar eigen count-in, ook na een BPM-wissel. Apart geluid met dezelfde outputvolumeregeling.

**Risico:** UI-timerdrift, dubbele start na pauze/herstart, count-in als gespeelde herhaling of oefentijd meetellen, bestaande sessies krijgen onbedoeld aftellen. Default uit bij oude sessies. Niet koppelen aan de metronoommaatsoort van een oefening.

**Tests:** alle herhalings-/stap-/oefeningsovergangen, juiste klikafstanden, verschillende geluiden; pauze/hervatten/stop/herstart; uitgeschakeld gelijk aan oud gedrag; nieuwe instellingen na herstart; evaluatie en tijdbuckets; gemengde sessie. Toetsen tijdens aftellen en vrij fragment/hervatten testen.

**Documentatie:** drie ontwerpdocumenten voor bediening, tijdregels, nieuwe fase en opslag.

### #3 — Tablatuur window

**Criteria:** vergrootglas opent los verplaatsbaar/vergrootbaar venster, volgt actieve oefening, beeldzoom en fullscreen; sluiten stopt de sessie niet.

**Componenten:** main/preload/IPC en protocolroutes, gedeelde Notation-bediening in LibraryScreen/SessionPlayer, vensterlifecycle en afbeeldingrenderer.

**Voorstel:** één herbruikbaar secundair BrowserWindow met dezelfde isolatie, alleen toegang tot tablatuurcontext en eigen zoom/fullscreen. Hoofdvenster publiceert actieve oefening; alleen dat venster mag die context wijzigen. Bij wissel zonder afbeelding een lege toestand tonen, nooit oude tablatuur laten staan. Sluiten alleen kindvenster opruimen; hoofdvenster sluiten ruimt kind op. Zoom van afbeelding scheiden van Chromium-paginazoom.

**Risico:** authorize accepteert momenteel alleen het hoofdvenster; dit niet generiek versoepelen. De hoofdvensterreferentie niet overschrijven, want sluiten zou dan sessies onderbreken. Stale async afbeeldingen en Blob-URLs bij snelle wissels; achtergrondvenster kan timing beïnvloeden.

**Tests:** twee echte Electron-vensters, openen/hergebruiken, sync over oefeningwissel incl. ontbrekende afbeelding, resize/zoom/fullscreen, sluiten blijft muziek spelen; onbevoegde IPC geweigerd, hoofdvenster afsluiten, offline pakkettest op beide platforms.

**Documentatie:** FUNCTIONEEL/DESIGN vensterinteractie; TECHNISCH lifecycle, routes en IPC-rechten.

### #4 — Audioloops in de sessie

**Criteria:** waveform, muisselectie, sleepbare A/B-handles, horizontale zoom/pan, kloppende grenzen na zoom, preview; secondeninvoer mag blijven.

**Componenten:** SessionPlayer en mogelijk gedeelde waveformcomponent voor AudioLab; peakberekening, bronseconden↔beeldcoördinaten, vrije training, benoemde fragmenten. Geen wijziging van geplande stappen door alleen previewen.

**Voorstel:** selecteren activeert vrije fragmenttraining via de bestaande onderbreekroute. Canonieke A/B in bronseconden; zoom/pan beïnvloedt alleen viewport. Meerdere peakresoluties of zichtbare pieken uit PCM; de huidige 220 balkjes zijn onvoldoende bij zoom. Preview gebruikt bestaande speler/loopinstelling; Terug naar sessie behoudt huidige hervatsemantiek.

**Risico:** randselectie buiten track, omgekeerde handles, fractional/pixelafronding, enorme renderinglast, lopende audio onverwacht wijzigen bij iedere pointermove. Metronoom heeft geen audio-waveform.

**Tests:** pointerdrag/handles op verschillende vensterbreedtes; zoom/pan heen en terug met identieke bronselectie; bounds/minimumduur; handmatige invoer blijft synchroon; preview/loop/opslaan benoemd fragment/terug naar geplande herhaling; metronoomtoestand en toetsen.

**Documentatie:** FUNCTIONEEL selectie-/previewregels; DESIGN handles/zoom/focus; TECHNISCH tijdcoördinaten/peakcache.

### #5 — BPM-detectie en gehele weergave

**Criteria:** half-/dubbeltempo onderzoeken en beperken, handmatige correctie behouden, overal BPM zonder decimalen, interne precisie toegestaan.

**Componenten:** bpm.ts/Worker/analyze, bibliotheek, tabellen, beide spelers, evaluatiepreview, voortgang/SVG/toegankelijke tabellen, foutmeldingen van routine-model en session-model. Oude bron-BPM's blijven numeriek beschikbaar.

**Voorstel:** eerst benchmark met bekende, gevarieerde puls/subdivisies/accents/silence en legaal bruikbare muziek met gecontroleerd referentietempo. Kwantificeer octaaffouten vóór/na. Laat twijfel herkenbaar en correctie beschikbaar; geen universele garantie voor muzikaal bedoelde puls. Eén weergaveformatter die afrondt; een getoond afgerond getal niet stilzwijgend terugslaan in alle oude gegevens. Nieuwe invoer integerbeleid apart vastleggen.

**Risico:** double-time verminderen maar echte snelle tracks halveren; alleen synthetische regelmatige kliks bewijzen onvoldoende; grensvalidatie 25–300% mag niet door displayafronding veranderen. Historische vergelijkingssleutels behouden precisie.

**Tests:** slow/fast, half/double, subdivisions, swing, accenten, stilte/constante toon, MP3/AAC; expliciete vóór/na-fouttabel en regressies op bestaande fixtures. GUI-brede decimaalcontrole incl. aria/fouten/grafieklabels en oude fractionele data; handmatige correctie blijft werken.

**Documentatie:** FUNCTIONEEL weergave/correctie en beperkingen, DESIGN invoer/labels, TECHNISCH algoritme en meetresultaten.

### #7 — Oefening export/import

**Criteria:** één bestand met audio indien aanwezig, tablatuur, opmerkingen, relevante instellingen; volledig offline; toevoegen zonder overschrijven; waarschuwing bij gelijke naam en vóór import hernoemen.

**Componenten:** library-serialisatie/validatie, native bestandsdialogen en beperkte IPC, LibraryScreen importpreview/export, mediaopslag, type/maatsoort/fragmenten/normalisatie uit #1.

**Voorstel:** klein versieerbaar eigen formaat met manifest en gebundelde media (bv. ZIP). Onderzoek eerst bestaande runtime/dependency; kies pas bij implementatie concrete container/limieten. Geen interne SQLite/UUID-paden exporteren; import genereert nieuwe IDs, ook voor fragmenten, en valideert alles vóór opslag. Geen sessiehistorie of globale voorkeuren mee-exporteren. Audio van de metronoom ontbreekt terecht.

**Risico:** padtraversal/zipbomb/ongekende versie, gedeeltelijke opslag, bestandslimieten na uitpakken; gelijknamige oefening onbedoeld overschrijven, verlies van fragmenten en normalisatie. Metadata en media uit hetzelfde exportmoment halen.

**Tests:** roundtrip audio én metronoom met/zonder afbeelding/fragmenten/normalisatie; bytes identiek; bestaande naam waarschuwing/hernoemen/annuleren; dezelfde export tweemaal importeert als nieuwe ID; corrupte versies, grenzen/limieten/pathtraversal en rollback; offline op Mac/Windows en paden met spaties/Unicode.

**Documentatie:** FUNCTIONEEL delen/conflicten, DESIGN importpreview, TECHNISCH formaatspecificatie/versie/limieten/validatie; README voorbeeld.

### #6 — Taalkeuze

**Criteria:** volledig NL/EN, systeem- of browsertaal als default, handmatige keuze bewaard.

**Componenten:** alle React-teksten/aria/statussen, validators/fouten in hoofdproces, native menu's en extra venster, datum/getalnotatie, instellingen. Gebruikersinhoud (namen/opdrachten/notities) niet vertalen.

**Voorstel:** één centraal tekstregister met stabiele sleutels en NL/EN, persistente expliciete voorkeur boven gedetecteerde taal, NL of EN fallback vastleggen. Fouten als stabiele codes met parameters over IPC waar nodig, niet Nederlandse zinnen proberen te vertalen. Datums/eenheden voor beide talen; BPM blijft geheel.

**Risico:** halfvertaalde fouten/menu's/kindvensters, strings als testselectors, destructieve her-render midden in sessie; opgeslagen beoordelingen/gebruikersnotities verwarren met interfacewoorden. Geen databaseherbouw voor tekstvertaling.

**Tests:** gelijke vertaalsleutels/parameters, NL/EN volledige routes incl. lege/fout/evaluatie/vensters; gedetecteerde taal en fallback, voorkeur na herstart; taalwissel zonder audio/sessie/draft te verliezen; importconflict en native menu's; geen gebruikersinhoud gewijzigd.

**Documentatie:** FUNCTIONEEL voorkeur/fallback, DESIGN taalkeuze, TECHNISCH catalogus/foutcodes/voorkeursopslag, README.

### #8 — Releaseautomatisering

**Criteria:** PR-builds via Actions; release tags bouwen macOS-/Windows-installers en publiceren GitHub release; installatie, audio en opslag op Windows testen; proces documenteren. Geen updater.

**Componenten:** nieuwe `.github/workflows`, electron-builder targets/artifacts, pnpm/runtimepinning, testpaden, native/package tests, licentievermeldingen/releasedocumentatie.

**Voorstel:** twee afgebakende PR's binnen dit issue: (A) PR-CI voor build/typecheck/Node-tests op Mac/Windows, relevante Electron-tests en artifacts; (B) taggestuurde installers + install-/opslag-/audio-smoke en publiceren na geslaagde controles. PR-workflows read-only permissions; releasejob krijgt alleen nodige schrijfrechten. Geen secrets nodig voor gewone tests. Geen tag aanmaken of release publiceren tijdens voorbereiding.

**Concrete bestaande portabiliteitsbevinding:** `tests/audio-format.test.mjs` gebruikt `mkdtemp('/tmp/...')`; dit vervangen door os.tmpdir bij #8. Generatiescript van audiofixtures gebruikt Mac-afconvert, maar de fixtures staan al in Git en hoeven in Windows-CI niet opnieuw gemaakt. Icongeneratie heeft ook een vaste /tmp-locatie; alleen portable maken als CI dat script gaat gebruiken. Typecheck omvat niet de desktoptestbestanden; CI moet ze werkelijk uitvoeren.

**Risico:** Windows cross-build op Mac is geen installatietest; virtuele audiodevices bewijzen geen muzikale luisterkwaliteit. Installer kan goede geïsoleerde gebruikersdata verliezen of andere executable starten. Geen bestaande Developer-certificaten/Windows-signing veronderstellen. Huidige Mac is arm64; ondersteunde Mac-architecturen expliciet kiezen. Electron44/Node SQLite en TS-bronimport vereisen een passende gepinde Node-runtime. UNLICENSED en verplichte dependencyvermeldingen vóór externe distributie beoordelen.

**Tests:** installer op echte Windows-runner installeren/starten, geïsoleerde userData importeren/opslaan/heropenen, audio decode/render met meetbaar niet-stil resultaat; daadwerkelijke output/luisteren op Windows als aparte controle rapporteren. Mac-installatie/launch/protocol/WASM/font offline; upgrade met bestaande bibliotheek; tagversie/artifactnamen, foutpad publiceert niet, releases zonder updater. Installers geen gebruikersdatabase bundelen.

**Documentatie:** TECHNISCH + nieuw releasehandboek bij implementatie; README platform-/installatie-instructies, ONTWIKKELPLAN. FUNCTIONEEL/DESIGN alleen als zichtbare installatie-/appinteractie verandert, niet voor louter workflow-YAML.

## 4. Keuzes vóór de betreffende implementatie

Deze punten zijn niet door de korte issues beslist; onderstaande aanbevelingen zijn ter goedkeuring:

1. **Duur van een metronoomherhaling (#1):** aanbevolen aantal maten per sessiestap (startvoorstel 8), zodat de sessie eindig is en een oefening herbruikbaar blijft. Alternatief vaste seconden; dat kan halverwege een maat eindigen. Dit vraagt een expliciete metronoomstap in de tabel, niet een verborgen nep-audioduur.
2. **Tel-eenheid (#1/#2):** aanbevolen BPM per kwartnoot, ook bij 6/8; zes achtstetellen per maat dus 30/BPM seconden per tel en een maatduur van 180/BPM. Alternatief BPM per genoteerde tel of gepunte kwart; die geven andere duur/klikken. Kies en label dit consequent. Ook de accentindeling voor 6/8 vastleggen (voorstel nadruk op 1 en lichtere op 4).
3. **Afteltijd (#2):** aanbevolen apart als voorbereiding bij geplande totaalduur tonen; niet toevoegen aan gespeelde oefentijd/dashboard. Dit verandert de huidige tijdregels en vereist akkoord. Bij pauze tijdens aftellen de aftelmaat opnieuw beginnen; na terugkeer uit vrij fragment ook opnieuw aftellen voor de herstartende geplande herhaling. Vrije loops krijgen geen aftelmaat bij iedere loop.
4. **Waveform (#4):** aanbevolen selectie via de bestaande vrije fragmenttraining; gepland schema alleen aanpassen door expliciet fragment bewaren/kiezen. Geen stilzwijgende wijziging van de lopende sessiestap.
5. **Taal (#6):** aanbevolen Engels voor niet-Nederlandse systeemtaal, Nederlands voor nl; expliciete keuze wint. Live taalwissel zonder sessie te herstarten.
6. **Distributie (#8):** aanbevolen Windows x64-installatieprogramma en Mac arm64-installatiepakket als eerste gevalideerde platforms. Of Intel-Mac ook vereist is en of certificaten/notarisatie beschikbaar zijn, vóór release beslissen. Gratis ontwikkeling is mogelijk; ondertekende distributie kan externe kosten/credentials vragen, geen aankoop/aanvraag in deze fase.

Keuzes 1–3 zijn nodig vóór #1/#2. Andere keuzes kunnen vóór hun eigen issue worden bevestigd; ze blokkeren de analyse niet. Toonhoogte per geplande stap blijft buiten deze milestone tenzij een issue dat expliciet uitbreidt.

## 5. Documentatie-inventaris

| Document/bestand | Huidige rol | Aanpak |
|---|---|---|
| FUNCTIONEEL.md | Centrale wensen, afspraken en fasehistorie t/m v0.0.16 | Behouden als bron van functioneel gedrag; nieuwe milestonewensen onder duidelijk nog niet geïmplementeerde status. |
| DESIGN.md + design/renders | Goedgekeurde Studio donker/Mandarijn en scherm-/interactierichtlijnen | Actualiseren per zichtbaar gewijzigd issue; geen tweede designhandboek. |
| TECHNISCH-ONTWERP.md | Oorspronkelijk voorstel plus gerealiseerde technische aanvullingen | Behouden; actuele implementatiestatus onderscheiden van historie/voorstellen. |
| ONTWIKKELPLAN.md | Eerdere fasen 0–8, testbare leveringen | Release-1.0-plan koppelen aan bestaande afrondingsfase, niet een concurrerende planning. |
| README.md | Start/build/test/pakketten/licenties en documentlinks | Later per afgerond issue aanpassen; nu alleen verwijzing naar dit voorstel. |
| AGENTS.md | Permanente afspraken en gebruiksfeedback | Niet blind vervangen; voorgestelde werkwijze toevoegen vóór bestaande afspraken na akkoord. |
| docs/FASE-*.md en themadocumenten | Opleveringsbewijzen, handmatige stappen en beperkingen | Historisch bewaren, voor nieuw issue alleen aanvullend testbewijs waar nuttig. |
| src/domain/README.md, src/storage/README.md | Nog fase-0-plaatsaanduidingen | Geen actuele architectuurbron: domein staat nu in electron/*-model.mjs en src/session, opslag in electron/library.mjs. Bij relevante codewijziging verwijzingen actualiseren, geen grote verplaatsing. |
| src/audio/README.md | Audiolaagbeschrijving | Controle bij timing/BPM-issues. |
| public/licenses + package.json | Gedeeltelijke dependencyvermelding; project UNLICENSED | Volledige controle bij #8; geen licentie namens eigenaar kiezen. |

Nieuwe documentatie beperken tot dit milestonevoorstel, het AGENTS-voorstel en later een releasehandboek/exportspecificatie wanneer die bestaan. Geen extra functioneel of technisch ontwerp dupliceren.

## 6. Voorgestelde Git- en acceptatiewerkwijze

- Analyse op `codex/release-1-analysis`, aparte documentatie-PR; geen auto-merge en geen issues sluiten met dit plan.
- Na goedkeuring eerst AGENTS-aanvulling in de repo definitief maken via PR. Bestaande afspraken, designkeuzes en feedback blijven leidend; eerdere rechtstreekse pushes naar main vervangen door issuebranches/PR's.
- Per issue `codex/issue-<nummer>-<korte-naam>`, starten vanaf actuele geaccepteerde main. Lees issue en commentaren opnieuw, noteer impact en scope. Vraag alleen om nog open, bepalende keuzes.
- Commit code/tests/relevante docs samen, met `Refs #n` of `Fixes #n` volgens daadwerkelijke afronding. Eén logisch samenhangende verandering per commit.
- PR bevat aanleiding/gedrag, keuzes, documentatie, criteria→bewijs, uitgevoerde tests en resterende risico's. `Closes #n` alleen wanneer alle criteria werkelijk gedekt zijn. Niet zelf mergen; gebruiker accepteert en kan bijsturen vóór het volgende afhankelijke issue.
- Relevante Node-tests/typecheck/build; Electron-tests bij GUI/audio/IPC; tijdelijke geïsoleerde gebruikersdata. Test omvang op risico, geen tests die alleen code herhalen. Geen persoonlijke bibliotheek wijzigen.
- Opslagmigraties op oude database + snapshots testen; ongedaan maken van code mag geen stilzwijgende dataverliesroute zijn. Grote architectuurwijzigingen en nieuwe diensten vooraf voorleggen; standalone/offline behouden.
- Package/installertests bij wijzigingen aan protocol, processen, vensters, bestandsdialoog of release. Geen release/tag/publicatie als neveneffect van een issue buiten #8; ook bij #8 eerst reviewbare workflow en expliciet releasemoment.

## 7. Huidige verificatie en grenzen

Op 15 oktober 2026: `pnpm build` (beide TypeScript-configuraties + Vite) geslaagd; `pnpm test`: **47/47** geslaagd. Bestaande bundlerwaarschuwing over een dependency-`use client`-directive, geen buildfout. Alleen documentatie gewijzigd in dit voorstel; desktopreeks en nieuwe pakketten niet opnieuw uitgevoerd/gebouwd. Historische v0.0.16-controles staan in docs/OEFENING-BEHEREN.md, tellen niet als nieuwe Windows-validatie.

SSH-toegang naar origin faalt op deze machine met Permission denied (publickey), ook bij expliciete bestaande sleutel. Issues zijn via de gekoppelde GitHub-verbinding gelezen; publiceren van de analyse kan via diezelfde verbinding. Geen sleutels vervangen of remotes/accounts gewijzigd. Dit is een lokale verbindingsbeperking, geen productissue.

### Voortgang na acceptatie van #5

De gebruiker accepteert v0.0.23 en vraagt bij #7 optionele informele makerherkenning. V0.0.24 implementeert één offline .htbexercise-bestand, importpreview/naamconflictwaarschuwing, nieuwe identiteiten en makernaam/boodschap. De archiefsuggestie gebruikt versieerbaar JSON met base64-assets en inhoudscontrole zonder extra dependency; zie docs/OEFENING-DELEN.md voor impact en bewijs. Gebruikstest/PR-acceptatie volgen vóór #6; #8 blijft apart. Geen zelfstandige merges of issue-sluiting.

### Voortgang na acceptatie van #7

De gebruiker accepteert v0.0.24 en geeft opdracht voor #6. V0.0.25 levert Nederlands/Engels met systeemtaalfallback, bewaarde handmatige voorkeur en directe wisseling zonder speler-/invoerverlies, ook in het losse tablatuurvenster. Instellingen en de paginakop sturen dezelfde keuze; eigen inhoud en historie blijven behouden. Zie docs/TAALKEUZE.md voor impact en testbewijs. Gebruiksfeedback volgt vóór #8; Windows-runtimegebruik en distributiekeuzes blijven open. Geen zelfstandige merges.
