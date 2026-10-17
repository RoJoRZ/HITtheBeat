# Info over HITtheBeat — v0.0.26, issue #17

De gebruiker heeft de taalkeuze goedgekeurd en vraagt vóór distributie om een About/Info-knop met het concept en een overzichtelijke puntsgewijze functiesamenvatting. Functionele afspraken staan in FUNCTIONEEL.md hoofdstuk 34; vormgeving en techniek in DESIGN.md en TECHNISCH-ONTWERP.md.

## Impact en inhoud

Een kleine rendereruitbreiding: AboutDialog, een knop onderaan de zijbalk, bijbehorende stijlen en Engelse catalogusteksten. De bestaande appversie wordt hergebruikt. Geen nieuwe IPC, opslag, afhankelijkheid, native venster, audiomotorwijziging of sessienavigatie. Het native About-menu van het OS blijft de bestaande standaard appinformatie tonen; de gevraagde inhoud staat achter de zichtbare Info-knop.

De concepttekst beschrijft HITtheBeat als persoonlijk oefenmaatje voor een gericht, regelmatig muziekmoment. Negen bullets vatten de gerealiseerde functies samen: bibliotheek/audio/opdracht/tablatuur/volume, tempo en toonhoogte, sessie-opbouw, metronoom/aftellen, fragmentfocus, evaluaties, voortgang, delen met makerherkenning en lokale taal-/toetsenbediening. Open voorstellen zoals toonhoogte per geplande sessiestap worden niet als beschikbare functies gepresenteerd. De detector wordt als schatting benoemd.

Risico's zijn onbedoelde navigatie/pauze, sneltoetsen die de achtergrond bedienen, verloren invoer en onleesbare lange tekst. Daarom blijft de bestaande componentboom actief, begrenst showModal de focus, stoppen toetsevents bij het infovenster en kan de inhoud verticaal scrollen. Sluiten en Escape herstellen de openerfocus. De inhoud volgt de huidige NL/EN-keuze en toont de actuele versie, zonder opgeslagen gebruikersinhoud te wijzigen.

## Controles

- `pnpm build` geslaagd: beide TypeScript-configuraties en productiefrontend.
- `pnpm test`: 103/103 geslaagd, inclusief catalogus-/placeholder- en JSX-controle, opslag/migraties en bestaande domeintests.
- Gerichte Electron-reeks: 7/7 geslaagd (2 nieuwe infoscenario's, 4 taaltests en hoofdvenster/offline heropenen). De oude versietest is op de zichtbare zijbalktekst gericht, omdat de versie nu ook in het gesloten infovenster voorkomt.
- De infoscenario's controleren negen bullets, concept, actuele versie, NL/EN, beginfocus, Escape/openerfocus, doorlopende oefentijd en behoud van speler en niet-opgeslagen formulierinvoer. Kleinste desktopmaat 900×680: verticaal scrollen en geen horizontale overloop. Screenshot in beide talen visueel nagekeken.
- Mac arm64- en Windows x64-zip v0.0.26 gebouwd. Verpakte Mac-app: 3/3 geslaagd (beide infoscenario’s en offline hoofdvenster/heropenen).

Alle tests gebruiken tijdelijke geïsoleerde gebruikersdata. Windows-bouw is geen echte Windows-gebruikstest. De bredere open Windows-/luistercontroles blijven ongewijzigd. Geen release of zelfstandige merge.

## Zelf proberen

Klik onderaan de zijbalk op Info over HITtheBeat / About HITtheBeat. Lees het concept en de functielijst, scroll zo nodig en sluit met de knop of Escape. Dit kan tijdens spelen of terwijl een formulier nog niet opgeslagen is. De appversie staat onderaan.
