# HITtheBeat — Ontwikkelplan

Datum: 10 oktober 2026. Status: voorstel voor gefaseerde uitvoering; nog geen implementatie gestart.

## 1. Uitgangspunten

- Functioneel gedrag volgt `FUNCTIONEEL.md`.
- De goedgekeurde stijl en schermen volgen `DESIGN.md`: Studio donker, B — Mandarijn.
- Werkhypothese voor de techniek is het voorstel uit `TECHNISCH-ONTWERP.md`: Electron, React, TypeScript, SQLite en een aparte audio-engine. De technische richting is nog niet afzonderlijk definitief bevestigd.
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
| 7 | Dashboard op basis van echte sessies. | Motivatie, begrijpelijkheid en zinvolle voortgang. | 6. |
| 8 | Geteste distributieversie voor beide platforms. | Zelfstandig installeren en delen met een proefgebruiker. | 0–7. |

De fasen zijn controleerbare mijlpalen, geen schattingen in dagen. Na de eerste audioproef kan de resterende inspanning beter worden ingeschat.

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

Controle: beoordeel venstergroottes, lange opdrachten, ontbrekende tablatuur, focusvolgorde, leesbaarheid en contrast. Controleer dat toetsenbediening invoervelden niet verstoort. Vergelijk vooral het speelscherm met de goedgekeurde render: de speler en tablatuur krijgen ruime plaats, de opdracht blijft direct leesbaar.

Demo: een klikbare app waarin de gebruiker de schermindeling en bediening kan beoordelen. Dit is het goedkoopste moment om ruimteverdeling en componenten bij te sturen. Renders zijn geen vervanging voor deze controle in een echt venster.

### Fase 3 — Eigen oefeningen importeren en bewaren

Voeg MP3-import, optionele afbeelding, geschreven opdracht en het brontempo toe. Kopieer media naar de appbibliotheek. Voeg BPM-herkenning in een achtergrondtaak toe, met handmatige correctie. Bewaar gedetecteerd en bevestigd tempo afzonderlijk. Kies de detector op kwaliteit, licentie en onderhoud.

Controle: importeer meerdere eigen oefeningen, sluit de app en open opnieuw. Verplaats het originele bronbestand en controleer of de bibliotheekkopie nog werkt. Test zonder afbeelding, met lange tekst, een onleesbaar bestand en mislukte BPM-analyse. De gebruiker kan bij mislukte analyse een tempo invoeren. Vergelijk bekende tempi met herkende waarden, inclusief mogelijke half/dubbeltellingen. Test dat analyse de interface niet blokkeert.

Demo: de gebruiker bouwt een kleine eigen bibliotheek en beluistert oefeningen met de engine uit fase 1. Opslag van rondjes en voortgang is nog niet nodig om deze fase te beoordelen.

### Fase 4 — Rondjes samenstellen in de tabel

Maak rondjes met geordende oefenblokken en stappen. Iedere stap heeft een fragment of volledige track, een aantal herhalingen en een BPM. Voeg toonhoogte per stap toe zodra die open functionele keuze is bevestigd. Ondersteun toevoegen, wijzigen, verwijderen, verplaatsen, opslaan en opnieuw openen. Bereken de totale duur direct.

Controle: dezelfde oefening heeft in twee rondjes een verschillende opbouw zonder elkaar te wijzigen. Een 60 seconden lange brontrack van 120 BPM duurt op 60 BPM 120 seconden; tweemaal een bronfragment van 10 seconden op half tempo duurt samen 40 seconden. Een toonhoogtewijziging verandert de duur niet. Test ongeldige fragmentgrenzen, herhalingen en tempi. Controleer de volgorde na opslaan en heropenen.

Demo: de gebruiker voert bijvoorbeeld 1×75, 2×95 en 1×85 BPM in en maakt daarnaast een warming-up met dezelfde oefening. Dit moment bepaalt of de tabel praktisch genoeg werkt.

### Fase 5 — Rondje uitvoeren en tijdelijk fragmenten oefenen

Verbind editor en bibliotheek met de speler. Voer stappen en herhalingen automatisch uit. Toon actuele speelbeurt en resterende geplande tijd. Maak pauzeren, opnieuw en overslaan bruikbaar. Voeg de tijdelijke fragmentstand toe met behoud van de rondjestoestand en een duidelijke actie om terug te keren.

Controle: de voorbeeldopbouw speelt exact vier keer in de juiste volgorde. Onderbreek de tweede speelbeurt, verander fragment, tempo en toonhoogte, en keer terug: de oorspronkelijke instellingen worden hersteld en de onderbroken speelbeurt begint opnieuw. Fragmentloops tellen niet als geplande herhalingen. Controleer pauzeren, de laatste herhaling, meerdere onderbrekingen en toetsenbediening tijdens echte audio. Tijdregistratie scheidt afspelen, pauze en fragmenttraining.

Demo: de gebruiker voert een compleet eigen rondje uit. Dit is het belangrijkste moment om het dagelijkse gebruik te beoordelen. Tot fase 6 kan een eenvoudige tijdelijke ‘Verder’-actie de overgang na een oefening verzorgen; deze wordt niet als definitieve evaluatie opgeleverd.

### Fase 6 — Evaluatie en sessiehistorie

Maak de korte evaluatie, direct herhalen en aanpassen van de volgende sessie. Bewaar werkelijk gespeelde instellingen, afgeronde speelbeurten, context van het fragment en eventuele notities. Bewaar historie als een momentopname; wijzigingen aan een rondje mogen oude resultaten niet herschrijven.

Controle: ‘Nog een keer’ voert dezelfde opbouw opnieuw uit. ‘Volgende keer sneller’ beïnvloedt alleen het bedoelde oefenblok binnen het gebruikte rondje. Een tweede rondje met dezelfde oefening blijft gelijk. Voorkom dubbel opslaan bij herhaald klikken. Test afsluiten en heropenen na bewaren. Leg ook onvoltooide sessies herkenbaar vast; laat ze niet als volledig afgerond meetellen.

Demo: de gebruiker evalueert, sluit de app, opent opnieuw en ziet de gekozen opbouw voor de volgende sessie. Stem vóór deze fase de definitieve beoordelingskeuzes, BPM-aanpassing en definitie van werkelijk geoefende tijd af in `FUNCTIONEEL.md`.

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
- Evaluatie: exacte keuzes en welke stappen een BPM-aanpassing beïnvloedt.
- Distributie: ondersteunde OS-versies, ondertekening en eventueel backup/export.

Deze keuzes blokkeren het maken van dit plan niet. Bespreek ze bij de fase waar ze nodig zijn en leg de uitkomst vast. De huidige opdracht omvat het plan en de documentatie; starten met implementeren volgt op een volgende opdracht.
