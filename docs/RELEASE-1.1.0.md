# Release 1.1.0 — voortgang en testcuratie

Gepubliceerd op 17 oktober 2026: [HITtheBeat 1.1.0](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.1.0), bron `7ac4d8a115bfe9f6d4da19f2e3c05ae087add266`. De onderstaande voorbereidingsstappen zijn historisch.

Gestart door de gebruiker op 17 oktober 2026. Scope: #28 en #27, maximaal twee issues. Volg AGENTS.md, werkwijze na milestone 1.

## #28 Evaluatie

Impact: alleen evaluatie-invoer; geen opslagmigratie. Verwijder notitieveld/state, behoud cijfers, tempo, toetsen en bestaande historie. Risico: Enter/focus, taalwissel en bewaren. Gerichte controles: build/typecheck, sessions en language Node-tests, evaluation en language desktoptests met tijdelijke gegevens. Historische notitiecompatibiliteit blijft door sessions-tests gedekt. Resultaat Mac: build/typecheck geslaagd; 9 sessions/language Node-tests, 5 CI-selectietests en 6 evaluation/language desktoptests geslaagd. Eén dubbelzinnige testlocator is aangescherpt en alleen de getroffen test herhaald. Zelfreview: criteria afgehandeld; bestaande notities blijven opgeslagen. CI-selectie aangescherpt voor deze UI-gebieden, zonder import-/opslagtests te schrappen uit de volledige releasegroep. Windows- en Mac-PR-CI geslaagd in run 39018740430; #28 gesloten via PR #30. Fysieke gebruiks-/luistercontrole wordt niet geclaimd.

## #27 Voortgang — geïmplementeerd en gericht gecontroleerd

Vier periodes, drie samenvattingen, gecombineerde tempo-/scoregrafieken met verbergkeuze, frequentie per oefening en bladerbaar dagritme van 30 dagen. Geen laatste-resultaatvak of gedetailleerde oefeninghistorie. Gebruik uitsluitend historische momentopnamen; geen wijziging aan de persoonlijke bibliotheek. Mac: build/typecheck, 19 progress/sessions/language Node-tests, 5 CI-selectietests en 13 gerichte desktoptests geslaagd. De nieuwe dashboardfixture is aangepast omdat Electron-evaluate geen dynamische import ondersteunt; alleen die test opnieuw uitgevoerd. Risico’s gedekt: kalender-/jaar-/DST-grenzen, frequentie dedupliceren, oude notities en snapshots behouden, beide grafieken verbergen/herstellen, dagbladeren, offline herstart, smal venster, metronoomcontext en hele BPM-weergave. Zelfreview op alle negen criteria: akkoord; fysieke Windows-gebruikstest en muzikale luistercontrole niet geclaimd.

## Releasecontrole — status bij bronvoorbereiding

Een volledige gecureerde regressie op vaste bron, daarna handmatige eindcontrole vóór installerbuilds. Nog geen nieuwe release gepubliceerd.


## Testmatrix en curatie

| Gebruikersfunctie / grens | Gericht bij issuewerk | Volledige releasegroep / platform |
| --- | --- | --- |
| Cijfers, Enter, tempo aanpassen, bewaren | sessions + evaluation; language bij taalweergave | Node + desktop, Mac arm64 / Windows x64 |
| Periodes, totalen, dagindeling en historie | progress + sessions; grens-, DST- en schrikkeldagcases | Node + progress desktop, beide platformen |
| Grafieken, filters, dagbladeren, responsiviteit | progress desktop; language voor NL/EN | Alle desktoptests op beide platformen |
| Oorspronkelijke BPM/context na dashboardwijziging | bestaande bpm/metronome/evaluation-tests met nieuwe dashboardselectors | Alle Node-/desktoptests |
| Audio, fragmenttraining, import/export en venstergrenzen | Alleen wanneer geraakt; geen wijziging van deze productcode | Volledige bestaande releasegroep |
| Werkelijke installer, media, herstart/opslag | Bij packaging-/platformwijziging | Na handmatig akkoord: check-installer op beide native builds |

De automatische selector neemt gewijzigde testbestanden direct mee en koppelt evaluatie-/dashboardcode aan de betrokken suites. Geen volledige opslag-/importgroep uitsluitend omdat een aangepaste UI-test het woord session bevat. Bestaande volledige suites blijven behouden. Verouderde dashboardselectors worden vervangen door controle op dezelfde opgeslagen gegevens en nieuwe zichtbare context. Geen tests verwijderd om fouten te verbergen; geen dekkings- of aantallendoel.


## Voorbereiding van de handmatige eindcontrole

Voorgestelde versie: 1.1.0; schema 10, geen nieuwe afhankelijkheden of appdatapaden. Versievoorbereiding wijzigt uitsluitend packageversie en releasestatus/documentatie. Releaseworkflow wordt op de vaste main-commit gestart zonder tag of publicatie vooraf. De volledige regressie draait eenmaal native op Mac arm64 en Windows x64. Daarna wacht de beschermde omgeving release-approval op de menselijke eindcontrole. De exacte SHA en run worden in de milestone/PR geregistreerd.

Testbare Mac-ontwikkelversie (geen DMG/ZIP-installer): `release/review-1.1.0/mac-arm64/HITtheBeat.app`, gebouwd met electron-builder --dir op dezelfde bron. Dit is uitsluitend de ontwikkelbuild voor de eindcontrole. De vier distributiebestanden worden pas na goedkeuring in de workflow gebouwd en gericht gecontroleerd.

Handmatig te bekijken: evaluatie zonder notitie, cijfer/tempo/Enter; vier dashboardperiodes, beide lijngrafieken en oefeningfilters; frequentie en 30-dagenknoppen. Oude bibliotheek/sessies blijven behouden. Automatische checks zijn geen muzikale luisteracceptatie of interactieve OS-installatiecontrole; signing/notariserings- en licentiegrenzen blijven gelijk.

PR #31 is na zelfreview en groene CI op beide platformen samengevoegd; #27 en #28 zijn gesloten. Run 39019236877: per platform build/typecheck, 20 gerichte Node-tests en 14 desktoptests. De Mac-ontwikkelapp 1.1.0 is gebouwd als appdirectory, lokaal ad-hoc ondertekend en met de geisoleerde shell/start/herstarttest gecontroleerd. Geen nieuwe DMG/EXE/ZIP gebouwd of gepubliceerd. Volledige regressie en handmatige eindcontrole volgen op de vaste releasebron.


### Herstel bij releasecontrole: live contextvertaling (#27)

De eerste regressierun 39019598374 op e1dd190 is geannuleerd voor een gevonden taalwisselrandgeval: memoized contextlabels bleven in de oude taal. De gerichte dashboardtest reproduceert dit (Full track ontbrak na NL/EN-wissel). Aggregatiecache neemt nu de taal mee als dependency; periode en filters blijven behouden. #27 is voor dit herstel tijdelijk heropend; een afzonderlijke PR sluit het na gerichte controle opnieuw. Geen test verwijderd of fout genegeerd. De gewijzigde releasebron vereist opnieuw de volledige native regressie en daarna menselijke eindcontrole. De eerder gebouwde ontwikkelapp wordt vervangen door dezelfde versie met deze correctie; er is nog geen release of installer gepubliceerd.

Gericht herstelbewijs op Mac: build/typecheck, 13 progress/language Node-tests en de dashboardtest geslaagd, inclusief toetsenbordfilter en live contextvertaling zonder periode-/filterverlies. De test faalde aantoonbaar op de oorspronkelijke bron en slaagt na de cachecorrectie.


### Testcuratie na volledige run 39020035447

Op beide platformen slagen alle 111 Node-tests en 30 van 31 desktoptests. De enige fout is de verouderde verwachting in count-in.spec.ts:70 voor Aftellen in het op verzoek verwijderde sessiedetailpaneel. De productcode werkte; de test wordt niet geschrapt maar controleert nu de dashboard-samenvatting tegen gespeelde tijd zonder aftellen/pauzes. Alle oorspronkelijke checks op aftelmaten, BPM, pauze/herstart, vrije training, vier speelbeurten en afzonderlijk opgeslagen voorbereidingstijd blijven behouden. Alleen deze getroffen test wordt lokaal herhaald. Geen productcode of ontwikkelapp veranderd; de releaseworkflow moet de gecorrigeerde volledige testgroep groen uitvoeren voordat de menselijke gate wordt bereikt. Installers/publicatie zijn in de mislukte run overgeslagen.

De gerichte afteltest slaagt op Mac (16 seconden), inclusief de nieuwe dashboardcontrole. De PR-CI controleert deze testgroep native op beide platformen. Dit is testonderhoud voor #27, geen extra functioneel milestone-issue.


## Definitief testbewijs en gebruikersakkoord

De definitieve regressie op bron 7ac4d8a115bfe9f6d4da19f2e3c05ae087add266 slaagt native op beide platformen: elk 111 Node-tests en 31 desktop-/audiotests. Run: https://github.com/RoJoRZ/HITtheBeat/actions/runs/39020577338. Mac-desktopgroep 2,8 minuten; Windows 3,3 minuten. De ontwikkelapp bevat dezelfde producttree; alleen het laatste testonderhoud/documentatie verschilt van de bouwcommit.

Op 17 oktober 2026 bevestigt de gebruiker na de handmatige eindcontrole: "prima, ziet er goed uit. Akkoord voor release". Dit besluit is expliciet geregistreerd in de PR en de release-approval-gate voor uitsluitend deze bron. Native installerjobs volgen in dezelfde run, zonder de volledige regressie opnieuw te draaien. De handmatige beslissing wordt niet vervangen door agentzelfreview.


## Publicatie en installercontrole

Beide native installerjobs zijn geslaagd. Per platform vier gerichte tests op de daadwerkelijk geinstalleerde app (shell, bibliotheek/media, import/opslag/herstart en tablatuur). Mac-DMG read-only aangekoppeld, app gekopieerd en signature gecontroleerd; Windows per-user geinstalleerd in een pad met spaties en na controle gedeinstalleerd. Tijdelijke testgegevens; geen persoonlijke bibliotheek gebruikt. De volledige regressie is na het akkoord niet herhaald.

De automatische publicatiestap heeft alle zeven bestanden geupload, maar kreeg bij GET releases/tags/v1.1.0 een 404: de tag bestond nog niet voor het concept. Release 415712241 is daarom via zijn ID opgehaald en gecontroleerd: exact de goedgekeurde bron, vier binaries, handleiding, SHA256SUMS en notices; alle upload-digests kwamen overeen met de native build en bronbestanden. Daarna is hetzelfde concept gepubliceerd. Tag v1.1.0 wijst naar de goedgekeurde bron; geen herbouw, vervanging of tagverplaatsing. De historische publish-job blijft als mislukt zichtbaar; publicatie is gecontroleerd afgerond.

Het publicatiescript voor volgende releases vindt het zojuist gemaakte concept in de releasecollectie, weigert ontbrekende/ambigue/gepubliceerde of afwijkende bronnen, controleert het volledige bestandenset en alle digests en publiceert uitsluitend via de release-ID. Na publicatie controleert het de identiteit en digests opnieuw. Typecheck en negen gerichte Node-tests slagen, inclusief ontbrekende tag, verkeerd concept, gewijzigde/missende bestanden, API-fouten en onverwachte publicatierespons. Geen extra volledige regressie of installerbuild voor dit publicatieherstel.

### Controlegetallen van de gepubliceerde bestanden

| Bestand | SHA-256 |
| --- | --- |
| HITtheBeat-1.1.0-mac-arm64.dmg | ff82d32f26b89113cade6de5af0adae70394c8855fc28175dce2b7c51037207f |
| HITtheBeat-1.1.0-mac-arm64.zip | fcf6f9be782e022ab2545e44c76a1fe566943b157c64589017673337218eae26 |
| HITtheBeat-1.1.0-win-x64.exe | f341ac0ed7971c0838598185125b348e3ffaf4ab857e61bd29d57935624278fd |
| HITtheBeat-1.1.0-win-x64.zip | 42a652206a77a75d879cc7987262834162fddf523f4cf2361040c41fc40f27a6 |

Beide milestone-issues zijn gesloten. Milestone 2 wordt na de laatste administratieve controle gesloten. De oorspronkelijke 1.0.0-tag en alle assets blijven gelijk.

De identity-preflight controleert na een tag-404 ook alle pagina’s van de releasecollectie op bestaande drafts. Een fout, ontbrekende permissie of ongeldige respons geldt nooit als bewezen afwezigheid; ook concepten zonder tag blokkeren een nieuwe run voor dezelfde versie.
