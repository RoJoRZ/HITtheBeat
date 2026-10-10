# HITtheBeat — Functioneel document

Status: functionele uitgangspunten, bijgewerkt op 10 oktober 2026.

Dit document beschrijft het gewenste gedrag van HITtheBeat. Het bevat geen technisch ontwerp. Nieuwe en gewijzigde functionele afspraken worden steeds in dit document verwerkt en via Git bijgehouden.

## 1. Doel

HITtheBeat helpt een muzikant dagelijks gericht te oefenen met korte audiotracks, een persoonlijke tempo-opbouw en inzicht in de voortgang. Een opgeslagen verzameling oefeningen heet een **oefenrondje**.

De applicatie moet ten minste op macOS (MacBook) en Windows werken. Ontwikkeling moet mogelijk zijn met gratis gereedschappen en de app moet kunnen worden gedeeld met andere geïnteresseerden. Een mooie, strakke en overzichtelijke interface is onderdeel van het gewenste resultaat. Eventuele distributiekosten, zoals ondertekening van installatiebestanden, worden afzonderlijk afgewogen.

## 2. Oefeningenbibliotheek

Een oefening bevat:

- Een naam.
- Een kort MP3-bestand.
- Optioneel een afbeelding van tablatuur of bladmuziek.
- Een beschrijving met uitleg en belangrijke aandachtspunten.
- Het oorspronkelijke tempo in BPM.

Bij het toevoegen herkent de tool automatisch het tempo van de track. De muzikant kan het gevonden BPM controleren en handmatig corrigeren, bijvoorbeeld bij een intro, vrije timing of een dubbel of half geteld tempo.

De muzikant kan nieuwe oefeningen toevoegen en bestaande oefeningen gebruiken in meerdere oefenrondjes.

## 3. Tempo en toonhoogte

- Het afspeeltempo is instelbaar in BPM, zonder dat de toonhoogte verandert.
- Het instelbare bereik is **25–300% van het oorspronkelijke tempo**. Dit bereik is op 10 oktober 2026 door de gebruiker gekozen. Bijvoorbeeld: bij een bron van 120 BPM is het bereik 30–360 BPM. De klank bij extreme vertraging/versnelling wordt met eigen oefeningen beoordeeld.
- De toonhoogte is onafhankelijk instelbaar, zonder dat het tempo verandert.
- De speler toont het huidige tempo en de ingestelde toonhoogte.
- De beschrijving en eventuele afbeelding zijn tijdens het oefenen beschikbaar.
- Een toonhoogtewijziging verandert het geluid; de toegevoegde afbeelding wordt niet automatisch getransponeerd.

De precieze bediening en stapgrootte van de toonhoogte-instelling worden nog uitgewerkt. Stappen van een halve toon zijn het huidige voorstel.

## 4. Mijn oefenrondje

De muzikant kan een oefenrondje samenstellen, een naam geven, opslaan en opnieuw uitvoeren. Binnen het rondje kunnen oefeningen worden toegevoegd, verwijderd en verplaatst.

Een oefenrondje is een **geordende verzameling oefeningen**, bijvoorbeeld ‘Warming-up’ met Wisselslag, Pentatoniek en Akkoordwissels. Iedere oefening binnen dat rondje heeft haar eigen fragmentkeuze en tempo-opbouw met herhalingen. Het rondje is het geheel dat de muzikant start; de afzonderlijke afspeelstappen vormen de opbouw binnen de oefeningen.

### 4.1 Tempo-opbouw per oefening binnen een rondje

Een tempo-opbouw hoort bij de oefening **binnen het specifieke oefenrondje**, niet bij de oefening in de bibliotheek. Dezelfde oefening kan bijvoorbeeld rustig worden gespeeld in een warming-up en een uitdagende opbouw hebben in een ander rondje.

De opbouw bestaat uit geordende stappen met een tempo en een aantal speelbeurten. Een speelbeurt is één volledige keer afspelen van de track, of van het opgeslagen fragment als dat voor deze oefening in het rondje is geselecteerd.

Voorbeeld:

| Stap | Speelbeurten | Tempo |
| --- | ---: | ---: |
| Rustig beginnen | 1 | 75 BPM |
| Uitdagen | 2 | 95 BPM |
| Gecontroleerd afsluiten | 1 | 85 BPM |

Stappen kunnen worden toegevoegd, gewijzigd, verwijderd en verplaatst. De opbouw wordt met het rondje bewaard.

### 4.2 Tabelinvoer

Een oefenrondje kan via een bewerkbare tabel worden ingevoerd. Iedere rij beschrijft één stap van een oefening met de volgende gegevens:

- Oefening.
- Fragment: volledige track of begin- en eindtijd in de oorspronkelijke track.
- Aantal herhalingen.
- Gewenst tempo in BPM.

Voorstel: voeg een kolom toe voor de toonhoogteverschuiving per stap, uitgedrukt in halve tonen, met standaardwaarde 0 (oorspronkelijke toonhoogte). Hiermee kan dezelfde oefening in verschillende stappen ook een andere toonhoogte hebben. Deze keuze is nog niet definitief vastgesteld.

Rijen voor dezelfde oefening vormen samen de tempo-opbouw; de evaluatie volgt na de laatste stap van die oefening. De precieze weergave van deze groepering wordt nog uitgewerkt.

### 4.3 Geplande duur

De totale geplande oefenduur is steeds zichtbaar en wordt direct bijgewerkt bij wijzigingen in oefeningen, fragmenten, tempi of aantallen speelbeurten. Langzamer afspelen verlengt de duur van een speelbeurt.

Voorstel: instelbare pauzes tussen speelbeurten en een korte aftelling voor de start. Als deze worden opgenomen, tellen ze mee in de geplande duur. Evaluatiemomenten en vrije fragmenttraining hebben geen vaste duur en vallen buiten de geplande tijd.

## 5. Het rondje uitvoeren

Voor de start ziet de muzikant de oefeningen en de totale geplande duur. Tijdens het uitvoeren volgt de speler automatisch de opgeslagen volgorde en tempo-opbouw.

In afspeelmodus bevat de speler **het volledige gekozen oefenrondje als afspeellijst**. Een compact overzicht toont alle oefeningen in volgorde, met een herkenbaar onderscheid tussen afgerond, huidig en nog te doen. De huidige oefening is gemarkeerd, bijvoorbeeld ‘Oefening 2 van 3’. De tablatuur, opdracht en audiobediening horen bij die huidige oefening. De muzikant hoeft na een oefening niet zelf de volgende oefening in de speler te laden: na de evaluatie gaat hetzelfde rondje verder. Na de laatste oefening is het gehele rondje afgerond.

De speler toont:

- De huidige oefening met beschrijving en eventuele afbeelding.
- Het volledige rondje met de positie en status van iedere oefening.
- Het huidige tempo en de toonhoogte.
- De huidige speelbeurt en het aantal speelbeurten, bijvoorbeeld ‘Speelbeurt 3 van 4 · 95 BPM’.
- De resterende geplande oefentijd.

De muzikant kan starten, pauzeren, hervatten, de huidige speelbeurt opnieuw beginnen en een oefening overslaan. Na het voltooien van een oefening volgt een korte evaluatie voordat de volgende oefening begint.

Het speelscherm geeft vooral ruimte aan de speler en de tablatuur of bladmuziek. De geschreven opdracht en aandachtspunten staan in een eigen, duidelijk leesbaar tekstvak bij de oefening. Voorstel voor de schermopbouw: een groot tablatuurvlak met de opdracht ernaast en een brede speler eronder. De tabel voor het samenstellen van een rondje hoort bij de editor en neemt geen prominente ruimte in het speelscherm in.

### 5.1 Toetsenbediening

De speler is met toetsen te bedienen. Gewenste voorbeelden zijn spatie voor afspelen/pauzeren en toets 1 voor terug naar het begin. De definitieve toetsindeling wordt nog uitgewerkt.

Voorstel: toets 1 gaat naar het begin van de huidige speelbeurt, of naar marker A tijdens fragmenttraining. Sneltoetsen mogen het invoeren van tekst en getallen in de tabel of andere invoervelden niet verstoren. Ze zijn standaard actief wanneer de app het actieve venster is.

## 6. Fragmentherhaling en tijdelijk onderbreken

Fragmentherhaling is onderdeel van de eerste versie. De muzikant kan een lastige passage isoleren met een beginmarker **A** en eindmarker **B** en de loopfunctie inschakelen. De markers kunnen worden aangepast en de selectie kan worden opgeheven om weer de volledige track te spelen.

### 6.1 Vrije fragmenttraining tijdens een rondje

1. De muzikant onderbreekt een oefening en kiest ‘Fragment oefenen’.
2. HITtheBeat onthoudt de huidige oefening, speelbeurt en instellingen van de tempo-opbouw.
3. De muzikant stelt A en B in en oefent het fragment in een doorlopende loop. Tempo en toonhoogte kunnen vrij worden aangepast.
4. De geplande opbouw blijft wachten. Fragmentherhalingen tellen niet als geplande speelbeurten.
5. Met ‘Verder met mijn rondje’ worden de oorspronkelijke instellingen hersteld. De onderbroken speelbeurt begint opnieuw; daarna vervolgt het rondje de geplande opbouw.

De vrije fragmenttraining heeft geen vaste eindtijd. De tijd telt mee als werkelijk bestede oefentijd. De resterende geplande tijd blijft apart zichtbaar.

### 6.2 Een fragment opslaan in een rondje

Een oefening binnen een rondje kan ook vooraf worden ingesteld op een geselecteerd fragment in plaats van de volledige track. De fragmentkeuze wordt bij die oefening binnen dat rondje opgeslagen. Iedere geplande speelbeurt speelt dan het fragment eenmaal af; de geplande duur wordt daarop berekend.

Dit staat los van het tijdelijk onderbreken voor vrije fragmenttraining.

## 7. Korte evaluatie

Na iedere oefening kan de muzikant aangeven wat er nu of de volgende keer moet gebeuren:

| Actie | Gedrag |
| --- | --- |
| Nog een keer | Dezelfde oefening met dezelfde opbouw direct opnieuw uitvoeren. |
| Volgende keer hetzelfde | De huidige opbouw behouden. |
| Volgende keer sneller | De opbouw voor de volgende sessie verhogen met een gekozen aantal BPM. |
| Volgende keer rustiger | De opbouw voor de volgende sessie verlagen met een gekozen aantal BPM. |

‘Volgende keer’ geldt ook als de muzikant een dag overslaat. Aanpassingen gelden voor de oefening binnen het gebruikte rondje.

Voorstel: een tempoverhoging of -verlaging verschuift standaard alle stappen met hetzelfde aantal BPM. Voor het opslaan toont de tool de nieuwe opbouw ter bevestiging, bijvoorbeeld ‘75 → 80 · 95 → 100 · 85 → 90 BPM’.

Voorstel voor een korte beoordeling: **Nog lastig · Ging goed · Voelt vertrouwd**, met een optionele notitie. Zo kan de voortgang onderscheid maken tussen een tempo spelen en dat tempo beheersen. De exacte evaluatiekeuzes worden nog definitief vastgesteld.

## 8. Voortgang en motiverend dashboard

Voortgang en een motiverend dashboard zijn onderdeel van de eerste versie.

Per oefensessie bewaart HITtheBeat:

- De datum en werkelijk bestede oefentijd.
- De gespeelde tempi en het aantal afgeronde speelbeurten.
- Het gebruikte oefenrondje.
- Of de volledige track of een fragment is geoefend, inclusief herkenbare fragmentselectie.
- De evaluatie en eventuele notitie.

Vrije fragmenttraining wordt apart herkenbaar vastgelegd. Een fragment op 100 BPM mag niet worden voorgesteld als het beheersen van de volledige oefening op 100 BPM. Ook blijven resultaten uit verschillende rondjes herkenbaar.

Het dashboard geeft inzicht in:

- De dagen waarop is geoefend.
- De bestede oefentijd, bijvoorbeeld per week.
- De BPM-ontwikkeling per oefening door de tijd heen, met context van fragment, rondje en evaluatie.
- Persoonlijke vooruitgang, waar de opgeslagen resultaten een zinvolle vergelijking toelaten.
- Het rondje en de bewaarde aanpassingen voor een volgende sessie.

Het dashboard ondersteunt motivatie zonder alleen hogere snelheden als succes te behandelen. Controle, nauwkeurigheid en speelgemak zijn eveneens relevante resultaten.

## 9. Omvang van de eerste versie

De eerste versie omvat de oefeningenbibliotheek, MP3 met optionele afbeelding en beschrijving, automatische BPM-herkenning met correctie, onafhankelijke tempo- en toonhoogteaanpassing, opgeslagen oefenrondjes met een eigen tempo-opbouw per oefening, zichtbare geplande en werkelijk bestede tijd, fragmentherhaling met onderbreken en hervatten, korte evaluaties, opgeslagen voortgang en het dashboard.

Mogelijke latere uitbreidingen zijn labels voor oefeningen, rondjes samenstellen op basis van een tijdsbudget en een verkorte versie van een rondje. Deze behoren nog niet tot de vastgestelde eerste versie.

## 10. Nog uit te werken keuzes

- De precieze toonhoogtebediening.
- Toonhoogteverschuiving per tabelrij en de groepering van stappen in de tabel.
- De definitieve toetsindeling en het precieze gedrag van terug naar het begin.
- Pauzes en aftellen voor speelbeurten.
- De definitieve evaluatiekeuzes en de manier waarop een BPM-wijziging op meerdere stappen wordt toegepast.
- De concrete presentatie en vergelijkingen in het dashboard.

Deze punten worden functioneel uitgewerkt voordat ze als definitieve eisen worden behandeld.

## 11. Afzonderlijk beoordeelbare audioproef (fase 1)

De audioproef v0.0.2 demonstreert MP3-afspelen, onafhankelijk tempo/toonhoogte, zoeken, pauze en A/B-loop. Een zelf opgewekte voorbeeldmelodie en WAV-import dienen alleen om de proef eenvoudig te testen. Er is nog geen opslag van oefeningen of rondjes en het oorspronkelijke BPM wordt handmatig ingevoerd.

Voorlopige bediening in de proef: spatie voor afspelen/pauzeren; 1 voor trackstart of A bij actieve loop. Tijdens invoer of focus op knoppen blijven de normale toetsen werken. Getallen worden bevestigd met Enter of bij het verlaten van het veld. A/B kan via bronseconden of knoppen op de huidige afspeelpositie. Bij inschakelen van een loop buiten het gekozen fragment begint de speler bij A. Verlaten van de audioproef of laden van een nieuw bestand stopt de oude audio.

Actueel tempobereik sinds v0.0.3: 25–300% (in v0.0.2 was dit 50–200%), toonhoogte −12 tot +12 halve tonen, fragment minimaal 0,1 seconde, bestand maximaal 50 MB. Het tempobereik is door de gebruiker bevestigd. De overige proefgrenzen en toetskeuzes zijn geen definitieve productspecificatie; de open keuzes in hoofdstuk 10 blijven gelden. Muzikale luisterbeoordeling en Windows-gebruikstest volgen nog. Zie `docs/FASE-1.md` voor de proef en controles.

## 12. Doorloopbare voorbeeldschermen (fase 2)

De gebruiker heeft opdracht gegeven om door te gaan. Versie 0.0.3 biedt voorbeeldschermen voor de rondjetabel, oefeningenbibliotheek, speler, evaluatie en voortgang. Een vaste melding onderscheidt de fictieve voorbeelden van eigen gegevens. Een aparte bediening toont ook de lege schermen. Voorbeeldwijzigingen worden niet opgeslagen en kunnen bij verlaten van de voorbeeldomgeving verdwijnen.

In de voorbeeldtabel zijn oefening, een vooraf gekozen fragment, herhalingen en BPM aanpasbaar. De geplande duur rekent direct mee. Stappen kunnen worden toegevoegd, verwijderd en verplaatst. Dit valideert de bediening; het opslaan van eigen rondjes en vrij kiezen van fragmentgrenzen in de tabel volgen in fase 4. De toonhoogtekolom is herkenbaar als voorstel en nog niet actief.

Het speelscherm toont tablatuur en opdracht naast elkaar bij voldoende vensterbreedte, met de speler eronder. Zonder afbeelding krijgt de opdracht de breedte. Lange opdrachten kunnen binnen hun tekstvak scrollen. Voorbeeldtablatuur kan worden vergroot en met Escape weer gesloten. De voorbeeldspeler gebruikt een los opgewekte melodie; de interface vermeldt dat deze niet bij de getoonde notatie hoort. De aparte Audioproef blijft beschikbaar voor eigen MP3.

Evaluatiekeuzes en grafieken zijn uitsluitend voorbeelden om de vorm en bediening te beoordelen. Er wordt geen sessie, beoordeling of volgende tempo-opbouw opgeslagen. De voorbeelden beslissen de nog open evaluatiekeuzes niet. Automatische uitvoering van rondjes en tijdelijk onderbreken/hervatten volgen in fase 5. Opslag en BPM-herkenning volgen in fase 3.
