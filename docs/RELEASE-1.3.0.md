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
