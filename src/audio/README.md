# Audio

`stretch.ts` laadt de lokale Signalsmith-worklet. `engine.ts` beheert decodering, audioklok, onafhankelijk tempo/toonhoogte, A/B-loop en opruimen. Het audiobereik is 25–300%. `metronome.ts` biedt dezelfde gebruikte transportbediening voor metronoom-oefeningen zonder bestand: maatsoort, kwartnoot-BPM en eindige klikplanning op de audioklok. Beide gebruiken het gedeelde volume; `output-volume.ts` bewaart volume/mute lokaal.

De spelers sturen commando's via knoppen en toetsen; `src/session/runner.ts` bepaalt herhalingen en overgangen. `bpm.ts`/Worker analyseren geïmporteerde audio; `normalization.ts` bepaalt de afzonderlijke niveaucorrectie. Zie `TECHNISCH-ONTWERP.md` en `docs/METRONOOM.md` voor huidige werking en beperkingen. Historische audioproeven staan in docs/FASE-1.md en FASE-2.md; de voorbeeldschermen zijn sinds v0.0.12 verwijderd.

`count-in.ts` plant een herkenbaar andere aftelmaat in dezelfde AudioContext als de muziek; `click.ts` deelt alleen de oscillator/envelope-aanmaak. De runner stuurt de countin-fase; oefentijd en voorbereiding blijven gescheiden. Zie docs/AFTELMAAT.md.
