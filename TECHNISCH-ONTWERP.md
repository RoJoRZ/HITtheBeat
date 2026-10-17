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


## 16. Normalisatie en volumeregeling (v0.0.8)

De importanalyse decodeert de MP3 op 44,1 kHz en meet alle kanalen over de gehele track. Een eigen RMS-meting met blokken van 400 ms negeert blokken onder −60 dBFS of 30 dB onder het luidste blok. Het streefniveau is −18 dBFS RMS; de vaste correctie wordt begrensd op +12 dB versterking en −1 dBFS gemeten samplepiek. Vrijwel stille audio blijft ongewijzigd. Dit is praktische niveaumatching, geen LUFS-/true-peaknorm en geen dynamische compressie. Verschillen in klankkleur en piekverhouding kunnen hoorbare luidheidsverschillen laten bestaan.

Schema 4 voegt `normalization_db` en `normalize_audio` toe aan oefeningen. De import bewaart de originele MP3 en een afzonderlijke niveaucorrectie. Ontbrekende velden bij een metadatawijziging behouden bestaande instellingen; gain en aan/uit worden in het hoofdproces gevalideerd. Oude oefeningen krijgen geen gemeten gain. Opnieuw analyseren in Bewerken kan deze alsnog invullen. De BPM-worker blijft een zelfstandige analyse; een ontbrekende BPM-schatting verhindert volumenormalisatie niet.

Bij het laden vermenigvuldigt de audio-engine een kopie van de PCM-kanalen vóór Signalsmith met de gekozen correctie. De engine begrenst opnieuw op de daadwerkelijk gedecodeerde samplepiek, omdat de afspeelsamplerate kan afwijken van de analyse. Bronbestanden en de oorspronkelijke AudioBuffer blijven intact.

Een aparte GainNode ná de bestaande afspeelgate regelt het gebruikersvolume met een korte overgang. Zo verandert volume geen afspeelpositie en wist het geen geplande stilte bij fragmentpunt B. Een gedeelde React-store synchroniseert de echte spelers en bewaart volume/dempen als lokale voorkeur. Bij het aanmaken van een nieuwe engine wordt de huidige voorkeur direct toegepast. Sessietijd en BPM-historie veranderen niet door volume of dempen.


## 17. Evaluatie met toetsenbord (v0.0.9)

SessionReview beheert de actieve invoerstap en focus binnen de echte evaluatie. Cijfers hebben alleen betekenis binnen de gefocuste beoordelings- of tempogroep; in numerieke en tekstvelden blijven ze gewone invoer. De evaluatie krijgt automatisch focus. Na een cijfer verplaatst focus naar tempo; na sneller/langzamer naar het geselecteerde BPM-veld. Tab/Shift+Tab en muisklikken kunnen de actieve stap veranderen. Enter bewaart vanuit ieder onderdeel de actuele keuzes, ook vanuit de optionele notitie. Tijdens bewaren is invoer geblokkeerd. De reguliere transporttoetsen blijven tijdens review uitgeschakeld.

Evaluaties bevatten nu een optioneel integer-veld rating (1–5). Nieuwe evaluaties sturen de gekozen waarde mee; het hoofdproces valideert deze en gebruikt 3 bij ontbrekende invoer. Oude JSON-evaluaties zonder rating worden niet herschreven en tonen geen verzonnen cijfer. Er is geen schemawijziging nodig. Cijfer, notitie en toekomstige tempo-aanpassing gaan in dezelfde bestaande transactie met dezelfde idempotentie- en versiecontrole.


## 18. Benoemde fragmenten (v0.0.11)

SQLite schema 5 voegt een JSON-lijst fragments toe aan oefeningen en fragment_id/fragment_name aan routine_steps. Een fragment bevat UUID, naam en originele A/B-seconden. Afzonderlijke preload-methodes saveFragment/deleteFragment wijzigen uitsluitend de fragmentlijst van de huidige oefening. Het hoofdproces valideert identiteit, unieke naam, grenzen en maximum 100 fragmenten. Metadata- en normalisatiebewerkingen overschrijven deze lijst niet.

Een sessiestap kopieert naam, ID en grenzen bij kiezen. De grenzen blijven leidend voor validatie, afspelen, duur en serie-evaluaties. Een gewijzigde of verwijderde bibliotheekbron maakt oudere opbouwen niet ongeldig. De kiezer toont dan de bewaarde selectie naast actuele keuzes. Het opnieuw kiezen van de bron neemt de huidige waarden over. Bestaande stappen zonder metadata blijven geldig. Sessiemomentopnamen worden niet herschreven.

FragmentSelect en DecimalInput worden gedeeld door beide tabellen. DecimalInput houdt de onbewerkte invoer tijdens focus vast en geeft de numerieke waarde door, met ondersteuning voor decimale komma; lege en onvolledige invoer kan worden gecorrigeerd zonder het veld te vervangen. SaveCurrentFragment schrijft de actuele loopgrenzen zonder de audiomotor of runner te herconfigureren. LibraryScreen ververst de fragmenten na bewaren; de audiolader reageert op audio-instellingen in plaats van een algemene updatedAt-wijziging, zodat fragmentopslag de loop niet herstart.


## 19. Eigen omgeving als vaste start (v0.0.12)

App start direct op routines. ExampleScreens, fictieve data en de bijbehorende SVG zijn verwijderd, evenals de omschakelstatus en voorbeeldbanner. RoutineScreen blijft gemount bij navigatie zodat een onopgeslagen opbouw behouden blijft. Oefeningen, rondjespeler en historie gebruiken uitsluitend de bestaande desktopkoppeling. Audioproef gebruikt nog de afzonderlijke gegenereerde testmelodie.

Deze wijziging vereist geen databasemigratie: schema 5, bestanden en sessiemomentopnamen blijven intact. Desktoptests vullen hun geïsoleerde bibliotheek vóór herladen of heropenen en controleren direct de echte routes. Historische ontwerpen en testfixtures blijven buiten de productinterface.


## 20. Recent sessieoverzicht (v0.0.13)

RoutineOverview ontvangt de bestaande routines, oefeningen en sessiehistorie via RoutineScreen. Per routine-id bepaalt het laatste startedAt de sortering; bij ontbrekende historie geldt updatedAt. Titel en id breken gelijke tijdstempels deterministisch. De recente weergave neemt tien opbouwen; de volledige weergave filtert lokaal op naam. Duur en validatie gebruiken dezelfde modellen als de editor. Er is geen nieuwe database of migratie.

RoutineScreen start zonder draft in overzichtsmodus. Bewerken en aanmaken openen de bestaande editor; teruggaan gebruikt de bestaande controle op onopgeslagen wijzigingen. App verhoogt overviewKey bij verlaten van de speler; dit wist de editorselectie en ververst routines, oefeningen en historie. Andere navigatie houdt de editor gemount. De speler blijft starten vanaf een opgeslagen momentopname met de bestaande beveiliging tegen dubbel starten.


## 21. Dashboardberekeningen (fase 7, v0.0.14)

De pure module src/library/progress.mjs verwerkt uitsluitend SessionRecord-momentopnamen uit listSessions. buildDashboard heeft injecteerbare now en timeZone voor controle van week/maandgrenzen en DST. Intl formatToParts bepaalt lokale ISO-dagen; kalenderrekenen gebeurt met UTC-dagen, zodat een 23- of 25-uursdag niet wegvalt. De gegevens worden aan de lokale sessiestartdag toegerekend omdat bestaande Played-segmenten geen eigen tijdstempel hebben.

Samenvattingen tellen times.planned + times.fragment, nooit pause. Alleen positieve oefentijd telt als oefendag/geoefende sessie; status completed bepaalt volledig afgerond. Historie en tempo-punten gebruiken dezelfde periode. De dagbalken zijn bij Alle tijd beperkt tot 28 kalenderdagen, zonder de all-time-totalen te beperken.

De vergelijkingssleutel bevat routine-id, block-id, exercise-id, origineel BPM, bronduur, volledige track of exacte A/B-grenzen, mode en pitch. Voor geplande beurten komen de grenzen uit de opgeslagen stap om decoderafwijkingen niet als nieuwe fragmenten te behandelen. Per groep en sessie telt het maximum BPM van Played met completed > 0; vrije segmenten gebruiken positieve seconds en blijven apart. De laatste passende opgeslagen evaluatie geeft context. De modellen veranderen geen input en lezen geen actuele oefeningen of routines.

SessionHistory laadt de bestaande historie; ProgressDashboard geeft periodekeuze, samenvattingen, SVG-grafiek, dagbalken en toegankelijke tabellen. De bestaande sessiedetails blijven beschikbaar. Er zijn geen nieuwe IPC-routes, afhankelijkheden of databasemigraties.

## 22. M4A-import en instellingen (v0.0.15)

Een gedeelde pure validator `electron/audio-format.mjs` controleert extensie, grootte en headers vóór decode/import. M4A wordt begrensd doorzocht als ISO BMFF-container; AAC-audiosporen met mediadata worden geaccepteerd, ALAC, beveiligde samples, video en beschadigde boxgrenzen geweigerd. De renderer moet het bestand bovendien succesvol decoderen vóór opslaan. De bestaande OfflineAudioContext-analyse en Signalsmith-spelers verwerken beide formaten. Synthetische AAC- en ALAC-fixtures zijn op macOS met afconvert gemaakt; ze staan in Git zodat tests geen encoderinstallatie nodig hebben.

De mediamap bewaart UUID-bestanden met de bronextensie `.mp3` of `.m4a`; readAudio levert respectievelijk audio/mpeg of audio/mp4. De bytes worden niet geconverteerd. SQLite-schema 5 blijft gelijk; oude media en momentopnamen blijven leesbaar. Instellingen gebruikt de bestaande beperkte IPC-actie library:folder. De standalone Audioproef en testmelodiegenerator zijn verwijderd; de opgeslagen-oefeningspeler en DSP-testharness blijven. AAC-decodering is op Mac gecontroleerd; ALAC faalt in deze Electron-runtime en krijgt daarom expliciete uitleg. Windows-gebruikstest blijft open.

## Oefening verwijderen/audio vervangen — v0.0.16

Schema 5 blijft behouden. `library:delete` loopt via de beperkte preload-API en bestaande IPC-autorisatie. Verwijderen controleert eerst verwijzingen uit opgeslagen opbouwen, verwijdert daarna het oefenrecord en ruimt alleen de beheerde mediabestanden op. Historie is onafhankelijk opgeslagen als JSON-momentopnamen.

Audiovervanging valideert bestand, fragmenten en afhankelijke opbouwen vóór schrijven. Een uniek mediabestand wordt geschreven; de bestaande SQL-upsert vervangt audioverwijzing, naam en duur samen met metadata. Bij databasefouten worden nieuw geschreven bestanden opgeruimd; na succes wordt de oude audio verwijderd. Fragmenten en historische momentopnamen blijven intact. De editor vervangt tijdelijk het detailscherm; bij terugkeer na opslaan leest de vrije speler de nieuwe audio. Fragmenten opslaan tijdens vrije training remount de speler niet. Een eerder gelopen sessie bevat historische metadata; dit is geen audioarchief van eerdere bronversies.

Appicoon: reproduceerbare SVG-bron, `scripts/generate-icon.mjs` rendert via Electron en maakt PNG, ICNS en ICO. Electron gebruikt PNG voor venster/Dock, electron-builder ICNS voor Mac en ICO voor Windows. Windows-resourcebewerking staat aan om het icoon daadwerkelijk in de executable op te nemen; codeondertekening blijft afzonderlijk open.

## Metronoom-oefeningen — issue #1, v0.0.17

Schema 6 voegt `kind` (audio/metronome) en `meter` aan oefeningen toe en optionele `bars` aan sessiestappen. Bestaande oefeningen krijgen audio en 4/4; oude sessiemomentopnamen zonder deze velden blijven audio. De legacy NOT NULL-audiokolommen blijven intact om de bestaande tabellen/foreign keys niet te herbouwen: een metronoom heeft lege audio_name/audio_file en duration 0, zonder mediabestand. Dit is expliciete afwezigheid van een bron, geen nep-audio of vaste trackduur. Een oudere appversie weigert schema 6; terug naar v0.0.16 met deze bibliotheek is niet ondersteund.

`exercise-model.mjs` deelt typecontrole, maatsoort, temporegels en duur. Metronoomduur is bars × teller × 4/noemer × 60/BPM. Voor runner/gespeelde gegevens gebruiken metronoomstappen broncoördinaten in seconden bij het oorspronkelijke BPM, berekend per stap; werkelijke duur wordt met bron-BPM/speel-BPM geschaald. De bronrecordduur blijft nul. Snapshotvalidatie en dashboard gebruiken dezelfde per-stapberekening. Groepering voor metronoom bevat maatsoort en maten; oude audiovergelijkingen blijven gelijk.

`MetronomeEngine` biedt de gebruikte transportinterface naast AudioEngine. Oscillators met korte gain-envelope worden voor één eindige herhaling op AudioContext.currentTime gepland; maximaal 128 maten (768 klikken bij 6/8). Er is geen UI-timer die klikken triggert. Pauze, seek en dispose annuleren geplande oscillators; de bestaande sessiestate-machine bepaalt overgangen en evaluatie. Mute wordt al vóór starten toegepast. Geen nieuwe dependency, cloud of audiobestand nodig. Audio-context en nodes worden bij verlaten opgeruimd. De 50ms UI-timer toont alleen positie/tel en controleert herhalingseinde; stilte tussen herhalingen kan dus nog UI-afhankelijk zijn, zoals bij bestaande audioherhalingen.

Opslag weigert typeconversie en audiofragmenten bij metronoom. De bestaande audiovervangings- en verwijzingscontroles blijven gelden. De losse metronoomspeler schrijft geen sessiegegevens. Issue #2 voegt later de afzonderlijke aftelfase toe; deze implementatie introduceert die nog niet.

### Maten als oefeninstelling — v0.0.18, issue #1

Schema 7 voegt `exercises.bars` toe (default 8, bereik 1–128). Een gemeenschappelijk aantal uit schema-6-stappen wordt gepromoveerd naar de oefening; overeenkomende overrides worden gewist. Conflicterende legacy-stappen blijven intact. Gedeelde `exerciseBars`/`sourceSeconds` gebruiken een aanwezige legacy-override, anders de oefeninstelling, anders 8 voor oude snapshots. Nieuwe sessiestappen bewaren geen eigen aantal.

Een expliciete metronoomopslag met bars werkt oefening en alle verwijzende sessie-opbouwen in één transactie bij: stapoverrides worden gewist en routineversies worden verhoogd, zodat een lopende evaluatie niet een intussen bewerkte opbouw overschrijft. Sessiemomentopnamen blijven ongewijzigd. Een achtergebleven editor mag alleen nog een werkelijk bestaande legacy-override behouden, niet een gewiste override opnieuw invoeren. De losse speler leest de opgeslagen oefeninstelling. Oude appversies ondersteunen schema 7 niet.

## Aftelmaat — issue #2, v0.0.19

Schema 8 voegt nullable JSON-kolom `routines.count_in` toe. Ontbrekend blijft aftellen uit, zonder het oorspronkelijke model van oude snapshots te herschrijven. `count-in-model.mjs` valideert enabled/meter en berekent één maat op het komende stap-BPM; de routinevalidator deelt deze controle met het hoofdproces. Snapshot en toekomstige sessie-opbouw houden hun eigen instellingen. Geplande voorbereiding wordt apart berekend naast bestaande `plannedSeconds` (oefentijd).

De pure runner heeft fase `countin`, overgang `counted` zonder extra afspeelrevision en een vlag voor herstart na pauze in de aftelmaat. Iedere nieuwe geplande speelbeurt kiest deze fase als de instelling aan staat. Muziekpauze hervat direct; herstart, serie-opnieuw en terugkeer uit vrije training starten een nieuwe maat. Een count-in kan geen speelbeurt afronden. `remainingPreparation` houdt toekomstige aftelmaten bij, rekening houdend met de huidige fase.

Een kleine gedeelde `click.ts` bevat oscillator/envelope-aanmaak; metronoom behoudt zijn bestaande sinusklikken. `count-in.ts` plant een eindige maat met kortere triangle-klikken op 3000/2300 Hz. AudioEngine en MetronomeEngine plannen de voorbereiding en de daaropvolgende muziek op dezelfde AudioContext-klok. De bronpositie beweegt pas vanaf de toekomstige starttijd van de muziek; de audio-outputgate houdt muziek tot die tijd stil. Pauze, seek/herstart en dispose annuleren geplande klikken en toekomstige muziek. De gedeelde output-gain werkt ook vóór de muziekstart. Herhalingsovergangen blijven via de bestaande UI-loop lopen; binnen één voorbereide speelbeurt is de overdracht op de audioklok gepland.

De sessiemeting splitst een meetinterval op de geplande muziekstart, ook wanneer een UI-tick over die grens valt: `times.preparation` gaat apart van `planned`/`fragment`/`pause`. Alleen muziek voegt Played-seconden en voltooide beurten toe. De voortgangsvalidator accepteert de nieuwe fase alleen bij ingeschakeld aftellen, valideert de tijd en weigert teruglopende voorbereidingstijd. Dashboardtotalen blijven uitsluitend planned + fragment gebruiken. Oude checkpoints zonder het optionele veld blijven valide.

De frontend-TypeScriptconfig staat expliciete .ts-imports toe (noEmit); de gedeelde audiomodules kunnen daardoor ook direct door Node-brontests worden gelezen. Geen nieuwe dependency of externe dienst. Oude versies ondersteunen schema 8 niet. Zie docs/AFTELMAAT.md voor impact, controles en resterende platform-/luisterbeoordeling.


### Aftelmaat per oefenblok — v0.0.20, schema 9

`routine_blocks.count_in` bewaart nullable JSON met enabled/meter. Migratie 8→9 kopieert de oude `routines.count_in` naar alle bestaande blokken en wist daarna de algemene waarde; nieuwe blokken erven deze niet. Opslaan normaliseert eventueel oud routine-input naar de blokken. De oude kolom blijft voor schemacompatibiliteit aanwezig. Historische snapshots worden niet herschreven: `countInForBlock` gebruikt uitsluitend bij ontbrekende blokinstelling de oude sessie-instelling. Expliciet uit op een blok gaat vóór een oude ingeschakelde sessie-instelling.

Validatie, runner, geplande voorbereiding en beide spelerroutes gebruiken de actieve blokinstelling. Overgang naar een ander blok kiest de startfase pas na wijziging van de blokindex. De voortgangsvalidator staat countin alleen toe wanneer het huidige blok aftellen aan heeft; eerder opgebouwde voorbereidingstijd blijft geldig zodra enig blok aftellen gebruikt. Het dashboard rekent nog steeds uitsluitend muziektijd. De audio-engines en audioklokplanning zijn ongewijzigd. Oudere appversies kunnen schema 9 niet openen.


## Los tablatuurvenster — issue #3, v0.0.21

`electron/notation-window.mjs` beheert één secundair BrowserWindow. Het hoofdvenster blijft de enige eigenaar van bibliotheek- en sessie-IPC. Alleen het hoofdvenster mag via notation:context een gevalideerde oefening-ID/titel publiceren en notation:open gebruiken. Het hoofdproces leest de afbeelding via bestaande bibliotheekvalidatie, zonder een willekeurig rendererpad te accepteren. Een oplopend request-token verwerpt verouderde async afbeeldingsresultaten; elke gepubliceerde toestand heeft een volgnummer zodat een oudere opvraagreactie geen nieuwe toestand overschrijft.

De viewer gebruikt dezelfde gebundelde renderer via ?view=notation en een eigen `notation-preload.cjs`. Alleen toestand opvragen/ontvangen, eigen volledig scherm en eigen sluiten zijn beschikbaar. Autorisatie controleert de exacte BrowserWindow, mainFrame en URL afzonderlijk voor hoofdvenster en viewer. Sandbox/contextIsolation/webSecurity blijven aan en nodeIntegration uit; navigatie en extra windows worden geweigerd. Het hoofdproces deelt uitsluitend de actuele afbeelding en titel; de viewer heeft geen audio-, bestand-, bibliotheek- of sessieacties.

De gedeelde context-hook in bibliotheekdetail en sessietablatuur publiceert de actieve oefening en wist bij unmount. De viewer rendert een Blob-URL en ruimt die bij afbeeldingwissel/unmount op. ResizeObserver berekent passende beeldafmetingen; beeldzoom verandert alleen CSS-afmetingen in een scrollvlak, geen Chromium-zoom of opgeslagen media. Fullscreenevents worden teruggekoppeld zodat native platformbediening en Escape synchroon blijven. Een context-ID onderscheidt afbeeldingwissel van fullscreenstatus, zodat die laatste de zoom niet reset.

Viewer sluiten wijzigt geen audio of sessiestatus. Hoofdvenster sluiten sluit de viewer en behoudt bestaande interrupt-afhandeling. Geen opslagmigratie, nieuwe dependency of externe dienst. Test native lifecycle, beperkte IPC, snelle wissels en verpakte offline routes; een Mac-test is geen Windows-gebruikstest.

Het hoofdvenster gebruikt backgroundThrottling=false: de bestaande sessie-/aftelovergangen blijven op tijd lopen als de viewer het hoofdvenster bedekt of fullscreen staat, ook bij gedempt geluid. Dit verandert de audioklok of scheduler niet; de venstertest controleert de voorkeur expliciet.


## Waveformselectie — issue #4, v0.0.22

`src/audio/waveform.mjs` bouwt een compacte piekenpiramide uit alle audiokanalen: maximaal 65.536 basisbins, gevolgd door maxima per twee bins. Transiënten blijven ook in hogere niveaus behouden; de weergave kiest een niveau voor ongeveer 440 schermkolommen. De volledige PCM wordt eenmaal per bronlading gelezen; de 50ms-afspeelpositie-update bouwt de pieken niet opnieuw. Pan/zoom herberekent alleen de zichtbare pieken. De audiomotor blijft ongewijzigd.

De gedeelde `WaveformEditor` bewaart alleen viewport en tijdelijke sleepselectie lokaal. A/B blijven canonieke bronseconden bij de speler. Pointer capture, geklemde broncoördinaten en aparte modi voor selecteren/A/B/pan voorkomen verlies bij buiten het beeld slepen. Pointercancel bewaart de oorspronkelijke selectie. De interactieve minimumselectie is 0,101 seconde om afronding onder de bestaande 0,1s-audiovalidatie te voorkomen. Alleen pointerup geeft de selectie door; geen audioconfiguratie per pointermove. Toets-/handmatige wijzigingen gebruiken dezelfde spelerwaarden.

In SessionPlayer gebruikt selecteren de bestaande fragmentfase en bewaart resumePlaying. De speler pauzeert en meet verstreken tijd vóór het wijzigen van de fragmentcontext, configureert het nieuwe fragment en zoekt A. Preview start deze loop expliciet; terugkeer gebruikt de bestaande runner/counter/aftelregels. AudioLab gebruikt dezelfde waveform en configureert de lokale loop. Snapshot, routine en media worden door beeldbediening niet gewijzigd; alleen expliciet Fragment bewaren schrijft bibliotheekfragmenten. Geen IPC-/schemaverandering of nieuwe dependency.


## BPM-detectie en presentatie — issue #5, v0.0.23

De bestaande RMS-onset/autocorrelatiedetector behoudt worker, 90s-analysegrens, 40–240 BPM en oorspronkelijke fallback. Na kandidaatselectie vergelijkt hij ook de dubbele lag, binnen ±2 frames. Ondersteuning is de som van correlaties binnen ±2 frames: dat beperkt toevallige voordelen van het 100fps-raster. De langere periode wint alleen bij meer dan 10% extra ondersteuning; geen algemene voorkeursrange die snelle tracks blind halveert. Interpolatie en interne decimale detectie blijven bestaan. Dit is een beperkte empirische correctie, geen volwaardig muzikaal maat-/telmodel.

`electron/tempo-display.mjs` deelt de BPM-formatter tussen renderer en validatiefout. Alleen zichtbare tekst/veldnotatie wordt afgerond. Bronwaarden, snapshots, ratio's, graphcoördinaten en vergelijkingssleutels houden hun precisie. Het bibliotheekformulier bewaart de oorspronkelijke veldwaarde zolang BPM niet expliciet wordt aangepast. NumberField geeft een ongewijzigde focus/blur niet terug als wijziging; BPM-stappers/invoer gebruiken bij nieuwe bewerkingen hele getallen. De sessietabel bewaart precieze oude waarden bij naamwijziging. Nieuwe handmatige evaluatie-aanpassingen zijn geheel; bestaande opgeslagen delta's blijven intact.

Halveer/Verdubbel werken lokaal op het huidige bron-BPM-veld, met bestaande invoergrenzen en expliciete opslag. Analyse overschrijft een handmatige keuze niet. Geen schema-, IPC-, dependency- of audiomotorwijziging. Benchmarkbron en generator zijn reproduceerbaar vanuit Git; docs/BPM-BENCHMARK.json bevat vóór/na. De twee paren met dezelfde hoorbare puls maar andere bedoelde tel gelabelde voorbeelden blijven expliciet ambigu.

## Offline oefenbestanden en makervermelding — issue #7, v0.0.24

Het hoofdproces beheert native open/save-dialogen via vier beperkte sharing-IPC-acties (export/preview/confirm/cancel) onder de bestaande hoofdframe-autorisatie. Het losse tablatuurvenster krijgt geen deelrechten. Renderer ontvangt uitsluitend een importpreview en een willekeurig token; bestandspaden en mediabytes van het deelbestand blijven in main. Maximaal één preview wordt vastgehouden; annuleren, succesvol importeren of opnieuw kiezen vervangt/verwijdert die. Bestandsacties worden geserialiseerd.

`exercise-sharing.mjs` definieert `.htbexercise` v1: JSON met formaatnaam, versienummer, expliciete metadata-allowlist en base64-assets met SHA-256-inhoudscontrole. Dit implementeert de eerdere archiefsuggestie zonder nieuwe afhankelijkheid: één portable bestand, geen extractiepaden of uitvoerbare inhoud. SHA-256 detecteert mediabeschadiging, bewijst geen makerschap. Base64 kost ongeveer een derde extra ruimte; 84 MiB totaal dekt de bestaande 50+12 MiB media plus metadata. Stat en begrensd lezen vóór JSON-verwerking, canonieke base64 en gedecodeerde limieten, echte ondersteunde audio-/beeldheaders, begrensde tekst/fragmenten, numerieke bereikcontroles en expliciete versiecontrole. Vervangingen/nieuwe bestanden worden nooit op basis van namen uit het pakket gepad; alle bibliotheekmedia krijgen UUID-namen.

Export neemt metadata en onveranderlijke mediafilenames samen over, leest de originele bytes en valideert het eigen uitvoerformaat. Opslaan schrijft eerst een uniek tijdelijk bestand in de gekozen map en vervangt de bestemming pas na volledig schrijven. Annuleren wijzigt de bron niet. Import gebruikt de bestaande validatie en rollback van library.save: fragmenten worden vooraf gevalideerd, nieuwe UUID's toegekend en in dezelfde SQLite-transactie als de oefening opgeslagen; mislukking verwijdert nieuw aangemaakte media. Bron-/fragment-ID's, paden, sessies en historie zijn geen deel van het formaat. BPM-precisie blijft behouden.

Schema 10 voegt nullable credit-JSON toe met naam/boodschap; ontbrekend is null. De makervermelding wordt gevalideerd en bij normale metadatawijzigingen behouden. Oude sessiemomentopnamen worden niet herschreven. Een makervermelding is vrije tekst, geen cryptografische ondertekening. Exportaanpassingen aan die vermelding gelden alleen voor het uitgevoerde bestand.

## Lokalisatie — issue #6, v0.0.25

`electron/i18n.mjs` deelt een kleine dependencyvrije vertaalfunctie tussen renderer en main; `translations.mjs` bevat het volledige Engelse catalogus met Nederlandse bronzinnen als stabiele sleutels. Parameters worden in één stap ingevuld, waardoor inhoud zoals een eigen naam met {0} of HTML-tekens letterlijk blijft. Alleen expliciete appteksten gaan door de vertaler; geen DOM-vertaling of verwerking van gebruikersvelden.

De root abonneert zich op de actieve taal met useSyncExternalStore en rendert bestaande componenten opnieuw zonder remount. Modulebrede labeltabellen gebruiken getters zodat ze geen opstarttaal vastzetten. De HTML-lang en kalenderpresentatie volgen de keuze; dag-/sessieberekeningen en opslag blijven gelijk. Tablatuurtitel volgt de taal in een afzonderlijk effect dat afbeelding en zoom niet opnieuw instelt.

Main leest `preferences.json` (versie 1, taal nl/en) in userData, met fallback op systeemtaal. Expliciete Chromium --lang wordt ook gevolgd, zodat browser-/testtaal reproduceerbaar is. Valideren, schrijven naar uniek tijdelijk bestand en rename maken de voorkeur atomair; writes staan in een wachtrij. Pas na geslaagde opslag veranderen main/renderer en appmenu. Geen SQLite-migratie en geen taaldata in exportbestanden.

Beperkte language:get/set-IPC blijft onder de bestaande hoofdframe-autorisatie. Het tablatuurvenster heeft alleen een eigen geautoriseerde taal-getter en change-listener. Main publiceert taalwijzigingen naar de twee eigen vensters; de viewer krijgt geen instel-/bestandsrechten. App-specifieke menu- en dialoogteksten gebruiken dezelfde catalogus.

LocalizedError bewaart een sleutel/parameters naast het normale Error-bericht. De IPC-wrapper codeert die uitsluitend bij fouten; rendererformattering kiest de actuele taal. Lokale status-/foutmeldingen worden eveneens als sleutel/parameters bewaard. Daardoor wisselt ook een al zichtbare melding mee. De wrapper verandert de bestaande autorisatie en datavalidatie niet. Engine-/workerberichten veranderen alleen in presentatie, niet in audioplanning. Externe OS-fouten behouden hun oorspronkelijke tekst.

## Infovenster — issue #17, v0.0.26

AboutDialog gebruikt een native HTML-dialog in de bestaande renderer en krijgt de reeds opgehaalde appversie als prop. Geen nieuwe IPC, BrowserWindow, afhankelijkheid, opslag of navigatieroute. De inhoud bestaat uit expliciete sleutels in de bestaande NL/EN-catalogus. showModal houdt de achtergrond niet-bedienbaar; het wijzigt de active-prop of componentidentiteit van de speler niet. Toetsevents uit het venster propageren niet naar de speler; standaard Escape blijft werken. Sluiten herstelt de openerfocus. CSS begrenst hoogte/breedte en maakt de inhoud scrollbaar.


## Eerste release — 1.0.0-rc.1 (#8 gedeeltelijk)

electron-builder maakt macOS arm64 DMG/ZIP en Windows x64 ZIP. De configuratie bevat tevens een per-user NSIS-installer met bewaarde appdata bij deïnstallatie; die is nog niet succesvol gebouwd of getest. Op deze arm64-Mac faalt het Intel-NSIS-hulpprogramma zonder Rosetta. Bouw Windows ZIP afzonderlijk met `pnpm exec electron-builder --win zip --x64 --publish never`; bouw de installer later op Windows. `--publish never` voorkomt publiceren als bouwneveneffect. Publicatie is voor deze uitgave handmatig en expliciet door de gebruiker gevraagd.

De bestaande appId/productName en userData blijven gelijk. Alleen dist/electron/package.json/appicoon en de expliciete runtimeafhankelijkheden gaan in app.asar; public/licenses gaat als extraResources mee. Geen persoonlijke bibliotheek. THIRD-PARTY-NOTICES bevat de meldingen voor gebundelde rendererafhankelijkheden; Electron/Chromium leveren hun eigen runtimevermeldingen. SHA-256 wordt na het bouwen over de definitieve downloadbestanden berekend met scripts/release-checksums.mjs. Geen updater of nieuw opslagformaat. Zie docs/RELEASE.md.

### Windows-herstel — 1.0.0-rc.2

Op Windows kan `enter-full-screen` worden verstuurd voordat `isFullScreen()` de nieuwe waarde teruggeeft. De notation-state gebruikt daarom expliciet true/false uit de enter-/leave-events en verhoogt bij iedere publicatie het versienummer. `notation:state` retourneert dezelfde gepubliceerde momentopname; een getter verandert geen velden buiten het versieprotocol. Sluiten reset fullscreen naar false. Hierdoor ontvangen knoplabel en Escape dezelfde toestand. Geen nieuwe IPC-rechten, schema- of audiowijziging. De desktopregressie controleert zowel knopstatus als de native vensterstatus, Escape, F en opnieuw omschakelen met de knop. Zie docs/RC2-WINDOWS.md voor platformbewijs en open Mac-regressie.


## Interfaceplaatsing — issue #21

LanguagePicker wordt alleen door SettingsScreen gerenderd; de compacte variant en headerwrapper vervallen. Dezelfde preference-/IPC-route blijft behouden. LibraryScreen plaatst de bestaande verwijderactie in de import-/toevoegtoolbar, met blokkering zonder selectie en tijdens formulierinvoer/verwijderen. De bestaande dialog en deleteExercise-validatie blijven gelijk. Alleen presentatiewijzigingen, geen schema-/audio-/vensterwijziging.


## Definitieve distributie — 1.0.0

Versie 1.0.0 bevat Windows-RC2 en #21, met dezelfde appId/productName en schema 10. Mac arm64 DMG/ZIP via lokale electron-builder; Windows x64 NSIS/ZIP via native Windows-runner. Per-user NSIS bewaart appdata bij deïnstallatie. De gepinde Windows-workflow draait met contents:read en publiceert alleen via een aparte contents:write-draft-job op de expliciete releasebranch; PR's hebben geen release-publicatierechten. Geen signing-secret, notariseringsaccount, updater, nieuwe dependency of runtime-cloud. SHA-256-script verwacht voortaan ook de Windows-EXE. De definitieve GitHub-publicatie combineert de geteste platformassets bij exact dezelfde bronversie. Volledige Mac/tag-automatisering blijft open; zie docs/RELEASE.md.


## Evaluatie zonder notitie-invoer — #28

SessionReview/SessionPlayer verwijderen de notitie-state en invoer. De bestaande reviewSession-route ontvangt note als lege string; schema 10, validatie en historische notities blijven intact. Geen migratie of nieuwe IPC.


## Dashboard Release 1.1.0 — #27

buildDashboard behoudt historische contextgroepering en voegt exerciseId, per-oefeningfrequentie en periode year toe. Frequency dedupliceert de bronidentiteit binnen elke sessie met werkelijk gespeelde tijd. buildActivity aggregeert los van het periodefilter 30 kalenderdagen met offsets; alle kalenderberekeningen gebruiken de bestaande lokale startdag plus UTC-middag voor datumrekenen (DST-veilig). Jaargrens gebruikt twaalf kalendermaanden met schrikkeldagbegrenzing.

SessionHistory laadt uitsluitend historische sessies; gedetailleerde resultaatweergave vervalt. ProgressDashboard gebruikt eigen SVG-lijn-/staafdiagrammen, gedeelde checkboxstate en een aparte dagoffset. Geen chartdependency, IPC, schema- of audiowijziging. Punten blijven per context gescheiden en behouden bronprecisie; alleen BPM-presentatie rondt af. Catalogus bevat expliciete NL/EN-sleutels; eigen namen blijven gewone tekst. Wijzigingen in bestaande UI-regressies volgen het vervallen dashboard, terwijl BPM-precisie, metronoomcontext, evaluatiebewaring en taalwissel beschermd blijven.
