# Release 1.2.0 — gestart 28 oktober 2026

Milestone 3: #40 dashboardvoorkeuren/tempo, #41 cijfers verwijderen, #42 voortgang verwijderen. Door gebruiker gestart; geen extra scope. Eén eindcontrole na volledige regressie, vóór release-installers. Nog niet gepubliceerd.

| Functie / risico | Gericht issuewerk | Release |
| --- | --- | --- |
| #40 aggregatie, voorkeuren, taal/IPC | build/typecheck; 15 Node-tests (dashboard-settings/progress/language); Electron progress inclusief herstart | Volledige native Mac/Windows-regressie |
| #41 tempo-evaluatie zonder score | Domein-/evaluatie-/taaltests en relevante aangepaste desktoptests | Dezelfde volledige groep |
| #42 gegevensbehoud bij wissen | Transactionele opslag-/gemengde historie- en IPC/UI-tests, alleen geïsoleerde data | Dezelfde volledige groep |
| Pakketten | Geen installers tijdens issuewerk | Na menselijk akkoord native builds + gerichte pakketcontrole |

#40: implementatie op issuebranch; Node-controles 15/15 geslaagd. Tijdelijke data, geen persoonlijke bibliotheek. Electron progress: 2/2 geslaagd, inclusief instellingen, tijd/filters, oude snapshots en herstart. Zelfreview is geen onafhankelijke menselijke review. Geen nieuwe dependency/schema voor voorkeuren. Bestaande context-/scoreaggregatie blijft tot #41 intern aanwezig voor de oude scoregrafiek; de tempografiek gebruikt uitsluitend de nieuwe oefeningaggregatie.

CI #40 ontdekte een verouderde taaltest die exact één select in Instellingen veronderstelde. Nu zijn er drie; de test controleert nog steeds exact één taalkeuze, behoudt alle taal/herstart/menuchecks en verwacht daarnaast de twee dashboardkeuzes. Geen productfout of geschrapte dekking.

#40 is via PR #43 samengevoegd en gesloten na groene native Mac/Windows-CI op de definitieve commit (40702396570). #41: build/typecheck en 14 domein-/runner-/taaltests geslaagd. Evaluatie begint bij tempo; expliciete legacy cijfers blijven bewaard, ontbrekende cijfers blijven afwezig. Dashboardscore vervalt. Betrokken desktoptests worden aangepast op het nieuwe gedrag met behoud van hun overige controles; Electron evaluatie/taal/progress/Info: 10/10 geslaagd op Mac.


#41 is via PR #44 samengevoegd en gesloten na lokaal Mac-bewijs en groene native Windows-CI. De Mac-CI wachtte wegens runnercapaciteit; geen succes geclaimd. Volledige native regressie blijft verplicht.

#42 implementatie: build/typecheck, 22 gerichte Node-tests en 3 Electron-dashboard/beheertests geslaagd op Mac. Opslagtest dekt gemengde oefeningen én vrije fragmenttraining, gelijke namen/verschillende identiteiten, verwijderde bibliotheekoefening, nieuwe training, ongeldige ID, lopende sessie, verouderde bevestiging en transactionele rollback bij een geïnjecteerde SQLite-fout. UI-test controleert impacttekst/default Annuleren, geen wijziging bij annuleren, bevestiging, overige resultaten/media/opbouw, offline herstart en Engels. Visuele inspectie uitgevoerd; tabel gebruikt bestaande history-table-stijl. Zelfreview op identiteit, procesgrenzen, transacties en herstart; geen onafhankelijke menselijke review. Persoonlijke gegevens niet gelezen/gewist.

Laatste integratiereview #40/#42: de Altijd-tijdas gebruikt nu de nieuwe oefenmeetpunten, zodat oude gedeeltelijk gespeelde training niet buiten de as valt. De bestaande dashboardtest gebruikt hiervoor een oude gestopte herhaling en controleert haar datumlabel; 3/3 gerichte Electron-tests opnieuw geslaagd. Dit is een gevonden randgeval binnen de geselecteerde scope, geen extra milestone-issue.


## Vaste releasevoorbereiding en eindcontrole

#42 is via PR #45 samengevoegd en gesloten na groene native Mac/Windows-CI (40704189090) en lokale hercontrole van het laatste datumrandgeval. Aanvullende native CI 40704583776 wordt gevolgd. #41 native Mac-CI is inmiddels ook groen. Zelfreview is geen onafhankelijke menselijke review. Geen onbeoordeelde PR-stapel; alle geselecteerde issuewijzigingen staan op main.

Voorgestelde versie 1.2.0; schema 10, geen nieuwe dependency. Versievoorbereiding wijzigt alleen packageversie en statusdocumentatie. Exacte broncommit en run worden bij de menselijke gate vastgelegd. De volledige native groep draait éénmaal op de vaste bron; niet opnieuw vóór en na dezelfde build. Een relevante codefix vereist nieuwe validatie en eindcontrole. Nieuwe release-installers blijven geblokkeerd achter release-approval.

Testbare ontwikkelapp: release/review-1.2.0/mac-arm64/HITtheBeat.app (alleen appdirectory). Handmatig te controleren: Instellingen > Dashboard beheren (Altijd/Minimum, wisselen naar Maximum/Gemiddelde en herstart); één tempolijn per oefening inclusief fragmenten; geen score/cijferstap; tempo met 1/2/3 en Enter; voortgang verwijderen met impact/Annuleren/bevestigen. Persoonlijke data zijn niet vooraf gewijzigd. Signing/notarisering, oorspronkelijke Windows-invoer en muzikale luisteracceptatie krijgen geen nieuwe claim.
