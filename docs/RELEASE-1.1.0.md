# Release 1.1.0 — voortgang en testcuratie

Gestart door de gebruiker op 17 oktober 2026. Scope: #28 en #27, maximaal twee issues. Volg AGENTS.md, werkwijze na milestone 1.

## #28 Evaluatie

Impact: alleen evaluatie-invoer; geen opslagmigratie. Verwijder notitieveld/state, behoud cijfers, tempo, toetsen en bestaande historie. Risico: Enter/focus, taalwissel en bewaren. Gerichte controles: build/typecheck, sessions en language Node-tests, evaluation en language desktoptests met tijdelijke gegevens. Historische notitiecompatibiliteit blijft door sessions-tests gedekt. Resultaat Mac: build/typecheck geslaagd; 9 sessions/language Node-tests, 5 CI-selectietests en 6 evaluation/language desktoptests geslaagd. Eén dubbelzinnige testlocator is aangescherpt en alleen de getroffen test herhaald. Zelfreview: criteria afgehandeld; bestaande notities blijven opgeslagen. CI-selectie aangescherpt voor deze UI-gebieden, zonder import-/opslagtests te schrappen uit de volledige releasegroep. Windows- en Mac-PR-CI geslaagd in run 39018740430; #28 gesloten via PR #30. Fysieke gebruiks-/luistercontrole wordt niet geclaimd.

## #27 Voortgang — geïmplementeerd en gericht gecontroleerd

Vier periodes, drie samenvattingen, gecombineerde tempo-/scoregrafieken met verbergkeuze, frequentie per oefening en bladerbaar dagritme van 30 dagen. Geen laatste-resultaatvak of gedetailleerde oefeninghistorie. Gebruik uitsluitend historische momentopnamen; geen wijziging aan de persoonlijke bibliotheek. Mac: build/typecheck, 19 progress/sessions/language Node-tests, 5 CI-selectietests en 13 gerichte desktoptests geslaagd. De nieuwe dashboardfixture is aangepast omdat Electron-evaluate geen dynamische import ondersteunt; alleen die test opnieuw uitgevoerd. Risico’s gedekt: kalender-/jaar-/DST-grenzen, frequentie dedupliceren, oude notities en snapshots behouden, beide grafieken verbergen/herstellen, dagbladeren, offline herstart, smal venster, metronoomcontext en hele BPM-weergave. Zelfreview op alle negen criteria: akkoord; fysieke Windows-gebruikstest en muzikale luistercontrole niet geclaimd.

## Releasecontrole — nog uit te voeren

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
