# Normalisatie en volumeregeling — v0.0.8

Deze aanvulling is op verzoek toegevoegd na het gebruik van fase 6, vóór het dashboard van fase 7.

## Proberen

1. Voeg een nieuwe MP3 toe. Geluidsniveau normaliseren staat aan. Na de analyse staat de gemeten dB-correctie bij het formulier. Een ontbrekende BPM-schatting verhindert normalisatie niet; vul het BPM zo nodig zelf in.
2. Sla de oefening op. Het niveau wordt bij het afspelen gecorrigeerd, in zowel de losse speler als een rondje. Het originele MP3-bestand is niet opnieuw gecodeerd of veranderd.
3. Voor een bestaande oefening: Bewerken → Volume normaliseren → Oefening opslaan. Dit meet ook het BPM opnieuw, maar behoudt het handmatig ingestelde originele BPM.
4. Schakel Geluidsniveau normaliseren uit als je het oorspronkelijke niveau wilt gebruiken. Bewaar de wijziging. De gemeten correctie blijft beschikbaar voor opnieuw inschakelen.
5. Gebruik de volumeschuif onder de afspeelbediening. Verander het volume tijdens afspelen, pauzeren en vrije fragmenttraining.
6. Kies dempen. De audio wordt stil, terwijl de speler zijn positie behoudt. Dempen opheffen herstelt het gekozen volume; de schuif bewegen heft dempen eveneens op.
7. Wissel naar een volgende oefening of sluit en open de app. Het gekozen volume en dempen blijven behouden.

## Werking en grenzen

Normalisatie gebruikt een vaste correctie per MP3, ook als het rondje verschillende fragmenten daarvan speelt. De muzikale dynamiek binnen de MP3 blijft dus behouden. Het is praktische niveaumatching: klankkleur, dynamiek en pieken kunnen hoorbare verschillen laten bestaan. De correctie wordt begrensd bij pieken en sterke versterking; stilte en vrijwel onhoorbare audio worden niet versterkt.

De volumeschuif regelt het appvolume van 0–100%, onafhankelijk van systeemvolume, normalisatie, tempo en toonhoogte. Normalisatie wordt vóór de tempo-/toonhoogtebewerking toegepast; het gebruikersvolume staat erna. De bestaande audioklokgate blijft bij B de audio stoppen, ook als tijdens afspelen het volume verandert.

De migratie naar schema 4 behoudt oefeningen, rondjes, sessies en originele media. Oude oefeningen blijven op hun oorspronkelijke niveau totdat ze worden geanalyseerd en bewaard. Volume en dempen staan als lokale voorkeur op deze computer, niet als wijziging aan een oefenrondje.

## Controles

- 31 Node-tests geslaagd, inclusief matching van zachte/luide audio, stereo zonder fase-uitdoving, stilte, begrensde versterking/pieken, ongeldige samples en gain, bewaren van normalisatie en behoud van originele bytes.
- Een migratieproef vanaf schema 3 bevestigt behoud van de bibliotheek, rondjes en sessiehistorie, zonder ongemerkte niveauaanpassing van oude audio.
- De echte audio-uitvoer is gemeten: genormaliseerde zachte en luide testsignalen komen op hetzelfde niveau uit, 50% geeft ongeveer halve amplitude, dempen geeft stilte, opheffen herstelt het niveau en volume aanpassen wist de stop bij fragmentpunt B niet. Ook een versnelde loop met aangepaste toonhoogte blijft bedienbaar en te dempen.
- De bestaande controles voor audio/DSP, ontwikkeling, bibliotheek, rondjes, evaluaties, sessiehistorie en ontbrekende media zijn geslaagd.

- De volledige nieuwe desktoproute is geslaagd: zachte en luide MP3 importeren, een bestaande meting uitschakelen en opnieuw activeren, volume/dempen tussen losse speler en rondje behouden, vrije training, volgende oefening en opnieuw openen. De MP3’s met een amplitudeverschil van 20 dB krijgen overeenkomstige tegengestelde niveaucorrecties.

## Pakketcontrole

Het Mac-pakket is gecontroleerd met 10 geslaagde desktoptests. De 2 controles die bronmodules gebruiken (DSP en ontwikkelserver) zijn afzonderlijk uitgevoerd. Een aanvullende audio-uitgangsmeting bevestigt dat een nieuw geladen, gedempte speler vanaf het begin stil is. Na deze laatste aanscherping zijn de twee relevante pakketcontroles voor afspelen en de volledige normalisatie-/volumeroute opnieuw geslaagd.

[Schermafbeelding van de speler met volumeregeling](screenshots/volume-speler.png)


Het definitieve Windows x64-pakket is eveneens gebouwd. Het is nog niet op Windows uitgevoerd of beluisterd.
