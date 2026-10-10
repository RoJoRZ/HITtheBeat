# Afspraken voor deze repository

- `FUNCTIONEEL.md` is het centrale functionele document voor HITtheBeat.
- Verwerk iedere nieuwe of gewijzigde functionele afspraak van de gebruiker in dit document. Houd het actueel; laat afspraken niet alleen in de chat staan.
- Houd dit document bij met Git: commit functionele wijzigingen en push ze naar `origin`, tenzij de gebruiker anders aangeeft. Gebruik betekenisvolle commitberichten.
- Maak onderscheid tussen vastgestelde functionaliteit, voorstellen en open keuzes.
- Design: de gebruiker heeft Studio donker, **B — Mandarijn (#FF922E)** en de vier nieuwe schermdesigns goedgekeurd. Gebruik `DESIGN.md` en de renders 10 en 14–17 in `design/` als leidraad. Het speelscherm geeft vooral ruimte aan speler, tablatuur en een apart vak voor de geschreven opdracht. Het eerdere kleurstaal #FC4C02 en de andere lettertypevarianten zijn niet leidend. Functionele voorstellen worden niet automatisch definitief door goedkeuring van een render.
- Ontwikkelfasering staat in `ONTWIKKELPLAN.md`. De gebruiker heeft op 10 oktober 2026 opdracht gegeven te beginnen. Lever per fase een testbaar resultaat op met relevante controles en ruimte voor feedback voordat de volgende grote fase wordt uitgevoerd. Fase 0 heeft een geteste Mac-proefversie en een gebouwd Windows-pakket; een echte Windows-gebruikstest staat open. Zie `docs/FASE-0.md`. De volgende bouwfase is de losse audioproef.
- Implementatie is geautoriseerd op basis van de besproken technische richting. Houd `TECHNISCH-ONTWERP.md`, `FUNCTIONEEL.md` en `DESIGN.md` actueel. Wijzig geen open functionele keuze stilzwijgend. Een Windows-build is geen Windows-gebruikstest; vermeld ontbrekende platformverificatie expliciet.
