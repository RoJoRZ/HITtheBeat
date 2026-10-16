# BPM-detectie en gehele BPM-weergave — issue #5, v0.0.23

Gebouwd na gebruiksgoedkeuring van de waveformselectie in v0.0.22. Afzonderlijke issuebranch vanaf de geaccepteerde issue-4-commit; niet zelfstandig mergen of releasen.

## Onderzoek en meetbasis

De oude detector koos de eerste sterke periodiciteit met voorkeur voor korte lags. Bij geaccentueerde achtsten van 55/65/85/100/115 BPM koos hij circa 110/130/170/200/230 BPM. Een eenvoudige vergelijking van alleen de twee piektoppen introduceerde fouten door het 100fps-raster; die aanpak is niet behouden. De gerealiseerde vergelijking integreert correlatieondersteuning over ±2 frames en kiest de dubbele lag alleen bij >10% sterkere ondersteuning.

De gegenereerde referentiereeks bevat 29 patronen: regelmatige pulsen inclusief 40/45/240, geaccentueerde achtsten en zestienden, swing, een getoonde toonreeks met harmonischen en kleine timingvariatie. Referenties komen uit de generator, niet uit een automatische tweede schatting. Dit is gecontroleerd synthetisch materiaal, geen corpus van menselijke muziekopnamen. Definitie van correct: minder dan 2 BPM van de gegenereerde referentie.

| Geval | Referentie | Voor | Na |
|---|---:|---:|---:|
| Geaccentueerde achtsten | 55 | 110,1 | 55 |
| Geaccentueerde achtsten | 65 | 130 | 65 |
| Geaccentueerde achtsten | 85 | 170,2 | 85 |
| Geaccentueerde achtsten | 100 | 199,9 | 100 |
| Geaccentueerde achtsten | 115 | 230 | 115 |

In de 29 gelabelde referentiepatronen: **24/29 correct vóór, 29/29 na**, vijf dubbele-tempo-uitkomsten voorkomen. De andere 24 referentiepatronen blijven binnen 2 BPM, inclusief snelle gelijkmatige pulsen. Volledige gemeten resultaten staan in [BPM-BENCHMARK.json](BPM-BENCHMARK.json); de decimalen daar zijn meetdata, geen appweergave.

Vier aanvullende ambigu gelabelde gevallen zijn twee paren met dezelfde hoorbare puls maar een andere bedoelde tel. Schaars gespeelde 180 BPM en regelmatige 90 BPM geven beide circa 90. Bij dezelfde afwisselende accenten als kwartnoten op 180 of achtsten op 90 koos de oude detector circa 180 en de nieuwe circa 90. Dit toont de afruil expliciet: de langere-periodevoorkeur kan bij een andere bedoelde tel juist een halve-tempo-uitkomst geven. Deze vier gevallen tellen niet mee in de 29/29-score en bewijzen geen automatische oplossing voor metrische ambiguïteit. Halveer/Verdubbel en gewone handmatige correctie blijven nodig.

## Reproduceren

`tests/tempo-fixtures.mjs` is de gedeelde generator; `tests/tempo-benchmark.mjs` draait dezelfde reeks door de actuele detector. De vóór-implementatie is de detector uit commit `6dd27b613b8d679fcfe26388ee88147a086d3a25` (v0.0.22). Bewaar die desgewenst met `git show <commit>:src/audio/bpm.ts` in een genegeerd cachebestand. Geef het bestandspad als HITTHEBEAT_BPM_BASELINE aan de benchmark; zonder die variabele meet het script alleen de huidige detector. De tijdelijke persoonlijke machinepaden uit de ontwikkelrun zijn niet onderdeel van de benchmarkcode.

## Impact en compatibiliteit

- Detector: beperkte periodeselectie binnen het bestaande algoritme/worker, analysevenster en fallback. Geen package of cloudservice.
- Presentatie: gedeelde BPM-formatter in renderer en routinefoutmelding. Bibliotheek, invoer, sessietabel, beide spelers, aftellen, evaluatie, historie en grafiektekst/aria tonen gehele BPM.
- Precisie: opgeslagen bron-, stap- en momentopnamewaarden blijven bestaan. Reekssleutels, grafiekcoördinaten, tijd- en snelheidsberekeningen blijven precies. Alleen kijken, focus/blur zonder edit of een naam/opdrachtwijziging rondt gegevens niet af. Nieuwe handmatige tempo-/delta-invoer wordt geheel; Gebruik schatting mag interne detectorprecisie behouden.
- Correctie: twee lokale formulieracties Halveer BPM en Verdubbel BPM; expliciet opslaan. Een lopende analyse overschrijft handmatige invoer niet. Bestaande oefeningen worden niet automatisch heranalyseerd.
- Geen schema-, IPC-, audiomotor- of mediawijziging. Historische resultaten worden niet herschreven.

Regressierisico's zijn onbedoeld halveren van snelle passages, verborgen afronding bij opslaan van andere velden, veranderen van historiegroepen, gemiste BPM-decimalen in toegankelijkheidstekst en een workerresultaat dat de gebruikerskeuze overschrijft. Tests richten zich hierop.

## Zelf proberen

1. Importeer een MP3 of AAC-M4A. De schatting en het BPM-veld tonen hele getallen. Controleer de bedoelde tel met luisteren.
2. Kies Halveer BPM, Verdubbel BPM of typ zelf het tempo. Opslaan past de oefening aan via de bestaande validatie; een schatting is geen verplichting.
3. Bewerk alleen de opdracht van een oudere oefening met interne decimale BPM. Die precieze waarde blijft bewaard.
4. Bekijk sessietabel, spelers/aftellen, evaluatie en Voortgang. Alleen BPM is geheel; seconden, dB en toonhoogte houden hun eigen notatie.

## Controles en beperkingen

Domeintests controleren de referentiepatronen, snelle pulsen, stilte/constante toon, korte audio en metrische ambiguïteit. Een Electron-test gebruikt bestaande fractionele oefeningen, stappen en historie en controleert gehele tekst/velden/aria zonder gegevensverlies. Een tweede test encodeert geaccentueerde onderverdelingen op 85 BPM naar MP3 en controleert de echte import-worker; handmatige 88 BPM tijdens analyse blijft behouden. Bestaande AAC-importtests en overige routes worden mee uitgevoerd.

De uitgebreide controle op diverse echte muziekopnamen, muzikale luisterbeoordeling en een echte Windows-gebruikstest blijven open. Deze benchmark geeft geen algemeen nauwkeurigheidspercentage voor gebruikersmuziek. Resultaten van build, regressies en pakketten volgen hieronder.


Resultaten op 16 oktober 2026: productiebuild met beide TypeScript-configuraties en **95 Node-tests geslaagd**. Gerichte BPM-/bibliotheek-/evaluatiereeks: **5/5 geslaagd**. Volledige desktopreeks: **23/24 direct geslaagd**; de bestaande audiobedieningstest verwachtte nog het decimale invoergetal 22,5 waar nieuwe handmatige invoer nu 23 hoort te worden. Die verwachting is aangepast, zonder de onderliggende 25%-DSP-controle te wijzigen. Definitieve hercontrole van audiobediening en beide BPM-tests: **3/3 geslaagd**, inclusief formulier op 960px zonder horizontale overflow. De volledige bronreeks voerde de bestaande DSP-probes uit met de in v0.0.22 verbeterde audioklokmeting. Alle 24 routes zijn daarmee gecontroleerd; geen claim van een foutloze volledige eenmalige regressierun. Visuele controle van formulier en dashboard uitgevoerd; `git diff --check` schoon.


Verpakt Mac-arm64-programma v0.0.23: **6/6 pakkettests geslaagd**, één bron-DSP-probe bewust overgeslagen (wel uitgevoerd in de volledige bronreeks). Inclusief de MP3-importworker, behoud van fractionele bron-/stap-/historiewaarden, gehele schermtekst, handmatige correctie, audio/toetsen, evaluatie en dashboard. Mac-arm64- en Windows-x64-zip gebouwd. Windows-gebruikstest en uitgebreide muzikale luisterbeoordeling op echte opnamen blijven open.
