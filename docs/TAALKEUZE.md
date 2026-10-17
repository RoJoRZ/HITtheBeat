# Nederlands en Engels — v0.0.25, issue #6

De gebruiker accepteert de export-/importstap en geeft akkoord op Nederlands/Engels, systeemtaal als standaard, bewaarde handmatige keuze en direct wisselen zonder sessieherstart. FUNCTIONEEL.md hoofdstuk 33 is leidend; DESIGN.md beschrijft de taalkeuze en TECHNISCH-ONTWERP.md de catalogus, voorkeur en procesgrenzen.

## Impact

Alle eigen schermteksten, toegankelijke labels, spelers, evaluatie, sessietabel, fragmenten, dashboard/historie, makerlabels, fout-/statusmeldingen, appmenu en eigen dialoogteksten gebruiken de gedeelde catalogus. Er is geen nieuwe runtime-afhankelijkheid, account, server, opslagmigratie of wijziging van het audio-algoritme. De bestaande database blijft schema 10. Dagindeling, tijden, BPM-precisie en historische snapshots veranderen niet.

De taalvoorkeur staat apart in lokale preferences.json. Nederlands wordt gekozen voor een nl-systeemtaal, Engels voor andere talen. Een expliciete geldige keuze wint bij herstart. Ongeldige/onleesbare voorkeuren vallen terug op het systeem; een mislukte schrijfoperatie houdt de vorige actieve taal en toont een melding. De keuze staat sinds gebruikersverzoek #21 uitsluitend in Instellingen; de compacte keuze bovenaan vervalt. De preference-/IPC-route blijft gelijk.

Belangrijkste regressierisico's: hardgecodeerde of bij opstart vastgezette labels, invoer-/spelerverlies door remount, een meevertaalde eigen naam/notitie, meldingen die in de vorige taal blijven hangen, en onbedoelde extra viewerrechten. Expliciete bronsleutels met parameters, bestaande componentidentiteit en apart vertaalbare meldingen voorkomen dat. Het tablatuurvenster krijgt alleen een taal-getter/change-listener, geen setter of bibliotheektoegang. Native OS-knoppen en externe OS-foutteksten volgen het OS, niet de appcatalogus.

De Engelse weergave gebruikt en-GB; Nederlands nl-NL. Eigen teksten blijven letterlijk staan, inclusief accolades en HTML-tekens. Engelse muzikale terminologie gebruikt passage voor fragment en notation voor tablatuur/foto. Metronoommaten tonen passend bar/bars en maat/maten. Interne type-/statuswaarden, bestandsformaat en fragment-/sessie-identiteiten worden niet vertaald.

## Controlebewijs

- `pnpm build` geslaagd: beide TypeScript-configuraties en productiefrontend.
- `pnpm test`: **103/103** geslaagd. Inclusief bestaande opslag-/migratie-/audio-/snapshotcontroles plus systeemtaalmapping, voorkeur behouden na opnieuw openen, ongeldige/corrupte voorkeur, falende opslag, boodschapparameters met eigen tekst en live meldingvertaling. De cataloguscontrole controleert alle expliciete bronsleutels, overeenkomstige placeholders en onvertalingsvrije JSX-tekst; ze gebruikt de al aanwezige Vite/Rolldown-parser, geen nieuwe dependency.
- Volledige bron-Electronreeks: **28 geslaagd en één verouderde API-allowlistassertie** in de tablatuurtest. Die assertie is bijgewerkt voor de twee bedoelde leesfuncties; de gerichte herhaling slaagt (**1/1**). Dezelfde test controleert nu ook expliciet dat language:set vanuit het tablatuurvenster wordt geweigerd en wacht op de asynchrone IPC-fout. Daarmee zijn alle **29 desktopscenario's** geverifieerd; overige scenario's ongewijzigd gebleven.
- De vier nieuwe taaltests slagen: standaard Engels bij de-DE, Nederlands bij nl-BE, handmatige override en herstart ondanks andere systeemtaal; appmenu; live playback met oplopende oefentijd; behoud van tablatuurzoom en afbeeldings-URL; eigen opdracht/makertekst; nog niet opgeslagen invoer; cijfer/toetsen/tempo/notitie in evaluatie; Engelse editor/dashboard/historie/import-export en een reeds zichtbare fout die direct meewisselt.
- Mac arm64- en Windows x64-zip **v0.0.25** gebouwd.
- Verpakte Mac-app: **7/7** geslaagd, alle vier taaltests plus tablatuurbeveiliging, delen en offline hoofdvenster/heropenen. Engelse editor en dashboard zijn visueel nagekeken; compacte 960px-weergave op horizontale overloop gecontroleerd.

Alle tests gebruiken tijdelijke geïsoleerde gebruikersdata, nooit de persoonlijke bibliotheek. Geen echte Windows-gebruikstest, OS-bestandsdialoogkliktest, algemene muziekdetectienauwkeurigheid of muzikale luisteracceptatie geclaimd. De bestaande bundlerwaarschuwing over use client bij lucide is geen buildfout. Geen release/tag of zelfstandige merge.

## Zelf proberen

1. Kies Nederlands of English in Instellingen. Schermen en menu wisselen direct. Sluit en heropen: de handmatige keuze blijft staan.
2. Tijdens een sessie volgt navigeren naar Instellingen de bestaande stopbevestiging. Een open tablatuurvenster volgt taalwijzigingen.
3. Controleer dat eigen oefennamen, opdrachten en notities niet worden vertaald.
4. Bekijk ook de Engelse sessietabel, fragmentkeuze, voortgang en import-/exportdialogen. Deelbestanden bevatten geen taalvoorkeur.

Geef ruimte voor gebruiksfeedback vóór issue #8 (afronden en distributie). De Windows-gebruikstest blijft nodig voor release.
