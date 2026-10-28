# Release 1.2.0 — gestart 28 oktober 2026

Milestone 3: #40 dashboardvoorkeuren/tempo, #41 cijfers verwijderen, #42 voortgang verwijderen. Door gebruiker gestart; geen extra scope. Eén eindcontrole na volledige regressie, vóór release-installers. Nog niet gepubliceerd.

| Functie / risico | Gericht issuewerk | Release |
| --- | --- | --- |
| #40 aggregatie, voorkeuren, taal/IPC | build/typecheck; 15 Node-tests (dashboard-settings/progress/language); Electron progress inclusief herstart | Volledige native Mac/Windows-regressie |
| #41 tempo-evaluatie zonder score | Domein-/evaluatie-/taaltests en relevante aangepaste desktoptests | Dezelfde volledige groep |
| #42 gegevensbehoud bij wissen | Transactionele opslag-/gemengde historie- en IPC/UI-tests, alleen geïsoleerde data | Dezelfde volledige groep |
| Pakketten | Geen installers tijdens issuewerk | Na menselijk akkoord native builds + gerichte pakketcontrole |

#40: implementatie op issuebranch; Node-controles 15/15 geslaagd. Tijdelijke data, geen persoonlijke bibliotheek. Electron progress: 2/2 geslaagd, inclusief instellingen, tijd/filters, oude snapshots en herstart. Zelfreview is geen onafhankelijke menselijke review. Geen nieuwe dependency/schema voor voorkeuren. Bestaande context-/scoreaggregatie blijft tot #41 intern aanwezig voor de oude scoregrafiek; de tempografiek gebruikt uitsluitend de nieuwe oefeningaggregatie.
