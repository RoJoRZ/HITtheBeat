# HITtheBeat — Technisch ontwerpvoorstel

Datum: 10 oktober 2026.

Status: de gebruiker heeft op 10 oktober 2026 opdracht gegeven om volgens het ontwikkelplan te beginnen. Electron, React en TypeScript worden in fase 0 als technische basis geïmplementeerd. V0.0.4 bevat de audio-engine, eigen bibliotheek en een eerste BPM-detector. Automatische Mac-controles zijn uitgevoerd; kwaliteit op echte muziek en Windows-gebruik blijven open. De functionele eisen staan in `FUNCTIONEEL.md`.

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
| BPM-analyse | Achtergrondtaak op gedecodeerde audio | Tempo schatten bij import zonder de interface te blokkeren; eerste eigen detector in v0.0.4; kwaliteit op echte oefeningen nog te beoordelen. |
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

## 11. Schermproef en ruimer tempo (v0.0.3)

Het door de gebruiker gekozen tempobereik is nu 0,25–3,0 maal de bron. Enginevalidatie en beide spelers volgen dit bereik. De DSP-proef omvat de nieuwe grenzen afzonderlijk en gecombineerd met transpositie. Bronduur en audioklok blijven leidend; luisterkwaliteit op echt materiaal blijft een afzonderlijke acceptatie.

Fase 2 gebruikt een gedeelde voorbeeldomgeving met tijdelijke React-toestand, voorbeelddata, getalbediening en het bestaande audiocomponent in een compacte spelervariant. De tabel gebruikt bronduur/BPM voor de geplande duur. Toonhoogte per rij blijft uitgeschakeld omdat deze keuze nog openstaat. Voorbeeldgegevens gaan niet naar opslag en schrijven geen sessiehistorie. De componenten vormen de basis voor de echte bibliotheek en editor in volgende fases; de voorbeeldomgeving blijft herkenbaar gescheiden van eigen gegevens.

## 12. Bibliotheek en BPM-proef (v0.0.4)

De bibliotheek gebruikt `node:sqlite` (`DatabaseSync`) uit de gebundelde Electron-runtime, zonder extra native module. Beschikbaarheid is gecontroleerd in Electron 44.7.0 met Node 24.21.0. `electron/library.mjs` beheert een STRICT-schema met `user_version=1`, WAL en gebonden SQL-parameters. Een nieuwere schemaversie wordt geweigerd. Metadata voor media en bevestigd/geschat BPM worden gescheiden opgeslagen. De huidige versie voegt het eerste schema toe; migratie met bestaande rondjes/historie is nog niet aan de orde.

Gegevens staan onder Electron `appData/HITtheBeat/library`: `library.sqlite` en een map `media`. Op macOS is dit normaal `~/Library/Application Support/HITtheBeat/library`; op Windows `%APPDATA%/HITtheBeat/library`. Media krijgen willekeurige interne UUID-namen. De oorspronkelijke naam is alleen metadata. Alleen vaste IPC-methoden mogen oefeningen bewaren of media via een geldig oefening-ID lezen. Renderer-toegang tot willekeurige paden blijft uitgesloten; dezelfde controle op afzender en hoofdframe geldt voor alle bibliotheekmethoden. Afbeeldingen worden als Blob-URL getoond; de CSP staat daarom `blob:` uitsluitend bij `img-src` toe.

Bestanden worden vóór de enkele atomaire metadata-mutatie geschreven; mislukte writes/SQL ruimen nieuw aangemaakte media op. Een abrupte proces- of stroomuitval tussen bestand en metadata kan een ongebruikt mediabestand achterlaten. Een backup-/herstelvoorziening is nog niet gebouwd. Wijzigen van een oefening kan naam, opdracht, bevestigd BPM en afbeelding aanpassen; vervangen van de audiotrack gebeurt voorlopig via een nieuwe oefening. De desktoptests gebruiken `--user-data-dir` voor geïsoleerde testbibliotheken, ook in de verpakte app.

`analyze.ts` decodeert MP3 via OfflineAudioContext op 22.050 Hz en kiest het energierijkste kanaal om stereofase-uitdoving te voorkomen. Maximaal 90 seconden gaan naar een lokale module-Worker. `bpm.ts` schat een puls uit positieve RMS-energieveranderingen, genormaliseerde autocorrelatie en een voorkeur voor de eerste sterke periodiciteit. Dit is een eigen eenvoudige implementatie zonder aanvullende detectorlicentie. Analyse kan worden geannuleerd; een timeout of Workerfout levert geen schatting op en laat handmatige invoer beschikbaar. Een decodeerfout blokkeert import van onleesbare audio.

Referentie voor de algemene combinatie onsetsterkte/autocorrelatie: [Ellis, eenvoudige beat-tracker](https://www.ee.columbia.edu/~dpwe/LabROSA/matlab/beat_simple/). De proef implementeert niet zijn volledige algoritme. [Node-documentatie voor SQLite](https://nodejs.org/api/sqlite.html) beschrijft de runtime-API. Synthetische klik- en geplukte signalen en een gecomprimeerde MP3 worden gecontroleerd; een vergelijking met diverse echte oefeningen en de muzikale keuze tussen halve/dubbele puls blijven nodig voordat deze detector als voldoende betrouwbaar wordt geaccepteerd.

## 13. Opgeslagen rondje-editor (v0.0.5)

Schema-versie 2 voegt `routines`, `routine_blocks` en `routine_steps` toe. Een transactie migreert de bestaande versie 1 zonder de oefeningentabel of mediabestanden te herschrijven. Posities leggen de volgorde vast; UUID’s identificeren rondje, blok en stap onafhankelijk van hun schermpositie. Foreign keys verwijzen naar oefeningen en wissen blokken/stappen bij verwijderen van hun rondje. Dezelfde bron-oefening kan in verschillende blokken staan met verschillende instellingen.

Bewaren valideert eerst het gehele rondje tegen de actuele brontempi en trackduren uit SQLite. Daarna worden metadata en opbouw binnen één transactie vervangen. Een fout rolt ook de naamwijziging en verwijdering van oude blokken terug. Verwijderen raakt alleen het rondje met zijn blokken/stappen. Drie nieuwe vaste IPC-methoden (`listRoutines`, `saveRoutine`, `deleteRoutine`) gebruiken dezelfde hoofdframecontrole als de bibliotheek.

Het zuivere module `electron/routine-model.mjs` wordt zowel door de renderer als de opslag gebruikt voor validatie en duurberekening. Het bevat geen Electron- of bestandstoegang. Het productieproces vertrouwt geen meegestuurde duur. Volledige track is `start=null,end=null`; een fragment bewaart bronseconden. Stappen hebben absolute BPM’s; zij wijzigen het brontempo van de oefening niet.

`RoutineScreen` bewaart een concept in React-toestand. De editor blijft gemount bij navigatie zodat terugkeren het concept behoudt; bibliotheekoefeningen worden bij activering opnieuw geladen. Bewaren levert het opgeslagen rondje terug en wist de wijzigingsmarkering pas na succes. Wisselen van concept heeft een dialoog voor verwerpen/doorbewerken. Concepten bij app-afsluiting automatisch herstellen en gelijktijdige bewerking vanuit meerdere appvensters zijn niet geïmplementeerd.

## 14. Rondje-uitvoering (v0.0.6)

`src/session/runner.ts` bevat de zuivere sessietoestand: momentopname, oefenblok, stap, herhaling, fase, afgeronde speelbeurten en blokstatussen. Alleen een audio-eindegebeurtenis in de fase playing verhoogt de teller. Vrije training, pauze en terugblik verwerken die gebeurtenis niet als een geplande herhaling. Een revisienummer identificeert een nieuw voorbereide speelbeurt; terugkeren uit vrije training verhoogt de revisie met behoud van stap/herhaling.

`AudioEngine.playSegment` begrenst een eenmalige speelbeurt op bron A/B. GainNode-automatisering sluit geluid op de audioklok af bij B; de positie en ended-toestand volgen dezelfde grens. De bestaande configure/loop-bediening blijft een aparte vrije modus en wist de eenmalige segmentbegrenzing. Expliciet pauzeren voorkomt dat een toggle per ongeluk audio herstart tijdens een overgang.

`SessionPlayer` koppelt de toestand aan de engine. Zij gebruikt een directe toestandsreferentie en vergrendelt een overgang voordat React de volgende speelbeurt voorbereidt, zodat dezelfde ended-toestand niet tweemaal meetelt. Generatietokens negeren verouderde bestands-/decodeerresultaten; unmount ruimt context, timer en Blob-URL’s op. Bronbuffer/worklet blijven binnen hetzelfde oefenblok beschikbaar; een volgend blok krijgt een nieuwe engine. De ontwikkelproef controleert ook de effectlevenscyclus onder React StrictMode.

Geluid eindigt onafhankelijk van de 50-ms-UI-timer. Die timer verwerkt de overgang naar de volgende speelbeurt; de app garandeert daarmee nog geen naadloze, sample-aansluitende overgang. Bij achtergrondvertraging kan de volgende speelbeurt later beginnen, terwijl de vorige wel op B is begrensd. Luisterbeoordeling van overgangen blijft nodig.

Tijd wordt per audioklokinterval verdeeld over gepland afspelen, vrije training en expliciete pauze. Het laatste interval vóór het segment-/trackeinde wordt begrensd tot de resterende afspeelduur. Laden, terugblik en wisselen vallen buiten deze drie tellers. Deze tijdelijke telling is geen opgeslagen sessiehistorie; tijddefinitie, resultaten en herstel na afsluiten volgen bij fase 6. Er is geen databasewijziging nodig voor fase 5.


## 15. Fase 6 — Fragmentseries en sessiehistorie

De runner groepeert aaneengesloten stappen op genormaliseerde A/B-grenzen binnen één oefenblok. Een volledige track en een expliciet fragment 0–trackduur vormen dezelfde serie. Na de laatste herhaling van de serie volgt `review`; alleen bij de laatste serie krijgt het oefenblok de status completed. Herhalen start bij de eerste stap van die serie; Verder start de volgende serie of het volgende oefenblok.

SQLite schema 3 voegt `sessions` toe zonder oefeningen of rondjes te vervangen. Iedere sessie bevat een vaste JSON-momentopname van rondje en gebruikte oefeningen, een voortgangscheckpoint, evaluaties en de verwachte versie van het toekomstige rondje. Afgespeelde tijd en afgeronde speelbeurten worden geaggregeerd per oefenblok, stap, modus, A/B, BPM en toonhoogte. Hierdoor blijft vrije training herkenbaar en worden gedeeltelijk gespeelde stukken niet als afgeronde herhalingen voorgesteld.

De geïsoleerde preload biedt start/list/save/review voor sessies; de main-framecontrole blijft van toepassing. Het hoofdproces valideert de gegevens en afspeelcontext tegen de vaste momentopname. Checkpoints krijgen oplopende volgordenummers en worden in de renderer in volgorde verzonden. Verouderde berichten worden genegeerd; afgesloten sessies worden niet opnieuw geopend. Controles bewaken tellers, totalen en grenzen.

Een evaluatie heeft een UUID. Evaluatie en BPM-aanpassing worden in één SQLite-transactie opgeslagen, met een controle op de opgeslagen rondjeversie. Een identieke evaluatie-ID wordt slechts één keer verwerkt. De BPM-aanpassing werkt op het bedoelde blok en valideert de hele resulterende opbouw. De snapshot van de lopende sessie verandert niet. Een schone editor ververst zijn opgeslagen rondje bij terugkeer; niet-opgeslagen concepten blijven bewaard.

De speler schrijft iedere seconde en bij overgangen een checkpoint. Normaal stoppen wacht op bewaren. Bij venstersluiten of opnieuw openen worden nog actieve records als interrupted aangemerkt. Dit is historieherstel tot het laatste checkpoint, geen garantie op het allerlaatste audio-interval en geen hervatting van de afspeelpositie. Tijd wordt gemeten via de audioklok; evaluatie en laden vallen buiten de oefentijd. Het dashboard met grafieken is fase 7.
