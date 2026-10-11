# M4A-import en Instellingen — v0.0.15

De losse Audioproef is verwijderd. De eigen oefeningspeler blijft beschikbaar bij Oefeningen. Instellingen bevat Bibliotheekmap openen, uitleg over ongewijzigde lokale kopieën en de ondersteunde importformaten.

Import: MP3 of onbeveiligde M4A met AAC, maximaal 50 MB. Apple Lossless (ALAC) is expliciet niet ondersteund. Geen automatische conversie of wijziging van bronbytes. Bestaande oefeningen, fragmenten, opbouwen en historie behouden schema 5.

## Controles

- Build met TypeScript-controles geslaagd; 46 Node-tests geslaagd.
- Volledige desktopreeks: 15 tests geslaagd op Mac, inclusief bestaande evaluatie-, fragment-, volume-, dashboard- en sessiecontroles.
- Extra controle van de verpakte Apple Silicon-app: MP3-bediening, bibliotheek/heropenen, navigatie en M4A/Instellingen. De DSP-bronmoduletest wordt volgens configuratie overgeslagen in een pakket.
- Synthetische AAC-fixture: import, BPM-schatting, normalisatie, identieke opgeslagen bytes en correct MIME, herstart na verwijderen origineel, losse speler en fragmentstap in een oefensessie.
- ALAC wordt vóór opslaan geweigerd. Node-tests controleren ook beschadigde containers, video en beveiligde samples, en bewaring van fragmenten en sessiemomentopnamen.
- Instellingen: geen Audioproef, mapactie uitsluitend daar, juiste lokale bibliotheeklocatie en zichtbare melding wanneer openen faalt. Het systeemvenster wordt in tests vervangen door een gecontroleerde stub.
- Mac- en Windows-zipproefpakketten gebouwd. Een Windows-build is geen Windows-gebruikstest. Windows-decodering, luisterkwaliteit op echte muziek en BPM-nauwkeurigheid op uiteenlopende oefeningen blijven open.

## Zelf proberen

1. Open Oefeningen en voeg een eigen MP3 of M4A met AAC toe. Controleer de BPM-schatting en sla op.
2. Speel de oefening en kies haar in een oefensessie; probeer tempo, toonhoogte en A–B-loop.
3. Open Instellingen en kies Bibliotheekmap openen. De interne bestandsnamen verschillen van de oorspronkelijke namen; de audio is inhoudelijk dezelfde kopie.
4. Herstart de app. De oefening blijft beschikbaar, ook als het oorspronkelijke bestand verplaatst is.

Dit is een afzonderlijke verbetering vóór verdere distributie. Installatieprogramma’s, ondertekening/notarisatie en licentiekeuze zijn hiermee niet afgerond.
