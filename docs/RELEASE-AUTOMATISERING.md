# Releaseautomatisering en afsluiting #8

De eerste 1.0.0 en bestaande RC1 blijven onveranderd. Opdracht: de goedgekeurde app-/release-PR's naar main samenvoegen en het ontbrekende CI-werk van milestone 1 afmaken. Dit wijzigt geen appgedrag en maakt geen nieuwe release.

## PR-controle

ci.yml bouwt op Mac arm64 (macos-15) en Windows x64. scripts/ci-tests.mjs selecteert op gewijzigde bestanden: snelle basiscontroles, aangevuld met relevante audio-, opslag-/sessie-, taal-/UI- of vensterregressies. Gewijzigde testbestanden worden meegenomen. Alleen documentatie vraagt geen appbuild of regressie. De selectie staat in de joblog; complexe wijzigingen vereisen daarnaast een bewuste review van ontbrekende risico's. De selector zelf heeft gerichte tests. Geen volledige testreeks of installerbuild bij iedere PR.

## Releaseketen

release.yml start bij een nieuwe v*-tag of via Actions → Release → Run workflow op de gekozen bron. Identity controleert packageversie/tag en weigert een al bestaande release; een onverwachte API-/authfout is geen bewijs dat de release ontbreekt.

1. Beide platformen voeren op dezelfde vaste bron één volledige Node-/desktopregressie uit. De inhoud van de suites blijft onder curatie; falende/instabiele tests worden onderzocht, niet stilzwijgend verwijderd.
2. Na geslaagde regressie wacht approval op de beschermde GitHub-omgeving **release-approval**. Reviewer: **RoJoRZ**. Beheerdersbypass staat uit. De eigenaar kan ook een eigen gestart proces beoordelen; het blijft een bewuste menselijke handeling die de agent niet namens hem uitvoert.
3. De gebruiker controleert wijzigingen, bronversie, testbewijs en de ontwikkelversie en keurt expliciet goed via Review deployments. Geen nieuwe release-installers vóór deze stap.
4. Installers bouwen native: Mac Apple Silicon DMG/ZIP, Windows x64 per-user NSIS/ZIP. Geen tweede volledige regressie. scripts/check-installer.mjs koppelt de Mac-DMG read-only aan en kopieert de app; Windows installeert stil in een pad met spaties. Gericht shell, media-import/opslag/herstart en tablatuur testen tegen de echt geïnstalleerde app met tijdelijke gegevens. Windows deïnstalleert na controle.
5. Publish verzamelt precies de vier platformbestanden, berekent SHA-256, voegt installatiehandleiding/third-party notices toe en maakt een conceptrelease op dezelfde bron. Alle upload-digests moeten overeenkomen vóór definitieve publicatie. Bestaande releases/assets worden niet overschreven; een fout laat het concept ter diagnose staan. Voor herstart eerst oorzaak beoordelen, niet een gepubliceerde tag verplaatsen.

Alleen de publicatiejob krijgt contents:write; PR-/test-/buildjobs hebben contents:read. Gepinde officiële actions, geen nieuwe runtime-afhankelijkheid, signing-secret of updater. Versies met een suffix blijven pre-release. Gebruik een nieuw versienummer voor fixes.

## Controlebewijs en grenzen

- De bestaande 1.0.0-appbron is op Mac gecontroleerd met 103 Node-tests, 31 desktoptests en 8 pakkettests; de native Windows-run leverde 103 Node-tests, 6 ZIP-tests en installatie/start/deïnstallatie. Geen herhaalde volledige appregressie voor uitsluitend workflow-/documentatieafronding.
- Voor deze CI-wijziging: selectorcases, JavaScript-/YAML-syntaxis en gerichte PR-bouw/start op beide platforms. De uiteindelijke PR vermeldt de run en uitslagen.
- De protected environment is via GitHub-instellingen opgeslagen en gecontroleerd. Een toekomstige echte release zal na de regressie op menselijke review wachten; dat akkoord wordt niet voor een proefpublicatie gesimuleerd. Geen nieuwe testtag/release aangemaakt voor deze administratie.
- Automatische checks zijn geen muzikale luisterbeoordeling of interactieve SmartScreen/Gatekeeper-test. Mac blijft ad-hoc ondertekend/niet genotariseerd, Windows unsigned, projectlicentie onbeslist.

PR #25 over de algemene werkwijze na milestone 1 blijft afzonderlijk open door een automatische retarget-weigering. Deze CI-afronding voegt die PR niet alsnog indirect samen. De gebruiker houdt zijn handmatige release-eindcontrole; er wordt geen goedkeuring gegeven of omzeild tijdens deze afronding.
