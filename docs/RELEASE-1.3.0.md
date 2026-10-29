# Release 1.3.0 — in uitvoering

Milestone 4, gestart 29 oktober 2026, uitsluitend #50–#53. Volledige regressie op vaste bron volgt na issues; één menselijke controle met ontwikkelapp vóór installers. Nog geen release/tag/installers.

## #51 analyse en controle

Hernoemen wijzigt de identiteit niet. Codeonderzoek vindt een concrete kwetsbaarheid: AudioEngine.loadBuffer kon een volgende worklet verbinden zonder de vorige te ontkoppelen; dispose tijdens asynchroon laden kon eigenaarschap verwarren. Bufferwissels worden geserialiseerd en oude/annuleerde nodes ontkoppeld, review/complete pauzeert expliciet. Geen persoonlijke opname onderzocht, dus geen bewezen oorzaak op die opname. Risico: audio-overgangen, pauze/einde/loop. Gerichte DSP-controle van buffervervanging plus sessie/audio-overgangen; geen nieuwe schema/dependency. Build/typecheck geslaagd. Audio-controls en DSP-probe geslaagd, inclusief echte uitvoermeting na vervangen van een spelende loop door stilte (geen oude bron hoorbaar). Sessietests worden afgerond. Sandboxstart van Electron faalde; dezelfde geïsoleerde tests draaien buiten de sandbox. DESIGN.md gecontroleerd: geen visuele wijziging voor #51.
