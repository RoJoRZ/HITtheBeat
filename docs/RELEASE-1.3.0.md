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
