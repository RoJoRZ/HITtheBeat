# Release 1.3.0 — in uitvoering

Milestone 4, gestart 29 oktober 2026, uitsluitend #50–#53. Volledige regressie op vaste bron volgt na issues; één menselijke controle met ontwikkelapp vóór installers. Nog geen release/tag/installers.

## #51 analyse en controle

Hernoemen wijzigt de identiteit niet. Codeonderzoek vindt een concrete kwetsbaarheid: AudioEngine.loadBuffer kon een volgende worklet verbinden zonder de vorige te ontkoppelen; dispose tijdens asynchroon laden kon eigenaarschap verwarren. Bufferwissels worden geserialiseerd en oude/annuleerde nodes ontkoppeld, review/complete pauzeert expliciet. Geen persoonlijke opname onderzocht, dus geen bewezen oorzaak op die opname. Risico: audio-overgangen, pauze/einde/loop. Gerichte DSP-controle van buffervervanging plus sessie/audio-overgangen; geen nieuwe schema/dependency. Build/typecheck geslaagd. Audio-controls en DSP-probe geslaagd, inclusief echte uitvoermeting na vervangen van een spelende loop door stilte (geen oude bron hoorbaar). Sessietests worden afgerond. Sandboxstart van Electron faalde; dezelfde geïsoleerde tests draaien buiten de sandbox. DESIGN.md gecontroleerd: geen visuele wijziging voor #51.


## #50 analyse en controle

Geraakt: oefeningformulier/opslag/export en gedeelde waveform. Schema 11, nullable offset met compatibele defaults; oudere migratiefixtures volgen het werkelijke oude schema en verwijderen ook de nieuwe kolom. Geen herschrijven van snapshots/grenzen. Build/typecheck en 41 gerichte Node-controles geslaagd (raster, opslag/migraties, delen, taal, bestaande metronoom/aftel-/sessiecompatibiliteit). Vier gerichte UI-tests geslaagd (23s): beide spelers gebruiken dezelfde opgeslagen offset, vrij selecteren blijft beschikbaar, normale en pointerterugvalroute blijven werken en offline delen slaagt. Zelfreview: bronprecisie, offsetvalidatie, media-URL cleanup en oude snapshots gecontroleerd; geen onafhankelijke menselijke review. #51: alle 4 audio-/sessietests geslaagd, PR #54 samengevoegd. Oorzaak op eigen opname blijft onbevestigd.


## #53 analyse en controle

Geraakt: runner, transport, sessieresultaten en actieve oefening. Risico: tijd dubbel tellen, ongespeelde passes, oude audio na sprong. Gerichte runner-/sessievalidatie en UI-test voor ready/spelen/pauze, vooruit/terug, evaluatie en tellers. Geen schema/dependency. Build/typecheck, 15 gerichte Node-tests en drie sessie-UI-tests geslaagd (29s). Zelfreview controleert tijdmeting vóór sprong, pending/skipped-status en expliciet weggooien evaluatiedraft. #50 is samengevoegd via PR #55 na 41 Node- en vier desktopcontroles; oorspronkelijke grenzen/historie blijven behouden.


## #52 analyse en controle

Geraakt: evaluatie, audio-engine en JSON-resultaatvalidatie. Risico: track toch hoorbaar, verkeerde duur/BPM, klikken na pauze, verouderde callback registreert verkeerde klank, overschrijven historie/opbouw. Optionele audioModes/sound-velden behouden oude data; schema blijft 11. Gerichte Node-tests op validatie/reopen en lokale keuzes; echte uitvoermeting controleert twee kwarttellen op 60 BPM (2 seconden), stilte tussen klikken, terugkeer naar audio en pauze. UI controleert per-stapkeuze vanaf herhalen, andere stap audio, bewaarde historie en nieuwe sessie met audio. Bestaande evaluatie/navigatie-/taaltests worden alleen aangepast om het nieuwe eerste menu expliciet te bedienen; inhoudelijke garanties blijven staan. Build/typecheck, 10 gerichte Node-controles (sessies/taal) en 11 desktopcontroles geslaagd. Echte klikmetingen: 0,0053s en 1,0027s, tussen/na afloop/pauze stilte 0, bron-eindpositie exact 1,2s bij rate 0,5; herstelde audio piek 0,300. Zelfreview op actual-engine klankregistratie, oude JSON-compatibiliteit, audiogate vóór asynchroon plannen en per-blokkeuzes. Geen onafhankelijke menselijke review; die volgt als release-eindcontrole. #53 is samengevoegd via PR #56 na 15 Node- en drie desktopcontroles.


## Releasegroep en eindcontrole

Alle geselecteerde issues samengevoegd via #54–#57. Voorgestelde versie 1.3.0. Geen nieuwe dependency, schema 11 met compatibele nullable eerste-telinstelling. De volledige groep draait uitsluitend op de vaste releasebron, native Mac en Windows, inclusief alle Node- en desktop/audio-tests. Geen extra volledige lokale reeks naast deze native groep. Gerichte tests gebruiken geïsoleerde data. Uitvoermetingen bewaken timing/grenzen, maar zijn geen muzikale luisteracceptatie.

| Functie/risico | Gerichte issuegroep | Volledige releasegroep |
| --- | --- | --- |
| Dubbele bron/overgangen #51 | audio-controls, DSP inclusief buffervervanging, sessies (4 desktop) | alle audio-, volume-, aftel-, sessietests op Mac/Windows |
| Beat-raster #50 | 41 Node (opslag/migratie/delen/raster/taal), 4 UI (pointer beide routes/beide spelers/delen) | alle opslag-/deel-/waveform-/bibliotheektests op Mac/Windows |
| Navigatie #53 | 15 Node, 3 sessie-UI | alle runner/sessie/tablatuur/afteltests op Mac/Windows |
| Audio/metronoom #52 | 10 Node, 11 desktop (eval/taal/sessie/klank met uitvoermeting) | alle evaluatie-/resultaat-/audio-/UI-tests op Mac/Windows |

Behoud van eerdere regressies: geen test verwijderd. Migratiefixtures zijn bijgewerkt om echte oudere schema's te simuleren; evaluatietests openen nu expliciet het goedgekeurde beginmenu. Nieuwe tests beschermen daadwerkelijke audio-uitvoer, gegevenscompatibiliteit en tijd-/procesovergangen. Bekende beperking: oorzaak van de gemelde dubbele arpeggio op persoonlijke opname niet bewezen. Eerste tel/BPM-raster is handmatig instelbaar, geen automatische beatdetectie bij variabel tempo. Native installer-/pakkettests volgen pas na gebruikersakkoord; geen signing/notariseringsclaim.

Ontwikkelapp wordt opgebouwd als appdirectory (geen release-installer) in release/review-1.3.0/mac-arm64/HITtheBeat.app. Menselijke controle: eerste tel opslaan/bewerken en snappen; eigen arpeggiosessie beluisteren; vooruit/terug springen met spelen/pauze; tijdens evaluatie per stap Audio/Alleen metronoom en herhalen. Persoonlijke bestanden worden niet vooraf aangepast. Exacte bron/run/resultaten volgen vóór verzoek om akkoord.


## Curatie na native controles — 29 oktober 2026

Volledige run 40916248123 op d291b54 slaagt native Mac en Windows: elk 129 Node- en 38 desktop-/audiotests. Bij aanvullende administratieve controle blijkt de eerdere gerichte #52-Mac-run 40915988061 twee timingfouten te hebben: de sessieassertie geeft 6s voor circa 5,35s audio plus overgangen en kan onder runnerbelasting verlopen; de nieuwe klikprobe bemonstert via JS-timers en kan een klik van 35ms missen. Beide slagen in de volledige groep, maar de meetbescherming wordt expliciet verbeterd. Geen productfout vastgesteld en geen test verwijderd.

De sessie-eindassertie krijgt 12s voor dezelfde inhoudelijke toestand. De klikprobe registreert alle audiosamples op de renderthread in een test-only worklet: klikaantal/timing en stilte tussen/na klikken blijven vereist; pauze controleert nu de volledige resterende opname op achterblijvende klikken, niet één laat moment. De gerichte CI-selector neemt de nieuwe klanktest voortaan ook mee bij audio- en evaluatiewijzigingen. Dit is uitsluitend testonderhoud. Productcode/ontwikkelapp blijven gelijk. Gerichte hercontrole en daarna volledige native groep op de definitieve testbron volgen vóór menselijke eindcontrole. De reeds wachtende oude gate wordt niet goedgekeurd.

Gerichte hercontrole: vijf sessie-/klankdesktoptests geslaagd (46s), vijf CI-selectorcontroles geslaagd. Renderthreadmeting registreert klikken op 0,000125 en 1,000125 seconden, volledige stilte tussen klikken en na pauze/einde, herstelde audio piek 0,300. Productcode en packageversie ongewijzigd; bestaande ontwikkelapp blijft geldig.


## Correctie toepassingsmoment #52 vóór eindcontrole

De gebruiker zegt ‘vanaf de volgende herhaling van de oefensessie, zoals snelheid’. De eerste implementatie koppelde klank ten onrechte uitsluitend aan de lopende sessie. Hersteld: per stap bewaren in de sessie-opbouw voor de volgende uitvoering, met dezelfde monotone versie-/conflictcontrole en transactie als BPM. Huidige snapshot, historie en overige blokken blijven gelijk. Schema 12 voegt nullable routine_steps.audio_mode toe, legacy default audio; beide migratielagen en oude fixtures blijven getest. De editor behoudt de keuze bij metadata-/stapwijzigingen, toont Alleen metronoom en reset haar bij vervangen van de oefening. Keuze is via volgende evaluatie terug te zetten. FUNCTIONEEL/TECHNISCH/DESIGN en issuecriteria zijn gecorrigeerd.

Build/typecheck en 44 gerichte Node-controles geslaagd (opslag/migraties, schema 11→12, opbouw, sessies, conflicten, delen, taal). Vijf gerichte desktopcontroles geslaagd (54,6s): huidige herhaling blijft audio, volgende sessie neemt metronoom over, ander stap behoudt audio; bestaande evaluatie-/editorroutes en renderthreadmeting behouden. Zelfreview op toepassingsmoment, conflictrollback, herstellen audio en immutable snapshots. Geen onafhankelijke menselijke review. Productwijziging vereist nieuwe native volledige regressie en opnieuw opgebouwde ontwikkelapp; nog geen menselijk eindakkoord of installers.

De automatische goedkeuringscontrole heeft alleen het heropenen van #52 geweigerd wegens volgens haar ontbrekende expliciete statusautorisatie. De gesloten issuestatus is daarom behouden; de aanvullende correctie blijft via een PR met Refs #52 herleidbaar. Geen omweg gebruikt om de afgewezen statuswijziging uit te voeren.


## Windows-hercontrole na #52-toepassingscorrectie

Run 40921291027 op 0878094: Mac volledig groen (130 Node/38 desktop), Windows 130 Node en 37/38 desktop. De nieuwe tweede-sessiestarttest verwachtte na 5s muurkloktijd het einde van twee seconden audio. De Windows-foutopname toont de juiste Alleen metronoom-stap nog spelend, circa twee seconden geregistreerd en geen app-/bewaarfout. Dezelfde bron is in de gerichte native Windows-run 40921118281 geslaagd. Vertraagde audiostart/runner-timing is een mogelijke oorzaak; geen bewezen productfout. De meting op de renderthread voor exacte klikafstand/duur slaagt.

De laatste GUI-eindassertie krijgt dezelfde 12s-ruimte als de bestaande sessietest, met behoud van de vereiste fragment-evaluatie. Extra bescherming: werkelijk gespeelde bronduur moet twee seconden zijn en precies één herhaling afgerond; bij fout wordt de sessiecheckpoint gelogd. Geen productcodewijziging of verwijderd criterium. Gerichte hercontrole en daarna definitieve native releasegroep volgen; app op 0878094 blijft product-identiek. De mislukte releasecontrole heeft installer-/publicatiejobs overgeslagen.

Gerichte hercontrole geslaagd: beide klanktests (18,2s), tweede sessie-einde waargenomen na 2371ms met twee seconden gespeelde tijd en één afgeronde herhaling. Exacte renderthread-klikken blijven 0,000125 en 1,000125s, stilte tussen klikken en na pauze/einde blijft nul. Appbron 0878094 en packageversie blijven ongewijzigd.


## Definitieve bron voor eindcontrole — 29 oktober 2026

Vaste bron `430ac0863dabd51899fd77d42e5c925ba940ce1d`, versie 1.3.0, schema 12. [Run 40923261862](https://github.com/RoJoRZ/HITtheBeat/actions/runs/40923261862). Windows: 130 Node- en 38 desktop-/audiotests geslaagd, build/typecheck geslaagd; tweede sessie-einde na 2388ms. Mac: 130 Node- en 38 desktop-/audiotests geslaagd, build/typecheck geslaagd. Beide native groepen zijn groen; release-approval wacht. Daarmee is milestone 4 gereed voor de ene expliciete menselijke eindcontrole. Nog geen eindakkoord, tag, nieuwe installers of publicatie; milestone blijft open.

Ontwikkelapp release/review-1.3.0/mac-arm64/HITtheBeat.app is gebouwd op 0878094 en bevat identieke productbestanden/packageversie aan deze definitieve testbron (verschil uitsluitend tests/verslag). Ad-hoc handtekening strikt geverifieerd; geïsoleerde controle op offline starten, brug/sandbox en herstart geslaagd (9,9s). SHA-256 app.asar: `846db3837083ad1242515ae69691a62ab17412de2eba1b4f5dc247eebcfca84a`. Geen extra appbuild voor uitsluitend testonderhoud.

Start voor menselijke controle via release/review-1.3.0/Start HITtheBeat 1.3.0.command. Die kiest expliciet een aparte user-data-map met consistente lokale SQLite-backup, mediakopie en taal/dashboardvoorkeuren; integriteitscontrole geslaagd. De gewone bibliotheek is niet gewijzigd en wijzigingen in de reviewkopie worden niet teruggeschreven. Sluit de gewone app eerst om twee tegelijk spelende apps te voorkomen. Deze handmatige reviewkopie wordt niet gebruikt voor automatische tests; die blijven tijdelijke geïsoleerde fixtures gebruiken. De kopie en ontwikkelapp staan onder de bestaande genegeerde release/-map en worden niet naar GitHub gecommit/geüpload.

Controlepunten: (1) Eerste tel via Oefening bewerken en vastklikken/vrij selecteren in beide spelers; (2) de eigen arpeggiosessie op dubbele audio beluisteren; (3) oefenblokken vooruit/terug aanklikken bij spelen/pauze; (4) Audio/metronoom per stap bewaren en de oefensessie opnieuw starten, met behoud van de huidige momentopname en overige stappen. #51 blijft een defensieve reparatie: precieze oorzaak op de gebruikersopname niet bewezen. Beatraster veronderstelt constant gekozen BPM en handmatig ingestelde telpositie. Muzikale luisteracceptatie en daadwerkelijke Windows-gebruikstest van nieuwe functies worden niet uit de geautomatiseerde controles afgeleid.

## Eindcontrole afgewezen voor #51 — 30 oktober 2026

Gebruiker meldt overige functies akkoord, maar #51 treedt nog op bij diverse oefeningen, ook bij sessiestart; een extra bron reageert niet op Pauzeren. Issue heropend. Nog geen releaseakkoord; geen installerbuilds/publicatie. De GitHub-opmerking van 29 oktober kon door een gebruikslimiet van automatische goedkeuringscontrole niet worden geplaatst; de nieuwe concrete bevinding is op 30 oktober wel geregistreerd.

Diagnose uitsluitend lokaal met een extra bibliotheekkopie. Geen persoonlijke media/data in Git of GitHub. De gebruikersreproductie toont na bibliotheekwissel twee actieve AudioContexts: oude AudioLab naast huidige sessie. Spatie stuurt beide aan; de sessieknop pauzeert alleen de laatste. Oude bron blijft tot het natuurlijke einde klinken. Oorzaak in LibraryScreen.Detail: AudioLab en FragmentLibrary hadden dezelfde siblingkey `item.id`, waardoor React bij wisselen een oude speler/toetsenhandler kon laten bestaan. Verschillende prefixen herstellen de bestaande lifecyclecleanup; geen wijziging aan AudioEngine, gegevens of ontwerp nodig. DESIGN.md gecontroleerd: geen visuele wijziging.

Nieuwe geïsoleerde Electron-test `audio-ownership.spec.ts` gebruikt synthetische MP3 en tijdelijke data. Vóór reparatie aantoonbaar rood: twee open contexten na A→B, verwacht één. Na reparatie groen: één zichtbare speler, oude context gesloten bij wisselen/verlaten en geen oude speler bij toetsenstart/pauze van een sessie. Geraakt risico: lifecycle van bibliotheekspeler en fragmentbeheer; passende aanvullende suites audio/fragments plus build/typecheck. Zelfreview is geen onafhankelijke menselijke review. Eerdere native release-regressie blijft historisch bewijs; gewijzigde bron moet opnieuw worden gevalideerd vóór vernieuwde eindcontrole.

Gerichte lokale controles na reparatie: build/typecheck geslaagd; vier Electron-/audiotests geslaagd (54,6s): audio-eigenaarschap, audiobediening, DSP en benoemde fragmenten. De eigenaarschapstest duurde 5,9s; vóór de fix faalde dezelfde test met twee contexten. Testdata volledig tijdelijk/synthetisch. Zelfreview: unieke keys verschillen per componenttype én oefenidentiteit; bestaande cleanup/keyboard-unsubscribe worden weer aangeroepen. Geen productwijzigingen buiten deze keycorrectie. Native Windowscontrole en vernieuwde release-regressie staan nog open.

PR #63 is samengevoegd na groene native issue-CI op Mac en Windows: run 41023915803. Nieuwe vaste releasebron `5156ea160ba32d459bdcd9fa576e86c05c6a6e18`. De oude wachtende run 40923261862 is geannuleerd zonder installerjobs. Nieuwe volledige native regressie: [run 41024333034](https://github.com/RoJoRZ/HITtheBeat/actions/runs/41024333034); geen gate namens gebruiker goedgekeurd.

Nieuwe Mac-ontwikkelapp: `release/review-1.3.0-fix51/mac-arm64/HITtheBeat.app`, gebouwd op PR-bron `629fe982429b8fcf77e82f4e27dc8de160fd874e`, product-identiek aan mergebron 5156ea1. Ad-hoc handtekening strikt/deep geverifieerd. De ownership-regressie slaagt ook tegen deze gebouwde app (13,7s; tijdelijke synthetische data). SHA-256 app.asar `2802ef01bb1a84654078da62ba75eb7ae619058718cf4c077a3ab38559d50bdb`. Beide lokale startcommandobestanden verwijzen nu naar deze app en behouden de bestaande aparte reviewbibliotheek; geen persoonlijke resultaten automatisch verwijderd. Geen installerbuild.

### Gerepareerde bron gereed voor hernieuwde eindcontrole — 30 oktober 2026

Run 41024333034 op vaste bron `5156ea160ba32d459bdcd9fa576e86c05c6a6e18` is native Mac én Windows groen: elk 130 Node- en 39 desktop-/audiotests, build/typecheck geslaagd. De nieuwe ownership-regressie is onderdeel van beide volledige groepen. Gate `release-approval` (job 123961220310) wacht; geen installerjobs/tag/publicatie. #51 blijft open tot gebruikersbevestiging van de reparatie. Overige functies waren bij de eerdere eindcontrole akkoord. Vernieuwde controle concentreert zich op bibliotheek A→B, afspelen, verlaten naar sessie, Spatie-start en knop-pauze zonder bijkomende bron, plus de gemelde Arpeggios-sprong. Gewijzigde productbron vraagt expliciet nieuw akkoord vóór installerbuilds; dit is nog niet ontvangen. Native tests zijn geen gebruikers-/luisteracceptatie.

## Geautoriseerde uitbreiding #65/#66 — 30 oktober 2026

Gebruiker start beide issues in deze nog niet gepubliceerde release, met expliciet behoud van #51. Milestone 4 nu #50–#53 plus #65/#66. Eerdere gate op 5156ea1 blijft niet bruikbaar voor de gewijzigde productbron. #65 verwijdert waveform-panmodus en previewknop/callbacks; bestaande navigatieschuif/pijlen, selectie en transport blijven. Risico pointer-/audio-overgangen, geen data/schemawijziging. Build/typecheck en zes gerichte Node-tests (taal/waveform) geslaagd. Ownershiptest groen. Pointertest verstuurde in één route te vroeg een gebaar tijdens aria-disabled; test wacht nu expliciet op bewerkbare markering, zonder selectieasserties weg te laten. Ontwerpen bijgewerkt; #66 blijft als geautoriseerd/in uitvoering onderscheiden.
#65 gerichte Electron-verificatie: drie waveformtests groen (22,1s), inclusief beide pointerroutes, scroll/pijlen zonder selectiewijziging, bronselectie en bestaande telinstelling in beide spelers; ownershiptest afzonderlijk groen. Zes Node-tests groen. Zelfreview: geen verwijderde kernfunctionaliteit of data, previewverwijzingen uitsluitend in waveformroute verwijderd; evaluatiepreview blijft. Geen onafhankelijke menselijke review.

## #66 analyse, implementatie en gerichte controles

Hergebruikt BPM/beatOffset en lokale renderer-audio; geen schema, dependency, preload of cloud. Eigen modale audiobron met volledige cleanup, exclusieve Spatie, bronklok/getOutputTimestamp en maximaal 16 tikken. Robuuste gezamenlijke fit van tempo/fase, geen eerste-tikanker; korte reeksen, onvoldoende/onstabiele tikken, uitbijters en drift getest. Consistentie-RMS-norm 5% (15–40 ms) is een voorlopige productnorm, geen werkelijke BPM-nauwkeurigheid. Hoorbare controle en handmatige correctie blijven beschikbaar.

Opslag blijft expliciet twee stappen (Overnemen → Oefening opslaan). NumberField behoudt interne meetprecisie zonder ongeldige native step; een vroege UI-test vond dat probleem en het is gericht hersteld. Opslagtest gebruikt echte geldige UUIDs; meetstatus heeft eigen toegankelijk label om formulier-/volume-statussen niet te verwarren. Geen asserties verwijderd. Kalibratiedialoog is tegen geannuleerd asynchroon laden afgeschermd; bron/pulses verdwijnen bij sluiten. Referentievalidatie ook bij BPM-only opslaan, zonder sessiedoeltempi/historie te herschrijven. Defaults en export/import blijven compatibel. #51-prefixkeys en ownershipregressie blijven behouden.

Geselecteerde tests: timingdomein incl. 3/4/16 tikken, eerste uitschieter, gemiste/dubbele tikken, drift en 15/25/40-ms-grenzen; opslag, delen, routines, waveform en taal. Daarnaast modale UI/audio-cleanup, waveformbeidepointerroutes, ownership en bestaande klankkeuze/audioklok. Geen persoonlijke bibliotheek voor automatisering. DESIGN/TECHNISCH/FUNCTIONEEL bijgewerkt; menselijke hoorbare tikbeoordeling volgt bij eindcontrole.
#66 resultaten: build/typecheck groen; 28 gerichte Node-tests groen (558ms), zeven Electron/audio-tests groen (49,0s), inclusief beide waveformpointerroutes, hoorbare klankkeuze/audioklok, ownership en tikdialoog. Na laatste async-cleanupreview bouw plus tikdialoog opnieuw groen (4,5s). Interfacetest controleert onvoldoende/onstabiele tikken, korte reeks, 16-tikkenstop en negeren van extra tik, NL/EN tijdens de meting, preview/Escape, geen opslag bij annuleren/alleen Overnemen, definitieve gezamenlijke opslag en gesloten oude contexten. Opslagtest bewaart precieze BPM/fase over herstart en export/import, ongewijzigde sessiedoeltempo's/fragmenten/historie en afwijzen van ongeldige tempoverhouding. Zelfreview op lifecycle, bronklok, foutpaden, minimale gegevensimpact en #51-behoud; geen onafhankelijke menselijke review. Voorlopige toleranties moeten bij eindcontrole hoorbaar worden beoordeeld; fysieke Windows-/luisteracceptatie niet uit tests afleiden.

## Gezamenlijke releasebron na #65/#66

PR #67/#68 zijn na gerichte checks en zelfreview samengevoegd. Vaste bron `eb4d5e19f8e3eb646fa614926d499277a1d4124b`, versie 1.3.0/schema 12, bevat aantoonbaar de eerdere #51-bron 5156ea1 als voorouder. #65 native issue-CI run 41029912380 groen op Mac en Windows; #66 run 41031473305 loopt. Nieuwe volledige native releasevalidatie: run 41031746818. De wachtende oude run 41024333034 is geannuleerd zonder installerjobs; oude gates zijn niet goedgekeurd.

Ontwikkelapp `release/review-1.3.0-tap/mac-arm64/HITtheBeat.app` is product-identiek aan eb4d5e1 (gebouwd op dezelfde lokale bestanden vóór de fast-forward). Ad-hoc handtekening strikt/deep gecontroleerd. Daadwerkelijk gebouwde app: ownership- en tikdialoogtests groen (16,4s en 8,6s; totaal 26,1s), met geïsoleerde synthetische data. SHA256 app.asar `f2284e4a85353b225c3dc8680f43b19b9ac405c99ac056f0eb8620ce330572a3`. Alle bestaande reviewlaunchers wijzen nu naar deze ontwikkelapp en dezelfde aparte reviewbibliotheek; geen normale bibliotheekwijziging, geen release-installer.

Een lokale reset/switch-opdracht werd door automatische goedkeuringscontrole geweigerd wegens mogelijk verlies van indexstatus. Niet uitgevoerd of omzeild: na inspectie van lege index/eigen wijzigingen zijn die met een gewone commit op de issuebranch bewaard; daarna is schone main alleen fast-forward bijgewerkt. De lokale backupcommit en de via GitHub opgeslagen bron hebben identieke bomen. Geen data of indexinhoud weggegooid.
#66 native issue-CI run 41031473305 is inmiddels op Mac en Windows groen. Geen productwijziging na vaste bron eb4d5e1. Volledige releasegroep loopt afzonderlijk in 41031746818; geen tweede volledige lokale regressie uitgevoerd.

### Eindcontrole nieuwe scope — 30 oktober 2026

Run 41031746818 op vaste bron `eb4d5e19f8e3eb646fa614926d499277a1d4124b` is native Mac/Windows volledig groen: elk 137 Node- en 40 desktop-/audiotests plus build/typecheck. De ownership-/dubbele-audioregressie en tikdialoog zijn onderdeel van beide native groepen. Gate release-approval/job 123985160554 wacht. Geen nieuwe installers/tag/publicatie en geen gate namens gebruiker goedgekeurd.

Controleer de nieuwe ontwikkelapp via `release/review-1.3.0-tap/Start HITtheBeat 1.3.0.command`, na volledig afsluiten van oudere testapps. Zij gebruikt dezelfde aparte reviewbibliotheek. Controlepunten: compacte waveformwerkbalk/overige bediening, default raster0, Bepaal BPM met korte en langere reeksen, onvoldoende/onregelmatig tikken, hoorbare preview en opnieuw tikken, annuleren versus Overnemen plus oefeningopslag; daarna bibliotheekwissel → sessie → Spatie/knop-pauze en Arpeggios-sprong voor #51. Menselijke hoorbare kwaliteit/tiktolerantie en fysieke Windows-gebruikstest blijven expliciet buiten de automatische bewijsvoering. #51 blijft open voor gebruikersbevestiging; #65/#66 gesloten na aantoonbaar afgehandelde criteria. Milestone open tot succesvolle publicatie. Wacht op expliciet eindakkoord op deze gewijzigde bron vóór installers.
