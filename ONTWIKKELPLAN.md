# HITtheBeat — Ontwikkelplan

Bijgewerkt: 11 oktober 2026. Status: fase 0–6B en het recente sessieoverzicht zijn geleverd; fase 7 levert het voortgangsdashboard in v0.0.14. Geef ruimte voor gebruiksfeedback vóór fase 8. Mac-controles en proefpakketten staan per fase beschreven in docs/. Een echte Windows-gebruikstest, muzikale luisterbeoordeling en BPM-detectie op uiteenlopende eigen muziek blijven open.

## 1. Uitgangspunten

- Functioneel gedrag volgt `FUNCTIONEEL.md`.
- De goedgekeurde stijl en schermen volgen `DESIGN.md`: Studio donker, B — Mandarijn.
- De besproken technische richting uit `TECHNISCH-ONTWERP.md` vormt de basis voor uitvoering: Electron, React, TypeScript, SQLite en een aparte audio-engine. Audio en opslag worden in hun eigen fases gevalideerd.
- Lever kleine werkende onderdelen op, met een zichtbaar resultaat aan het einde van iedere fase. Rond niet de hele app af voordat de gebruiker voor het eerst kan testen.
- De eerste audioproef bepaalt of de voorgestelde audio-aanpak voldoende kwaliteit levert. Stel ingrijpende audio-integratie niet uit tot na de interfacebouw.
- Test vanaf het begin op macOS en Windows. Een geslaagde Mac-test bewijst geen werkende Windows-versie.

## 2. Overzicht van de fasering

| Fase | Afzonderlijk resultaat | Wat de gebruiker kan beoordelen | Afhankelijk van |
| --- | --- | --- | --- |
| 0 | Startbare desktopbasis op Mac en Windows. | Openen en installeren van een eerste proefapp. | Startopdracht en bevestigde werkhypothese. |
| 1 | Losse audioproef met tempo, toonhoogte en A/B-loop. | Klank, vertragen, versnellen en een lastig fragment loopen. | 0. |
| 2 | Werkende schermindeling met voorbeeldgegevens. | Ruimteverdeling, leesbaarheid, navigatie en bediening. | 0; afronding na beoordeling van 1. |
| 3 | Opgeslagen oefeningenbibliotheek met BPM-analyse. | Eigen MP3, afbeelding en opdracht toevoegen en terugvinden. | 1 en 2. |
| 4 | Rondje-editor met tabel en totale duur. | Een eigen tempo-opbouw invoeren en opslaan. | 3. |
| 5 | Volledig rondje afspelen, onderbreken en hervatten. | De dagelijkse oefenervaring met echte bestanden. | 1, 3 en 4. |
| 6 | Evaluatie en betrouwbare sessiehistorie. | Volgende sessie aanpassen en resultaten bewaren. | 5. |
| 6B | Direct starten met eigen gegevens, zonder voorbeeldschermen. | Een duidelijke dagelijkse app en eerste gebruik met een lege bibliotheek. | 3–6 en de aanvullingen tot v0.0.11. |
| 7 | Dashboard op basis van echte sessies. | Motivatie, begrijpelijkheid en zinvolle voortgang. | 6 en 6B. |
| 8 | Geteste distributieversie voor beide platforms. | Zelfstandig installeren en delen met een proefgebruiker. | 0–7. |

Fase 6B is geleverd in v0.0.12, het recente sessieoverzicht in v0.0.13 en fase 7 in v0.0.14. Na gebruiksfeedback volgt fase 8. De fasen zijn controleerbare mijlpalen, geen schattingen in dagen. Na de eerste audioproef kan de resterende inspanning beter worden ingeschat.

## 3. Fases en acceptatie

### Fase 0 — Desktopbasis en vroege platformcontrole

Maak een minimale startbare app, een ontwikkelworkflow, een eerste proefpakket per platform en een duidelijke scheiding tussen interface, audio, rondjelogica en opslag. Gebruik nog geen persoonlijke mediabestanden als meegeleverde testinhoud.

Controle: de app start op de afgesproken Mac en Windows-computer, kan afsluiten en opnieuw openen, en toont een eenvoudige basispagina. Leg geteste OS-versies en architecturen vast. Test waar mogelijk meteen offline en als verpakte app, niet alleen als ontwikkelvenster.

Beslismoment: bevestig bij de start de technische werkhypothese en de beschikbare Windows-testmogelijkheid. Als een platform niet beschikbaar is, blijft die controle expliciet open; claim geen ondersteuning op basis van alleen een geslaagde build.

### Fase 1 — Audio eerst

Een kleine testspeler kan een MP3 laden, afspelen, pauzeren, opnieuw starten en zoeken. Tempo en toonhoogte werken onafhankelijk. A/B-markers begrenzen een loop. Een tijdelijke bpm-invoer is voldoende; automatische herkenning komt in fase 3.

Controleer met synthetische testaudio of tempoverandering de duur wijzigt zonder de gemeten toonhoogte te veranderen, en of transpositie de toonhoogte wijzigt zonder de duur te veranderen. Controleer ook de combinatie. Beluister echte oefeningen: losse noten, akkoorden en ritmische passages, waaronder de bedoelde langzaamste tempi. Herhaal korte loops lang genoeg om gaten, klikken of drift op te merken. Test pauze, zoeken en loopgrenzen bij gewijzigd tempo op beide platforms.

Demo: de gebruiker probeert eigen oefenaudio met verschillende tempi en toonhoogten. Leg het bruikbare bereik en bekende kwaliteitsgrenzen vast. Als de gekozen engine niet voldoet, pas de techniek hier aan voordat de rest erop wordt gebouwd. Hergebruik de geslaagde engine in de uiteindelijke speler.

### Fase 2 — Interface en design in werkende componenten

Vertaal de goedgekeurde beelden naar herbruikbare componenten: navigatie, panelen, knoppen, getalvelden, tabel, opdrachtvak en spelerbediening. Maak de bibliotheek, editor, speler, evaluatie en voortgang doorloopbaar met herkenbaar gemarkeerde voorbeeldgegevens. Het dashboard toont hier nog geen echte voortgang.

Feedback op v0.0.3: de speler moet het volledige oefenrondje als compacte afspeellijst tonen, met de huidige oefening gemarkeerd. Dit ontbreekt nog in de schermproef en moet zichtbaar worden uitgewerkt; het functionele document beschrijft het rondje als een verzameling oefeningen, niet als één oefening.

Controle: beoordeel venstergroottes, lange opdrachten, ontbrekende tablatuur, focusvolgorde, leesbaarheid en contrast. Controleer dat toetsenbediening invoervelden niet verstoort. Vergelijk vooral het speelscherm met de goedgekeurde render: de speler en tablatuur krijgen ruime plaats, de opdracht blijft direct leesbaar.

Demo: een klikbare app waarin de gebruiker de schermindeling en bediening kan beoordelen. Dit is het goedkoopste moment om ruimteverdeling en componenten bij te sturen. Renders zijn geen vervanging voor deze controle in een echt venster.

### Fase 3 — Eigen oefeningen importeren en bewaren

Voeg MP3-import, optionele afbeelding, geschreven opdracht en het brontempo toe. Kopieer media naar de appbibliotheek. Voeg BPM-herkenning in een achtergrondtaak toe, met handmatige correctie. Bewaar gedetecteerd en bevestigd tempo afzonderlijk. Kies de detector op kwaliteit, licentie en onderhoud.

Controle: importeer meerdere eigen oefeningen, sluit de app en open opnieuw. Verplaats het originele bronbestand en controleer of de bibliotheekkopie nog werkt. Test zonder afbeelding, met lange tekst, een onleesbaar bestand en mislukte BPM-analyse. De gebruiker kan bij mislukte analyse een tempo invoeren. Vergelijk bekende tempi met herkende waarden, inclusief mogelijke half/dubbeltellingen. Test dat analyse de interface niet blokkeert.

Demo: de gebruiker bouwt een kleine eigen bibliotheek en beluistert oefeningen met de engine uit fase 1. Opslag van rondjes en voortgang is nog niet nodig om deze fase te beoordelen.

Stand 10 oktober 2026: v0.0.4 levert de eigen bibliotheek en een eerste BPM-detector. Zie `docs/FASE-3.md` voor proefstappen en automatische controles. Een vergelijking met meerdere echte oefeningen, muzikale luisterbeoordeling en de Windows-gebruikstest blijven open; de detector is nog niet als algemeen betrouwbaar geaccepteerd. De gebruiker kan nu de bibliotheek proberen voordat fase 4 wordt gebouwd.

### Fase 4 — Rondjes samenstellen in de tabel

Maak rondjes met geordende oefenblokken en stappen. Iedere stap heeft een fragment of volledige track, een aantal herhalingen en een BPM. Voeg toonhoogte per stap toe zodra die open functionele keuze is bevestigd. Ondersteun toevoegen, wijzigen, verwijderen, verplaatsen, opslaan en opnieuw openen. Bereken de totale duur direct.

Controle: dezelfde oefening heeft in twee rondjes een verschillende opbouw zonder elkaar te wijzigen. Een 60 seconden lange brontrack van 120 BPM duurt op 60 BPM 120 seconden; tweemaal een bronfragment van 10 seconden op half tempo duurt samen 40 seconden. Een toonhoogtewijziging verandert de duur niet. Test ongeldige fragmentgrenzen, herhalingen en tempi. Controleer de volgorde na opslaan en heropenen.

Demo: de gebruiker voert bijvoorbeeld 1×75, 2×95 en 1×85 BPM in en maakt daarnaast een warming-up met dezelfde oefening. Dit moment bepaalt of de tabel praktisch genoeg werkt.

Stand 10 oktober 2026: v0.0.5 biedt opgeslagen rondjes met expliciete oefenblokken en eigen stappen, fragmenten en direct berekende duur. Toonhoogte per stap blijft een open keuze. Zie `docs/FASE-4.md` voor controles en proefstappen.

### Fase 5 — Rondje uitvoeren en tijdelijk fragmenten oefenen

Verbind editor en bibliotheek met de speler. Voer stappen en herhalingen automatisch uit. Toon actuele speelbeurt en resterende geplande tijd. Maak pauzeren, opnieuw en overslaan bruikbaar. Voeg de tijdelijke fragmentstand toe met behoud van de rondjestoestand en een duidelijke actie om terug te keren.

Controleer ook een rondje met meerdere verschillende oefeningen: alle oefeningen staan in de afspeellijst, de huidige is gemarkeerd en afgeronde oefeningen krijgen hun status. Na de evaluatie laadt de speler de volgende oefening automatisch met haar eigen opbouw; na de laatste oefening wordt het hele rondje afgerond. Tijdens vrije fragmenttraining blijft deze rondjecontext behouden.

Controle: de voorbeeldopbouw speelt exact vier keer in de juiste volgorde. Onderbreek de tweede speelbeurt, verander fragment, tempo en toonhoogte, en keer terug: de oorspronkelijke instellingen worden hersteld en de onderbroken speelbeurt begint opnieuw. Fragmentloops tellen niet als geplande herhalingen. Controleer pauzeren, de laatste herhaling, meerdere onderbrekingen en toetsenbediening tijdens echte audio. Tijdregistratie scheidt afspelen, pauze en fragmenttraining.

Demo: de gebruiker voert een compleet eigen rondje uit. Dit is het belangrijkste moment om het dagelijkse gebruik te beoordelen. Tot fase 6 kan een eenvoudige tijdelijke ‘Verder’-actie de overgang na een oefening verzorgen; deze wordt niet als definitieve evaluatie opgeleverd.

Stand 10 oktober 2026: v0.0.6 verbindt echte rondjes met de speler en vrije fragmenttraining. De terugblik gebruikt de geplande tijdelijke Verder-actie; resultaten worden nog niet opgeslagen. Zie `docs/FASE-5.md` voor bediening, controles en beperkingen. De gebruiker heeft daarna het evaluatiemoment, de BPM-aanpassing per oefenblok en uitsluiting van evaluatiepauzes afgestemd; zie fase 6.

### Fase 6 — Evaluatie en sessiehistorie

Maak de korte evaluatie, direct herhalen en aanpassen van de volgende sessie. Bewaar werkelijk gespeelde instellingen, afgeronde speelbeurten, context van het fragment en eventuele notities. Bewaar historie als een momentopname; wijzigingen aan een rondje mogen oude resultaten niet herschrijven.

Controle: ‘Nog een keer’ voert dezelfde opbouw opnieuw uit. ‘Volgende keer sneller’ beïnvloedt alleen het bedoelde oefenblok binnen het gebruikte rondje. Een tweede rondje met dezelfde oefening blijft gelijk. Voorkom dubbel opslaan bij herhaald klikken. Test afsluiten en heropenen na bewaren. Leg ook onvoltooide sessies herkenbaar vast; laat ze niet als volledig afgerond meetellen.

Demo: de gebruiker evalueert, sluit de app, opent opnieuw en ziet de gekozen opbouw voor de volgende sessie. Stem vóór deze fase de definitieve beoordelingskeuzes, BPM-aanpassing en definitie van werkelijk geoefende tijd af in `FUNCTIONEEL.md`.

Stand 10 oktober 2026: v0.0.7 biedt de evaluaties en sessiehistorie. Een serie bestaat uit aaneengesloten stappen van hetzelfde fragment, met alle tempo’s en herhalingen. BPM-aanpassing geldt voor alle stappen van één oefenblok in dit rondje; de lopende sessie houdt haar momentopname. Werkelijk oefenen is rondje-afspelen plus vrije fragmenttraining, zonder pauzes, evaluatie of laden. Zie `docs/FASE-6.md` voor controles en beperkingen. Beoordeel deze fase vóór het dashboard.

### Fase 6B — Eigen bibliotheek als vaste omgeving

Op 11 oktober 2026 vraagt de gebruiker expliciet om een afzonderlijke fase voor het verwijderen van de voorbeeldschermen en direct starten in de eigen omgeving. Deze fase komt vóór het dashboard en is geleverd in v0.0.12; zie `docs/FASE-6B.md`.

Open de app direct op Mijn oefensessies met de eigen bibliotheek. Verwijder de voorbeeldschermen, fictieve oefeningen/grafieken en de omschakelknoppen Eigen bibliotheek bekijken en Voorbeeldschermen bekijken uit de dagelijkse app. De losse Audioproef blijft beschikbaar als apart hulpmiddel.

Een lege bibliotheek toont een duidelijke eerste stap: een eigen MP3 toevoegen. Met bestaande gegevens zijn oefeningen, fragmenten, sessie-opbouwen en historie direct beschikbaar. Tot fase 7 toont Voortgang de echte sessiehistorie en geen voorbeeldgrafieken. Historische designrenders en testfixtures mogen als ontwikkelmateriaal bewaard blijven, zonder toegang vanuit de app.

Controle: start met een lege bibliotheek en met bestaande gegevens; importeer een oefening, maak een sessie, speel, onderbreek, bewaar een fragment, hervat, evalueer en bekijk de historie. Sluit en heropen de app. Controleer dat er geen voorbeeldroute of omschakelknop overblijft en dat de upgrade geen eigen gegevens wijzigt of verwijdert. Pas bestaande desktoptests aan zodat ze direct de eigen omgeving gebruiken.

Demo: de gebruiker opent de app en kan meteen met de eigen oefeningen aan de slag, zonder eerst een omgeving te kiezen. Geef ruimte voor feedback voordat fase 7 start.

### Fase 7 — Motiverend dashboard

Gebruik opgeslagen sessies voor oefendagen, oefentijd, tempo-ontwikkeling en recente resultaten. Toon context van oefening, rondje en volledige track of fragment. Gebruik het goedgekeurde dashboarddesign zonder prestaties te suggereren die niet uit de gegevens volgen.

Controle: vergelijk totalen met een kleine bekende set sessies. Test lege historie, één sessie, meerdere rondjes, dezelfde oefening met verschillende fragmenten en onvoltooide sessies. Vergelijk een fragment van 100 BPM niet met een volledige track van 90 BPM als dezelfde prestatie. Verander achteraf een rondje en controleer dat de eerdere grafiekgegevens gelijk blijven. Sla datums op en toon ze met een consistente lokale dagindeling.

Demo: de gebruiker ziet eigen oefenresultaten in plaats van alleen voorbeeldgrafieken. Beoordeel welke vergelijkingen motiveren en of de toelichting begrijpelijk is.

### Fase 8 — Afronden voor dagelijks gebruik en delen

Maak geteste installatiepakketten voor macOS en Windows. Loop de volledige route door: installeren, importeren, rondje maken, oefenen, onderbreken, evalueren en voortgang bekijken. Controleer een upgrade met bestaande gegevens. Lever een korte handleiding, bekende beperkingen en vereiste licentieteksten mee.

Controle: voer de route op beide doelplatforms uit met een schone installatie en bestaande gegevens. Controleer offline gebruik, paden met spaties, ontbrekende media, fouten bij bewaren en de werking van meegeleverde audiobestanden/wasm-modules in een verpakte app. Controleer dat een update de bibliotheek en historie behoudt.

Demo: een proefgebruiker kan zelfstandig installeren en een rondje uitvoeren. Bespreek ondertekening en de distributievorm vóór publicatie. Deze fase voegt geen account of cloudsynchronisatie toe. Export/import van een reservekopie blijft een apart voorstel; maak de lokale gegevenslocatie in ieder geval duidelijk en werk bij een gewenste backupfunctie eerst het functionele document bij.

## 4. Onderdelen die afzonderlijk ontwikkeld en getest kunnen worden

| Onderdeel | Testen zonder de rest van de app |
| --- | --- |
| Audio-engine | Testpagina met bronbestand, bpm, toonhoogte en loopgrenzen. |
| BPM-detector | Reeks tracks met bekende of gecontroleerde tempi; geen rondje nodig. |
| Rondjelogica | Gesimuleerde audio-eindegebeurtenissen: volgorde, tellers, pauze, fragmentstand en herstel. |
| Duurberekening | Kleine berekeningen met bekende bronduur, bpm en herhalingen. |
| Opslag | Tijdelijke testdatabase en mediabestanden, heropenen en schema-upgrade. |
| Interfacecomponenten | Voorbeeldgegevens voor normaal, leeg, fout, focus en lange inhoud. |
| Dashboardberekeningen | Kleine bekende sessiehistorie, los van de grafische weergave. |

Spreek de gegevens en commando's tussen deze onderdelen vroeg af. Zo kan de interface met voorbeeldgegevens worden beoordeeld terwijl audio of opslag nog wordt aangesloten. Dit beschrijft scheiding van onderdelen; het is geen opdracht om subagents of extra chats te starten.

## 5. Werkwijze per oplevering

1. Benoem vooraf welk onderdeel en welke open functionele keuzes bij de fase horen.
2. Bouw één beperkte, werkende stap; werk functionele of designwijzigingen direct in de juiste documenten bij.
3. Voer gerichte automatische controles uit voor berekeningen, opslag en toestandsovergangen, en handmatige controles voor klank en interactie.
4. Lever een startbaar resultaat met een kort testschema, uitgevoerde controles en expliciet ongeteste platformen of beperkingen.
5. Commit en push code en documentatie. Bewaar geen persoonlijke oefenbestanden of database in Git. Zorg dat het gedemonstreerde resultaat via zijn commit terug te vinden is.
6. Geef de gebruiker gelegenheid om de fase te proberen en stuur bij voordat de volgende grote fase wordt uitgevoerd. Vraag niet voor iedere kleine implementatiekeuze opnieuw toestemming.

Rond een fase pas af als de betreffende acceptatiepunten aantoonbaar zijn gecontroleerd. Een screenshot bewijst de vormgeving; een geslaagde build bewijst nog geen afspeelkwaliteit. Voer brede herhalingstests vooral uit na integratie en vóór distributie.

## 6. Nog af te stemmen vóór de betreffende bouwfase

- Start: definitieve technische richting en beschikbare Mac/Windows-testomgeving.
- Audio en editor: ondersteund tempo-/toonhoogtebereik, halve tonen en toonhoogte per stap.
- Rondje: pauzes en aftellen, definitieve sneltoetsen en tijdregistratie.
- Evaluatie: cijferbeoordelingen 1–5, opeenvolgende toetsenstappen en standaard 5 BPM zijn vastgesteld en toegevoegd in v0.0.9. Het evaluatiemoment en de BPM-aanpassing per oefenblok blijven zoals afgesproken.
- Distributie: ondersteunde OS-versies, ondertekening en eventueel backup/export.

Bespreek de resterende keuzes bij de fase waar ze nodig zijn en leg de uitkomst vast. De gebruiker heeft inmiddels opdracht gegeven te beginnen; de fases blijven afzonderlijk beoordeelbaar.


### Aanvulling vóór fase 7 — Benoemde fragmenten (v0.0.11)

Op verzoek zijn fragmentbeheer bij oefeningen, dezelfde fragmentkeuze en tijdinvoer in voorbeeld- en eigen sessietabellen en bewaren vanuit vrije fragmenttraining toegevoegd. Bestaande sessies behouden hun instellingen. Zie `docs/FRAGMENTEN.md` voor proefstappen en controles. Gebruiksfeedback op deze aanvulling komt vóór het dashboard.


### Aanvulling na fase 6B — Recente oefensessies (v0.0.13)

De gebruiker heeft een startoverzicht met maximaal tien recente sessies goedgekeurd. Bij meer dan tien verschijnt Alle oefensessies met zoeken. Starten en Bewerken zijn gescheiden; de tabel opent alleen op verzoek. Na spelen komt het overzicht terug. Controleer de grens tien/elf, zoeken, recent sorteren, directe start, bewaren/heropenen en bescherming van onopgeslagen wijzigingen. Zie `docs/SESSIEOVERZICHT.md`. Daarna blijft fase 7 de volgende grote fase.


### Oplevering fase 7 — v0.0.14

De gebruiker heeft opdracht gegeven voor het dashboard. Voortgang toont echte oefentijd, oefendagen, sessies, dagbalken, contextgebonden tempo-punten, beoordelingen en historie. Week/maand/alle tijd gebruiken dezelfde filtering; geplande en vrije training blijven gescheiden. Zie `docs/FASE-7.md` voor betekenis van de cijfers en controles. Geef ruimte voor feedback voordat fase 8 (afronden en delen) start.

### Tussenstap vóór verdere distributie — v0.0.15

Op verzoek: losse Audioproef verwijderen, Bibliotheekmap openen naar Instellingen verplaatsen met uitleg over kopieën, en MP3-import uitbreiden met M4A AAC. Deze stap krijgt afzonderlijke opslag-, decoder-, import-, herstart- en navigatiecontroles. Zie docs/IMPORT-INSTELLINGEN.md. Dit rondt fase 8 nog niet af: installatieprogramma’s, externe distributie/licenties, ondertekening en echte Windows-gebruikstest blijven open.

### Release 1.0 — analyse ter goedkeuring (15 oktober 2026)

De gebruiker kiest expliciet eerst een analyse en plan voor de acht milestone-issues, vóór functionele implementatie. Zie [docs/RELEASE-1.0-ANALYSE.md](docs/RELEASE-1.0-ANALYSE.md) voor architectuur, componentimpact, afhankelijkheden, open keuzes en tests. Voorgestelde volgorde: #1 metronoom → #2 aftelmaat → #3 tablatuurvenster → #4 waveformselectie → #5 BPM → #7 export/import → #6 taal → #8 releaseautomatisering. Dit is een voorstel, geen afgeronde fase of toestemming om alle issues zonder tussenliggende acceptatie te bouwen.

De voorgestelde issuebranch-/PR-werkwijze staat in docs/AGENTS-VOORSTEL.md. AGENTS.md blijft in de analyse ongewijzigd. Na akkoord per issue een afzonderlijk testbaar resultaat en PR; geen zelfstandige merges. De bestaande Windows-/luistercontroles en distributiekeuzes blijven open.

Op 15 oktober 2026 keurt de gebruiker dit plan en de eerste drie uitgangspunten goed en geeft opdracht te starten. AGENTS.md neemt de nieuwe werkwijze over. Issue #1 wordt eerst afzonderlijk geïmplementeerd en getest; overige issues blijven gepland.

### Issue #1 — Metronoom-oefeningen (v0.0.17)

Eerste implementatie na akkoord: apart oefentype zonder audio, 3/4–4/4–6/8 met kwartnoot-BPM, 8 maten standaard en 1–128 per sessiestap, audioklokgestuurde klikjes en integratie in sessies/evaluaties/voortgang. Controlebewijs en handmatige stappen staan in docs/METRONOOM.md. Afzonderlijke issuebranch en PR; acceptatie en merge blijven bij de gebruiker. Issue #2 en verdere milestone-issues worden hierdoor niet automatisch afgerond.

Gebruiksfeedback op issue #1 verwerkt in v0.0.18: maten instellen en bewaren per metronoom-oefening, doorwerking naar sessies, upgrade met behoud van oude afwijkingen en historie. Dit corrigeert v0.0.17 binnen dezelfde issue-PR; issue #2 volgt pas na beoordeling van de metronoom.

### Issue #2 — Aftelmaat (v0.0.19)

Na gebruiksgoedkeuring van v0.0.18 is issue #2 afzonderlijk gebouwd: optionele aftelmaat per sessie, eigen maatsoort standaard 4/4, iedere geplande herhaling op haar BPM, onderscheidbaar geluid en eigen tijdregistratie. Geplande totale duur bevat voorbereiding; oefentijd/dashboard niet. De geaccepteerde metronoomcommit is de basis van de nieuwe issuebranch; niet zelfstandig mergen. De volgende grote stap blijft #3 (los tablatuurvenster), na gebruiksfeedback. Zie docs/AFTELMAAT.md.


Gebruiksfeedback op issue #2 wordt verwerkt in v0.0.20: aftellen en maatsoort per oefenblok, direct op de kopregel naast de oefennaam. Verschillende oefeningen in dezelfde sessie kiezen onafhankelijk hun aftelmaat. Migratie behoudt eerder ingestelde aftelmaten en historie. Dit is een correctie binnen #2, geen start van #3; zie docs/AFTELMAAT.md voor de controles.


### Issue #3 — Los tablatuurvenster (v0.0.21)

Na gebruiksgoedkeuring van v0.0.20 volgt het zelfstandige tablatuurvenster: verplaatsen/resize, actieve-oefeningsynchronisatie, beeldzoom/passend/fullscreen en sluiten zonder sessieonderbreking. Basis is de geaccepteerde issue-2-commit; niet zelfstandig mergen. Zie docs/TABLATUURVENSTER.md voor impact en controles. Geef ruimte voor gebruiksfeedback vóór issue #4 (waveformselectie).


### Issue #4 — Waveformselectie (v0.0.22)

Na gebruiksgoedkeuring van het tablatuurvenster volgt de interactieve audio-waveform: muisselectie, sleepbare A/B, horizontaal zoom/pan en looppreview met bestaande fragmentopslag/hervatting. Basis is de geaccepteerde issue-3-commit; niet zelfstandig mergen. Zie docs/WAVEFORM.md voor impact en controles. Geef ruimte voor gebruiksfeedback vóór #5 (BPM-detectie en gehele weergave).


### Issue #5 — BPM-herkenning en gehele weergave (v0.0.23)

Na gebruiksgoedkeuring van de waveformselectie: onderzoek/benchmark van halve/dubbele missers, beperkte detectorcorrectie, snelle handmatige halve/dubbele keuze en interfacebrede gehele BPM-weergave met behoud van interne precisie. Zie docs/BPM.md voor meetresultaten en controles. Basis is de geaccepteerde issue-4-commit; niet zelfstandig mergen. Geef ruimte voor feedback vóór #7 (offline oefening export/import), daarna #6 en #8.

### Issue #7 — Oefeningen delen met makervermelding (v0.0.24)

Na gebruiksgoedkeuring van v0.0.23 volgt één offline deelbestand per oefening, importpreview met hernoemen/waarschuwing en toevoeging zonder overschrijven. Aanvullend gebruikersverzoek: optionele informele makernaam/boodschap die na import zichtbaar blijft en bij herexport wordt voorgesteld. Zie docs/OEFENING-DELEN.md voor impact, exportspecificatie en controles. Basis is de geaccepteerde issue-5-commit; niet zelfstandig mergen. Geef ruimte voor feedback vóór #6 (taalkeuze), daarna #8 (distributie).

### Issue #6 — Nederlands en Engels (v0.0.25)

Na acceptatie van v0.0.24 volgt volledige lokalisatie met systeemtaalfallback, expliciete bewaarde keuze in Instellingen en directe wisseling zonder verlies van speler-/formulierstatus. De paginakop biedt dezelfde keuze tijdens het spelen. Eigen inhoud en historie blijven ongewijzigd. Zie docs/TAALKEUZE.md voor impact en controles. Basis is de geaccepteerde issue-7-commit; niet zelfstandig mergen. Geef ruimte voor gebruiksfeedback vóór #8 (afronden/distributie).

### Tussenstap — Info over HITtheBeat (#17, v0.0.26)

Na goedkeuring van de taalkeuze vraagt de gebruiker een Info-knop met concept en puntsgewijs functieoverzicht. Afzonderlijke, testbare verbetering op de geaccepteerde issue-6-commit: NL/EN-infovenster, appversie, toetsenbediening en behoud van sessie/invoer. Dit rondt distributie (#8) niet af. Zie docs/INFO.md voor impact en controles; niet zelfstandig mergen.


### Eerste testrelease — #8 gedeeltelijk, 1.0.0-rc.1

De gebruiker accepteert v0.0.26 en vraagt expliciet de eerste release. Lever handmatig een GitHub-pre-release met Mac arm64 DMG/ZIP en Windows x64 ZIP, checksums en Windows-testoverdracht. Geen autonome merge. De nieuwe tag verwijst naar de releasebranch met alle geaccepteerde wijzigingen. #8 blijft open: PR-/tag-automatisering, Windows-installer en daadwerkelijke Windows-gebruikstest volgen. Zie docs/RELEASE.md voor bewijs/beperkingen en docs/WINDOWS-TEST.md voor de volgende platformstap.

### Windows-herstelkandidaat — 1.0.0-rc.2

Na de Windows-test van de exacte RC1-tag heeft de gebruiker herstel van de tablatuur/fullscreen-fout en drie testharnasproblemen goedgekeurd. Werk vanaf RC1 op `codex/issue-8-windows-rc2` en lever een afzonderlijke PR naar de releasebranch, zonder zelfstandige merge of vervanging van RC1. Windows-regressie, pakketten en installer/upgradecontrole staan in docs/RC2-WINDOWS.md; historische bevindingen in docs/WINDOWS-RC1-RESULTATEN.md. Mac-regressie, muzikale beoordeling en CI/tag-automatisering blijven afzonderlijk open; dit rondt #8 niet af.


### Interfacevereenvoudiging — issue #21

Op basis van Windows-RC2: taalkeuze uitsluitend in Instellingen en verwijderen naast importeren in de bibliotheektoolbar. Afzonderlijke PR naar de RC2-branch; geen automatische merge of release. Typecheck/productiebouw en zes gerichte Electron-tests (taal, bibliotheek/verwijderen en delen/importeren) slagen op Mac met geïsoleerde testgegevens. Geen volledige testreeks of herhaalde Windows-test voor deze plaatsingswijziging. Zie FUNCTIONEEL hoofdstuk 36.


### Definitieve release — 1.0.0 (#8 gedeeltelijk)

Na acceptatie van #21 vraagt de gebruiker definitieve Mac- en Windows-installers. Basis is #21 inclusief Windows-RC2, versie 1.0.0. Mac arm64 DMG/ZIP lokaal bouwen en controleren; Windows x64 NSIS/ZIP native op Actions bouwen met gerichte pakket-/installatiecontrole. Publicatie van definitieve release expliciet geautoriseerd, zonder autonome PR-merge of vervanging van RC1. Windows-PR/tag-builds worden toegevoegd; volledige Mac-/tag-publicatieautomatisering blijft open onder #8. Zie docs/RELEASE.md en docs/RELEASE-1.0.0-NOTES.md; release-PR/Actions-run bevat de laatste uitslagen.


### Afsluiten milestone 1 — expliciete opdracht 17 oktober 2026

De gebruiker autoriseert samenvoegen van het goedgekeurde werk naar main en bijwerken van issues/milestone. Dertien app-/release-PR's zijn in afhankelijkheidsvolgorde samengevoegd; de appbron op main is gelijk aan v1.0.0. #8 krijgt de ontbrekende Mac-/gezamenlijke releaseautomatisering en gerichte PR-controles, met handmatige gate vóór installerjobs. Zie docs/RELEASE-AUTOMATISERING.md voor proces en controles. Geen nieuwe release of tagverplaatsing. Na groene CI is #8 gesloten en milestone 1 gecontroleerd afgesloten (tien gesloten, nul open issues). De oorspronkelijke automatische weigering voor PR #25 is gevolgd door expliciete gebruikerstoestemming om ook die PR samen te voegen.


### Procedure voor volgende releases — na afronding milestone 1 (#24)

De gebruiker bundelt maximaal tien GitHub-issues per nieuwe releasemilestone en geeft opdracht die te starten. Daarna zelfstandige issue-afhandeling en inhoudelijke goedkeuring met gerichte tests, zonder volledige regressie per issue. Binnen de gestarte milestone mogen geverifieerde PR's zelfstandig worden samengevoegd en afgeronde issues gesloten. Volledige gecureerde regressie uitsluitend in de releasefase; daarna verplicht handmatige eindcontrole door de gebruiker en expliciet akkoord vóór de automatische installerbuilds. Vervolgens gerichte pakketcontroles en publicatie zonder tweede routinematige toestemmingsvraag. De releasemilestone sluit pas na publicatie en administratieve controle. AGENTS.md beschrijft deze vastgestelde afspraken en testcuratie. Milestone 1 is inmiddels gesloten; PR #26 heeft de CI-scheiding en handmatige gate ingevoerd. De gebruiker heeft het samenvoegen van PR #25 expliciet bevestigd.


## Release 1.1.0 — gestart 17 oktober 2026

Scope: #28 evaluatie zonder opmerking, daarna #27 voortgangsoverzicht. Per issue gerichte tests, zelfreview, PR-merge en sluiten bij bewezen criteria. Vervolgens één volledige release-regressie op Mac/Windows en een testbare ontwikkelversie met vaste broncommit voor de handmatige eindcontrole. Nieuwe installers en publicatie wachten op expliciet gebruikersakkoord.

De twee issues zijn geïmplementeerd: #28 via PR #30 samengevoegd en gesloten na Mac/Windows-CI; #27 heeft alle negen criteria met gerichte data-/UI-controles afgehandeld en gaat naar PR-CI. Zie docs/RELEASE-1.1.0.md voor testmatrix en resultaten. De releasemilestone blijft open tot na de handmatige eindcontrole, installercontroles en publicatie.

#27 is via PR #31 samengevoegd en gesloten na groene Mac/Windows-CI (elk 20 Node-/14 desktoptests). Beide geselecteerde issues zijn gereed. Versievoorbereiding 1.1.0 en ontwikkelapp zijn klaar; de volledige release-regressie en vervolgens handmatige eindcontrole volgen nog. Milestone 2 blijft open tot geslaagde publicatie.

Release 1.1.0 is na de expliciete handmatige eindgoedkeuring op 17 oktober 2026 gepubliceerd. Volledige Mac/Windows-regressie: elk 111 Node- en 31 desktop-/audiotests; na akkoord uitsluitend vier gerichte installercontroles per platform. Conceptpublicatie gecontroleerd afgerond op dezelfde bestanden na een tag-opvraagfout. Publicatiescript en verslagen krijgen een gerichte afrondings-PR; geen appwijziging of herhaalde volledige regressie. Milestone 2 sluit na administratieve controle.


## Losse reparatie #36 — 24 oktober 2026

Op expliciet gebruikersverzoek buiten een nieuwe milestone: defensieve reparatie van A/B-slepen in de gedeelde waveformeditor, met gerichte regressie en reviewbare PR. Zie docs/WAVEFORM.md. Geen zelfstandige release, milestonewijziging of merge; praktijkcontrole op de betrokken Windows-machine staat open.


## Release 1.1.1 — voorbereiding 24 oktober 2026

Gebruiker heeft #37 gecontroleerd en merge/publicatie opgedragen. PR samengevoegd, #36 gesloten; gerichte CI groen op Mac/Windows (40079726724). Versie 1.1.1 wordt vastgezet voor volledige release-regressie, ontwikkelapp en verplichte menselijke eindcontrole vóór installers. Geen nieuwe milestone toegevoegd. Zie docs/RELEASE-1.1.1.md.


Release 1.1.1 is op 25 oktober 2026 na expliciete eindgoedkeuring gepubliceerd op vaste bron 4ff243d. Volledige Mac/Windows-regressie elk 120 Node-/32 desktoptests; vervolgens vier pakkettests per native installerjob. Publicatie en alle zeven assets gecontroleerd; run 40081653930 groen. Geen nieuwe milestone gestart. Verslag: docs/RELEASE-1.1.1.md.

## Release 1.2.0 — gestart 28 oktober 2026

Gebruiker autoriseert issues en milestone: #40 dashboardvoorkeuren/één tempolijn per oefening, #41 cijfers verwijderen, #42 voortgang wissen per oefening. Gerichte tests en merges per issue; één volledige release-regressie op vaste bron, ontwikkelapp en verplichte menselijke eindcontrole vóór installers. Milestone 3 blijft open tot publicatie. Zie docs/RELEASE-1.2.0.md.


#40–#42 zijn geïmplementeerd, gericht gecontroleerd en via PR #43/#44/#45 samengevoegd en gesloten. Versievoorbereiding 1.2.0 volgt: vaste bron → één volledige Mac/Windows-regressie → ontwikkelapp en menselijke eindcontrole → na akkoord installers/pakketcontroles/publicatie. Milestone 3 blijft open.


Release 1.2.0 gereed voor één menselijke eindcontrole: bron a56c71c047f607da355f056ad4eda4bb563dad79, run 40707188776; elk native platform 125 Node-/34 desktoptests groen. Testbare Mac-ontwikkelapp beschikbaar, dezelfde productcode; release-approval wacht. Geen installers/publicatie vóór expliciet akkoord, milestone 3 blijft open.


### Release 1.2.0 gepubliceerd — 28 oktober 2026

De gebruiker heeft de ontwikkelversie getest en expliciet akkoord voor release gegeven. Versie 1.2.0 is gepubliceerd vanuit bron `a56c71c047f607da355f056ad4eda4bb563dad79`: dashboardinstellingen en één tempografiek per oefening inclusief fragmenten, verwijderen van cijfers en beheer van bewaarde voortgang. Native Mac/Windows-regressie: elk 125 Node- en 34 desktop-/audiotests; daadwerkelijke pakketcontroles: elk vier geslaagd. Run 40707188776 is geslaagd; alle zeven releasebestanden en digests zijn gecontroleerd. Milestone 3 is na publicatie gesloten met drie gesloten issues (#40–#42) en nul open issues. Zie [releaseverslag](docs/RELEASE-1.2.0.md) en [downloads](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.2.0). Persoonlijke resultaten zijn niet door de agent verwijderd. Geen nieuwe milestone starten zonder gebruikersopdracht.


## Release 1.3.0 — milestone 4

Gestart op opdracht van 29 oktober 2026, scope #50–#53. Volgorde #51, #50, #53, #52 met gerichte controles/PR per issue. Zie docs/RELEASE-1.3.0.md voor analyse en testmatrix. Eén volledige releasegroep op vaste bron en daarna expliciete menselijke eindcontrole vóór installers; milestone blijft open tot publicatie.
