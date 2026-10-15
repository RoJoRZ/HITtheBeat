# HITtheBeat — Functioneel document

Status: functionele uitgangspunten, bijgewerkt op 10 oktober 2026.

Dit document beschrijft het gewenste gedrag van HITtheBeat. Het bevat geen technisch ontwerp. Nieuwe en gewijzigde functionele afspraken worden steeds in dit document verwerkt en via Git bijgehouden.

## 1. Doel

HITtheBeat helpt een muzikant dagelijks gericht te oefenen met korte audiotracks, een persoonlijke tempo-opbouw en inzicht in de voortgang. Een opgeslagen verzameling oefeningen heet een **oefenrondje**.

De applicatie moet ten minste op macOS (MacBook) en Windows werken. Ontwikkeling moet mogelijk zijn met gratis gereedschappen en de app moet kunnen worden gedeeld met andere geïnteresseerden. Een mooie, strakke en overzichtelijke interface is onderdeel van het gewenste resultaat. Eventuele distributiekosten, zoals ondertekening van installatiebestanden, worden afzonderlijk afgewogen.

## 2. Oefeningenbibliotheek

Een oefening bevat:

- Een naam.
- Een kort MP3- of M4A-bestand met AAC (maximaal 50 MB).
- Optioneel een afbeelding van tablatuur of bladmuziek.
- Een beschrijving met uitleg en belangrijke aandachtspunten.
- Het oorspronkelijke tempo in BPM.
- Opgeslagen fragmenten met een naam, beginpunt A en eindpunt B in seconden.

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

### 3.1 Geluidsniveau en spelervolume

Bij het toevoegen van een MP3 of M4A met AAC wordt het geluidsniveau automatisch gemeten. Normalisatie staat standaard aan en brengt zachte en luide oefeningen dichter bij elkaar. Eén vaste niveaucorrectie geldt voor het gehele audiobestand en alle fragmenten daarvan; verschillen binnen de muziek blijven behouden. Het originele bestand blijft ongewijzigd bewaard. De muzikant kan normalisatie per oefening uitschakelen.

Bestaande oefeningen worden niet ongemerkt aangepast. Via Bewerken → Volume normaliseren kan het niveau alsnog worden gemeten en met Oefening opslaan worden bewaard. De gemeten correctie is zichtbaar bij de oefening. Stilte en vrijwel onhoorbare audio worden niet versterkt; sterke versterking en audiopieken begrenzen de correctie. Daardoor hoeven alle bestanden niet exact even luid te klinken.

De echte speler heeft een volumeschuif van 0–100% en een knop om te dempen en dempen op te heffen. Dit is het appvolume, onafhankelijk van het systeemvolume, de normalisatie, BPM en toonhoogte. De instelling geldt ook bij een andere oefening, vrije fragmenttraining en terugkeer naar het rondje. Volume en dempen worden op deze computer onthouden, ook na opnieuw openen. De volumeschuif bedienen heft dempen op; alleen dempen opheffen herstelt het laatst gekozen volume.

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
- Fragment: volledige track, een benoemd fragment van deze oefening of eigen A–B-grenzen in seconden. De sessietabel gebruikt hiervoor één keuzebediening.
- Aantal herhalingen.
- Gewenst tempo in BPM.

Voorstel: voeg een kolom toe voor de toonhoogteverschuiving per stap, uitgedrukt in halve tonen, met standaardwaarde 0 (oorspronkelijke toonhoogte). Hiermee kan dezelfde oefening in verschillende stappen ook een andere toonhoogte hebben. Deze keuze is nog niet definitief vastgesteld.

Rijen binnen één oefenblok vormen samen de tempo-opbouw. Aaneengesloten rijen met hetzelfde fragment vormen één serie; de evaluatie volgt na alle tempo’s en herhalingen van die serie. Bij wisselen van fragment of oefening volgt dus een evaluatie, bij alleen een BPM-wissel niet.

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

De muzikant kan starten, pauzeren, hervatten, de huidige speelbeurt opnieuw beginnen en een oefening overslaan. Na een fragmentserie volgt een korte evaluatie voordat een ander fragment of de volgende oefening begint.

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

Tijdens vrije fragmenttraining kan de muzikant de huidige A–B-selectie met een naam bij de oefening opslaan. Dit verandert de geplande opbouw niet; daarna kan de oorspronkelijke sessie worden hervat. Het fragment is voortaan ook in andere oefensessies beschikbaar.

## 7. Korte evaluatie

Na iedere fragmentserie volgt een korte evaluatie. Een serie bestaat uit de aaneengesloten stappen met hetzelfde fragment binnen één oefenblok, inclusief alle ingestelde tempo’s en herhalingen. Alleen een BPM-wissel onderbreekt die serie niet. Bij een ander fragment of de volgende oefening stopt de speler voor de evaluatie. Ook na de laatste serie volgt een evaluatie voordat het rondje wordt afgerond.

De muzikant kan aangeven wat er nu of de volgende keer moet gebeuren:

| Actie | Gedrag |
| --- | --- |
| Nog een keer | De zojuist gespeelde fragmentserie met dezelfde opbouw direct opnieuw uitvoeren. |
| Volgende keer hetzelfde | De huidige opbouw behouden. |
| Volgende keer sneller | De opbouw voor de volgende sessie verhogen met een gekozen aantal BPM. |
| Volgende keer rustiger | De opbouw voor de volgende sessie verlagen met een gekozen aantal BPM. |

‘Volgende keer’ geldt ook als de muzikant een dag overslaat. Aanpassingen gelden voor de oefening binnen het gebruikte rondje.

Vastgesteld: een tempoverhoging of -verlaging geldt voor één gekozen oefenblok binnen het gebruikte rondje. Alle stappen en herhalingen van dat blok verschuiven met hetzelfde aantal BPM. Bijvoorbeeld: +5 BPM maakt 75/95/85 BPM tot 80/100/90 BPM. De overige oefeningen van dit rondje en dezelfde oefening in andere rondjes veranderen niet. Voor het opslaan toont de tool de nieuwe opbouw ter bevestiging, bijvoorbeeld ‘75 → 80 · 95 → 100 · 85 → 90 BPM’.

Vastgesteld en toegevoegd in v0.0.9: een korte beoordeling met een cijfer van **1 tot en met 5**, standaard **3**. De muzikant kan daarnaast het tempo voor de volgende keer kiezen: **1 = langzamer, 2 = gelijk houden, 3 = sneller**. Bij langzamer of sneller wordt het aantal BPM ingevuld. **Enter** bewaart de gekozen evaluatie en gaat door naar het volgende fragment of de volgende oefening; zonder wijzigingen gelden beoordeling 3 en tempo gelijk houden. Na de laatste serie rondt Enter het rondje af. Alles blijft ook met de muis bedienbaar. De toetsenbediening staat beschreven in hoofdstuk 18. Een optionele notitie blijft mogelijk.

Vastgesteld: evaluatiepauzes tellen niet mee als werkelijk geoefende tijd. De gebruiker heeft bevestigd dat de evaluatie volgt na alle tempo’s en herhalingen van hetzelfde fragment, bij de overgang naar een ander fragment of een volgende oefening.

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
- Verdere verfijning van het dashboard na gebruiksfeedback; de presentatie van fase 7 is beschreven in hoofdstuk 23.

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

## 13. Eigen bibliotheek en volledig rondje in beeld (fase 3, v0.0.4)

De gebruiker heeft na de verduidelijking van het rondje opdracht gegeven door te gaan. De voorbeeldspeler toont nu alle geordende oefenblokken in het gekozen rondje, met de huidige oefening en haar plaats in het geheel. Aaneengesloten tabelstappen van dezelfde oefening vormen in de schermproef één blok. Via de lijst kan een andere oefening worden bekeken. Dit simuleert geen afgevinkte uitvoering: automatisch doorlopen, evaluatie tussen oefeningen en hervatten na fragmenttraining volgen in fase 5. Een oefening rechtstreeks vanuit de voorbeeldbibliotheek openen toont expliciet een losse oefening.

Via ‘Eigen bibliotheek bekijken’ en ‘Oefeningen’ kunnen eigen oefeningen worden toegevoegd en bewerkt. Naam, MP3, optionele rasterafbeelding en opdracht worden lokaal bewaard. MP3 en afbeelding worden gekopieerd: verplaatsen van het oorspronkelijke bestand maakt de oefening niet afhankelijk van de oude locatie. De bibliotheek kan worden doorzocht; de vaste actie ‘Bibliotheekmap openen’ maakt de gegevenslocatie bereikbaar.

Bij MP3-import wordt de duur bepaald en het tempo op de achtergrond geschat. Het invoerveld neemt een gevonden schatting over zolang de gebruiker nog geen eigen BPM heeft ingevoerd. Voor opslaan is een positief, bevestigd BPM nodig. De schatting blijft afzonderlijk bewaard. Bij bewerken kan opnieuw worden geanalyseerd; dit overschrijft het bevestigde BPM niet. ‘Gebruik schatting’ neemt de schatting bewust over. Zonder herkenbaar ritme kan de gebruiker zelf een BPM invoeren; onleesbare MP3 wordt afgewezen.

De eerste detector analyseert maximaal de eerste 90 seconden en zoekt een puls tussen 40 en 240 BPM. Dat is een voorlopige analysegrens, geen wijziging van het afspeelbereik van 25–300%. Halve/dubbele tellingen en afwijkingen op echte muziek blijven mogelijk; de schatting is geen meting van beheersing. De importgrenzen in deze proef zijn MP3 maximaal 50 MB, afbeelding PNG/JPEG/WebP maximaal 12 MB, naam maximaal 160 tekens en opdracht maximaal 20.000 tekens. Bevestigd bron-BPM kan tussen 0 en 1000 liggen (exclusief nul). Dit zijn implementatiegrenzen van de proef.

De opgeslagen oefening kan direct worden afgespeeld met tempo, toonhoogte en A/B-loop. Het originele BPM wordt via Bewerken gecorrigeerd. Tablatuur is vergroot te bekijken; zonder afbeelding blijft de opdracht beschikbaar. Deze losse speler bewaart geen oefensessie of loopkeuze. Rondjes opslaan, automatische uitvoering, evaluaties en echte dashboardresultaten zijn nog volgende fases. Persoonlijke bibliotheekbestanden komen niet in Git.

## 14. Eigen oefenrondjes bewaren (fase 4, v0.0.5)

De gebruiker heeft na de bibliotheekproef opdracht gegeven verder te gaan. In de eigen omgeving kunnen nu meerdere rondjes met een naam worden gemaakt, aangepast, opgeslagen, heropend en verwijderd. Een rondje bestaat uit geordende oefenblokken. Elk blok verwijst naar een oefening in de bibliotheek en heeft zijn eigen geordende tempo-opbouw. Dezelfde oefening kan in verschillende rondjes of meerdere keren binnen hetzelfde rondje voorkomen, telkens met een onafhankelijke opbouw.

De tabel biedt per stap volledige track of vrij fragment A–B, herhalingen en BPM. A/B worden ingevoerd als seconden in de oorspronkelijke audio, onafhankelijk van het speeltempo. De geplande duur is fragment- of trackduur × herhalingen × origineel BPM / speel-BPM. Toonhoogte heeft geen invloed op duur, maar toonhoogte per rij blijft een open keuze en is nog niet opgenomen in de echte editor. De bestaande losse speler kan wel worden getransponeerd.

Oefenblokken en stappen kunnen worden toegevoegd, verplaatst en verwijderd. Iedere oefening heeft minstens één stap. Bij het kiezen van een andere bron-oefening in een blok blijven de aantallen herhalingen behouden; tempo en fragment worden teruggezet naar het originele BPM en de volledige track van de nieuwe bron. Een nieuwe stap begint met één herhaling, de volledige track en het BPM van de laatste stap in dat blok. Een nieuw blok begint bij het originele BPM van zijn oefening.

De totale geplande duur rekent tijdens invoer mee. Ongeldige invoer toont een melding, vervangt de duur door ‘—’ en blokkeert opslaan. Getallen mogen niet leeg of ongeldig zijn: herhalingen zijn gehele getallen 1–99, tempo ligt binnen 25–300% van het huidige originele BPM, en fragmenten liggen binnen de track en duren minstens 0,1 seconde. Voorlopige omvanggrenzen zijn 100 oefenblokken, 1000 stappen per rondje en 160 tekens voor de naam.

Een zichtbare melding onderscheidt bewaarde gegevens van wijzigingen die nog niet zijn opgeslagen. De editor behoudt wijzigingen bij navigeren naar de bibliotheek en terug binnen hetzelfde appvenster. Bij wisselen van rondje of het maken van een ander rondje vraagt de app of onbewaarde wijzigingen mogen worden verworpen; de gebruiker kan verder bewerken en eerst opslaan. Sluiten van de app bewaart een onopgeslagen concept nog niet automatisch. Het verwijderen van een bewaard rondje vraagt bevestiging in de app en verwijdert de oefeningen of MP3’s niet.

Wijzigen van het originele BPM van een bibliotheekoefening verandert niet stilzwijgend de ingestelde BPM’s in bestaande rondjes. De duur wordt met het actuele originele BPM berekend. Als daardoor een stap buiten het toegestane tempobereik valt, meldt de editor dat en moet de stap worden aangepast voordat het rondje opnieuw kan worden opgeslagen.

Deze fase bewaart rondjes en hun opbouw; automatisch uitvoeren in de speler, tellers, onderbreken/hervatten en evaluatie tussen oefeningen volgen in fase 5 en 6. De voorbeeldomgeving blijft beschikbaar en bewaart haar wijzigingen niet.

## 15. Eigen rondje uitvoeren en fragmenttraining (fase 5, v0.0.6)

De gebruiker heeft de editor goedgekeurd en opdracht gegeven door te gaan. Een geldig, opgeslagen rondje kan nu met ‘Rondje starten’ worden geopend. Onopgeslagen wijzigingen moeten eerst worden bewaard. De speler gebruikt een momentopname van het rondje, de opdrachten en de brongegevens; vrij oefenen verandert de opgeslagen opbouw niet.

Het gehele rondje staat in een compacte lijst boven de speler. De huidige oefening is gemarkeerd; eerdere oefeningen tonen Afgerond of Overgeslagen. Tablatuur, geschreven opdracht en speler horen bij de huidige oefening. Het scherm toont stap X van Y, herhaling X van Y, gepland BPM, bronfragment en resterende geplande tijd. Tablatuur kan worden vergroot; zonder afbeelding blijft de opdracht zichtbaar.

De eerste speelbeurt begint na ‘Afspelen’. Daarna volgen herhalingen en stappen automatisch in de opgeslagen volgorde, met hun eigen tempo en fragment. Na de laatste stap van een oefening stopt de speler voor een tijdelijke terugblik. ‘Verder met volgende oefening’ laadt de volgende oefening en begint haar eigen opbouw. Bij de laatste oefening wordt dit ‘Rondje afronden’. ‘Deze oefening opnieuw’ voert het huidige oefenblok opnieuw uit. Dit is nog geen definitieve evaluatie en er worden geen resultaten bewaard.

Pauzeren behoudt de positie binnen de actuele herhaling. Terug naar het begin herstart die herhaling, zonder de teller te verhogen. ‘Oefening overslaan’ gaat naar het volgende oefenblok en markeert het huidige als Overgeslagen, ook als daarvan al enkele speelbeurten zijn voltooid. Bij afsluiten met overgeslagen oefeningen staat ‘Rondje beëindigd’ in plaats van de indruk dat alles is gespeeld. Ontbrekende/onleesbare audio geeft een melding en verhoogt geen teller; opnieuw laden, overslaan of stoppen blijft mogelijk.

‘Fragment oefenen’ pauzeert het rondje en bewaart oefenblok, stap en herhaling. Vrije training start gepauzeerd met het geplande fragment en tempo als vertrekpunt. Begin A, einde B, tempo en toonhoogte kunnen tijdelijk worden aangepast; A/B kunnen ook op de huidige positie worden gezet. Loop staat aanvankelijk aan. De vrije bediening volgt 25–300% tempo, −12 tot +12 halve tonen en minimaal 0,1 seconde fragmentduur. Vrije loops tellen niet als geplande herhalingen.

‘Terug naar rondje’ herstelt de oorspronkelijke stap, het geplande BPM en de originele toonhoogte; de onderbroken herhaling begint opnieuw. Was het rondje vóór de onderbreking aan het spelen, dan wordt die herhaling direct gestart. Was het gepauzeerd of nog niet gestart, dan blijft het gepauzeerd aan het begin staan. Meerdere onderbrekingen behouden dezelfde tellers zolang de geplande herhaling nog niet is voltooid. Iedere nieuwe vrije onderbreking begint opnieuw vanuit de geplande stapinstellingen.

De resterende geplande tijd omvat de nog te spelen herhalingen. In vrije training omvat zij de volledige onderbroken herhaling, omdat die bij terugkeer opnieuw begint. Vrije training is niet vooraf begroot. Daarnaast toont deze proef afzonderlijk tijd voor rondje-afspelen, fragmenttraining en pauze. Dit zijn tijdelijke audiokloktellingen in het huidige venster; opnieuw gespeelde stukken tellen als extra afspeeltijd. Laden, terugblik en wisselen tellen niet als oefen- of pauzetijd. Definitieve registratie en opslag worden vóór fase 6 afgestemd.

Voorlopige toetsen blijven spatie voor afspelen/pauzeren en 1 voor het begin van de actuele herhaling, of A bij een vrije loop. Invoervelden, knoppen en dialogen houden hun eigen toetsenbediening. Navigeren uit een lopend rondje vraagt bevestiging en pauzeert de speler; ‘Verder oefenen’ behoudt de sessie gepauzeerd. Stoppen behoudt het opgeslagen rondje. Sessies worden nog niet hersteld na sluiten van venster of app.

Er is in deze proef geen aftellen en geen ingestelde extra pauze tussen speelbeurten. Korte technische overgangen kunnen voorkomen. Toonhoogte per geplande tabelrij, definitieve toetskeuzes, pauzes/aftellen en evaluatieopslag blijven open. De vrije toonhoogtebediening beslist de keuze voor toonhoogte per tabelrij niet.


## 16. Fase 6 — Evaluatie en bewaarde sessies (v0.0.7)

De gebruiker heeft de rondjespeler in gebruik getest en opdracht gegeven verder te gaan. De evaluatie verschijnt aan het einde van iedere fragmentserie, zoals beschreven in hoofdstuk 7. ‘Deze serie opnieuw’ herhaalt alleen die serie, met de oorspronkelijke instellingen. ‘Hetzelfde’, ‘Sneller’ en ‘Rustiger’ bepalen de opbouw voor een volgende sessie. Een optionele notitie wordt bij deze serie bewaard. De voorgestelde aanvullende beoordelingslabels blijven een open keuze en zijn nog niet toegevoegd.

Een BPM-aanpassing verschuift alle stappen van dit ene oefenblok binnen dit rondje, inclusief andere fragmenten van datzelfde blok. De speler toont alle oude en nieuwe BPM-waarden vóór bewaren. Andere oefenblokken, ook met dezelfde bibliotheekoefening, en andere rondjes blijven ongewijzigd. De lopende sessie blijft de oorspronkelijke opbouw spelen. Meerdere aanpassingen binnen één sessie tellen op voor de volgende sessie; een directe herhaling veroorzaakt geen tempoaanpassing. Een aanpassing buiten 25–300% wordt geweigerd; er wordt niet stilzwijgend afgeroomd op de grens. Bij een intussen gewijzigd rondje verschijnt een fout en blijft de evaluatie open; bewaren zonder BPM-aanpassing is dan mogelijk.

Werkelijk geoefende tijd is afgespeelde tijd in het rondje plus vrije fragmenttraining. Pauzes, laden, evalueren en wisselen tellen niet mee. Opnieuw afgespeelde stukken tellen als extra oefentijd. Pauze wordt afzonderlijk getoond. Vrije training bewaart haar eigen fragment, BPM en toonhoogte en telt niet als afgeronde geplande speelbeurten.

Bij Voortgang staat nu een sessiehistorie met datum, rondje, status, oefentijd, gespeelde instellingen, aantallen afgeronde speelbeurten, evaluaties en notities. De gegevens zijn momentopnamen: later bewerken of verwijderen van een rondje verandert oude resultaten niet. Grafieken en vergelijkingen volgen in fase 7.

Ook eerder stoppen bewaart resultaten, herkenbaar als ‘Gestopt’. Een doorlopen rondje met overgeslagen oefeningen is niet volledig afgerond en krijgt een eigen status. Afsluiten van het venster of een onverwachte onderbreking bewaart de laatst opgeslagen voortgang als ‘Onderbroken bij afsluiten’. Er zijn periodieke opslagmomenten van één seconde en extra opslag bij overgangen; het laatste onopgeslagen stukje kan bij afsluiten verloren gaan. Een onderbroken sessie kan in deze fase niet op haar oude afspeelpositie worden hervat. Een rondje starten maakt een nieuwe sessie.

Bewaren van evaluatie en toekomstige tempo-opbouw gebeurt samen. Herhaald klikken of opnieuw proberen met dezelfde evaluatie veroorzaakt geen dubbele aanpassing. Bij een opslagfout blijft de speler beschikbaar om opnieuw te proberen; bewust stoppen verlaat de speler pas nadat bewaren is gelukt.


## 17. Aanvulling na fase 6 — Normalisatie en volume (v0.0.8)

De gebruiker heeft v0.0.7 in gebruik getest en vraagt vóór het dashboard om normalisatie bij het toevoegen en een volumeknop in de speler. Beide zijn toegevoegd volgens hoofdstuk 3.1. De regelaar werkt in de rondjespeler, vrije fragmenttraining, losse oefeningspeler en audioproef. De fictieve voorbeeldgrafieken blijven voorbeelden.


## 18. Evaluatie met toetsenbord (v0.0.9)

De gebruiker heeft v0.0.8 in gebruik getest en goedgekeurd. De gewenste evaluatiebediening uit hoofdstuk 7 wordt toegevoegd vóór verdere dashboardontwikkeling. De schaal 1–5 vervangt het eerdere voorstel met drie beoordelingslabels. De gebruiker heeft het bedieningsvoorstel goedgekeurd en opdracht gegeven te bouwen. De uitbreiding is toegevoegd in v0.0.9.

Vastgesteld: toon drie opeenvolgende invoerstappen, zodat dezelfde cijfertoetsen niet tegelijk meerdere betekenissen hebben.

1. **Hoe ging het?** Cijfers 1–5 kiezen de beoordeling en verplaatsen de invoer naar de tempokeuze. De beginwaarde is 3.
2. **Volgende keer?** 1 kiest langzamer, 2 gelijk houden en 3 sneller. De beginwaarde is gelijk houden.
3. **Hoeveel BPM?** Bij langzamer of sneller krijgt een numeriek invoerveld de focus. Cijfers vullen hier uitsluitend het aantal BPM in. De beginwaarde is 5 BPM, direct overschrijfbaar.

Enter bewaart in iedere stap de huidige keuzes en gaat direct door. Niet aangepaste keuzes behouden hun standaardwaarde; Enter wist geen al gemaakte keuze. Bij ongeldige BPM-invoer of een opslagfout blijft de evaluatie open met een duidelijke melding, zodat geen resultaat verloren gaat. De bestaande tempogrenzen blijven gelden.

Alle keuzes zijn zichtbaar en aanklikbaar. Ook eerdere keuzes kunnen opnieuw worden aangeklikt; Tab en Shift+Tab maken teruggaan en corrigeren mogelijk. De actieve invoerstap is duidelijk herkenbaar. De bestaande actie ‘Deze serie opnieuw’ en optionele notitie blijven bereikbaar met muis en toetsenbord. De nieuwe cijferbediening geldt uitsluitend tijdens de evaluatie; buiten de evaluatie behoudt de speler zijn huidige sneltoetsen.

Het cijfer wordt bij iedere nieuwe evaluatie bewaard en in de sessiehistorie getoond. Eerdere evaluaties zonder cijfer behouden hun oorspronkelijke gegevens; er wordt achteraf geen beoordeling aan toegekend. Enter werkt ook vanuit het notitieveld; Tab en Shift+Tab wisselen tussen de bedieningsonderdelen. Nieuwe evaluaties beginnen steeds met 3/5, gelijk houden en een klaarstaande BPM-aanpassing van 5.


## 19. Bewoordingen in de app (11 oktober 2026)

De gebruiker heeft de volgende combinatie gekozen: **Jouw muziekmoment** als vaste bovenregel, **Mijn oefensessies** als navigatienaam en paginatitel, en **Vind je ritme, ontwikkel je spel.** als ondertitel. Deze teksten vervangen respectievelijk Jouw oefenplek, Mijn oefenrondjes en Maak ruimte voor je dagelijkse muziek. De keuze is doorgevoerd in v0.0.10. De bestaande functionaliteit en opgeslagen gegevens veranderen hierdoor niet; deze tekstkeuze verandert de overige benamingen zoals oefenrondje niet automatisch.


## 20. Benoemde fragmenten en hergebruik (v0.0.11)

Vastgesteld op 11 oktober 2026: fragmenten horen bij de oefening. De muzikant kan meerdere fragmenten met een naam en A–B-grenzen bewaren, bijvoorbeeld Intro of Lastige overgang. Ze zijn bij de oefening toe te voegen en te bewerken, met tijden in seconden; ook een decimale komma of punt wordt geaccepteerd. Tijdinvoer blijft bewerkbaar terwijl een veld tijdelijk leeg of onvolledig is. Ongeldige grenzen verhinderen bewaren en krijgen een duidelijke melding.

In de sessietabel kiest iedere stap Volledige track of een opgeslagen fragment van de gekozen oefening. Herhalingen en BPM blijven per stap instelbaar; de geplande duur rekent direct met de geselecteerde grenzen. Eigen A–B-invoer blijft beschikbaar, ook voor bestaande sessie-opbouwen. Voorbeeldschermen gebruiken dezelfde fragmentkiezer en tijdinvoer, met herkenbare fictieve fragmentnamen.

Tijdens een onderbroken oefenrondje kiest de muzikant A en B en oefent de passage in een loop. Met Fragment opslaan en een naam wordt uitsluitend die selectie bij de huidige oefening bewaard. Dezelfde mogelijkheid staat in de losse oefeningspeler. Tempo en toonhoogte van de vrije training worden niet onderdeel van het opgeslagen fragment; die kiest de muzikant in de training. Opslaan onderbreekt een lopende loop niet. Daarna herstelt Terug naar rondje de oorspronkelijke instellingen en begint de onderbroken geplande speelbeurt opnieuw.

Uitwerking voor behoud van bestaande trainingen: een sessiestap bewaart de gekozen fragmentnaam en grenzen als vaste selectie. Later bewerken of verwijderen van het bibliotheekfragment verandert bestaande opbouwen en gespeelde historie niet. Bij een gewijzigde of verwijderde bron blijft de bewaarde selectie herkenbaar in de kiezer; opnieuw het actuele fragment kiezen neemt de nieuwe naam en grenzen over. Handmatig aanpassen van A of B maakt de stap een eigen fragment. De lopende sessie blijft altijd haar oorspronkelijke momentopname gebruiken.

Bij de oefening staan de bewaarde fragmenten met naam en tijden, plus bewerken en verwijderen. Namen zijn uniek binnen één oefening. De upgrade bewaart bestaande oefeningen, audio, opbouwen, evaluaties en sessiehistorie.


## 21. Direct naar eigen gegevens, zonder voorbeeldschermen

Vastgesteld op 11 oktober 2026: de gebruiker wil een afzonderlijke ontwikkelfase voor het verwijderen van de voorbeeldschermen en direct starten met de eigen bibliotheek. Fase 6B is geïmplementeerd in v0.0.12, vóór het dashboard van fase 7.

De app opent direct op Mijn oefensessies in de eigen omgeving. De omschakelknoppen en fictieve bibliotheek, sessietabel, speler, evaluatie en dashboard verdwijnen uit de dagelijkse interface. Zonder oefeningen helpt een leeg scherm de muzikant een eerste eigen MP3 toe te voegen. Bestaande oefeningen, benoemde fragmenten, opbouwen, evaluaties en historie blijven behouden en zijn meteen beschikbaar. Voortgang toont uitsluitend eigen resultaten; tot het dashboard gereed is blijft dat de bestaande sessiehistorie.

Vanaf v0.0.15 is de losse Audioproef met testmelodie verwijderd (zie hoofdstuk 24). Historische renders en geïsoleerde testgegevens kunnen als ontwikkelmateriaal blijven bestaan, buiten de appinterface.


## 22. Startoverzicht met recente oefensessies (v0.0.13)

Op 11 oktober 2026 kiest de gebruiker een overzicht als beginscherm, in plaats van een automatisch geopende sessie-editor. Mijn oefensessies toont maximaal tien recente opgeslagen sessie-opbouwen. Alleen bij meer dan tien verschijnt Alle oefensessies; dit opent het volledige overzicht met zoeken op naam, zonder onderscheid tussen hoofdletters en kleine letters. Terug naar recente sessies herstelt het overzicht van tien.

Iedere sessie toont naam, aantal oefeningen, geplande oefenduur zonder evaluatiepauzes en het laatste oefenmoment, of Nog niet geoefend. Starten opent direct de speler; Bewerken opent de tabel. Nieuwe oefensessie opent een nieuwe opbouw. Zonder oefeningen blijft de route naar de eerste MP3 beschikbaar. Ongeldige sessies blijven zichtbaar en bewerkbaar, maar kunnen pas na herstel starten.

De volgorde gebruikt het meest recente startmoment van de opgeslagen sessie, ook na stoppen of onderbreken. Een nooit gestarte sessie gebruikt haar laatste opslagmoment; zo zijn nieuwe sessies direct terug te vinden. Een sessie-opbouw verschijnt één keer, ongeacht het aantal uitvoeringen. De afzonderlijke uitvoeringen blijven bij Voortgang.

Na afronden of stoppen keert de muzikant terug naar het overzicht. De editor heeft Terug naar overzicht; onopgeslagen wijzigingen vragen eerst om verder bewerken of verwerpen. Navigatie naar Oefeningen en terug behoudt de open editor en onopgeslagen invoer. Eigen oefeningen, opbouwen, fragmenten en historie blijven behouden.


## 23. Voortgangsdashboard (fase 7, v0.0.14)

Na goedkeuring van het sessieoverzicht geeft de gebruiker opdracht voor fase 7. Voortgang toont nu uitsluitend eigen opgeslagen resultaten: oefentijd, oefendagen, geoefende sessies, tempo-ontwikkeling, de bijbehorende laatste beoordeling en de sessiehistorie. De periode is Deze week (vanaf maandag), Deze maand of Alle tijd. De samenvattingen, grafiek en historie gebruiken dezelfde periode.

Werkelijk afgespeelde rondjetijd en vrije fragmenttijd tellen op tot oefentijd. Pauzes en evaluaties tellen niet mee. Ook gestopte, overgeslagen en onderbroken sessies dragen hun afgespeelde tijd bij. Een alleen gestarte sessie zonder muziek telt niet als oefendag of geoefende sessie; ze blijft wel herkenbaar in de historie. Alleen de status Afgerond telt als volledig afgeronde sessie.

De dagindeling gebruikt de huidige lokale tijdzone van de computer, zichtbaar in het scherm. Omdat bestaande resultaten geen tijdstempel per afspeelsegment bevatten, wordt alle tijd aan de lokale startdag van de sessie toegerekend, ook bij spelen over middernacht. De daggrafiek toont de gekozen week of maand tot vandaag; bij Alle tijd toont ze de laatste 28 dagen, terwijl de samenvattingen en tempo-grafiek alle historie gebruiken. Een uitklapbare tabel geeft exacte tijden.

Tempo wordt afzonderlijk getoond per opgeslagen sessie-opbouw, oefenblok, oefening, volledige track of fragmentgrenzen, geplande/vrije training en toonhoogte. Een ander origineel BPM of andere bronduur krijgt een aparte vergelijking. Benoemde fragmenten blijven herkenbaar; dezelfde grenzen binnen hetzelfde oefenblok zijn hetzelfde onderdeel. Een volledig A–B-bereik geldt als volledige track.

Een meetpunt is één sessie: voor geplande training het hoogste werkelijk gespeelde BPM met minstens één afgeronde speelbeurt van dit onderdeel. Alleen begonnen of overgeslagen beurten verhogen dit punt niet; hun afgespeelde tijd telt wel mee. Vrije fragmenttraining toont haar hoogste daadwerkelijk afgespeelde BPM apart, zonder voltooiing te suggereren. Eén punt krijgt geen verzonnen trend. Een tabel onder de grafiek toont datum, BPM, afgeronde speelbeurten, eventuele beoordeling en sessiestatus.

Het laatste resultaat toont gespeeld BPM, status en de laatste bewaarde evaluatie van dit onderdeel in die sessie, met cijfer indien aanwezig, notitie en de destijds gekozen tempo-aanpassing. Die beoordeling is de eigen inschatting van de muzikant en geen automatische kwaliteitsmeting. Een hoger BPM wordt niet als bewezen beheersing gepresenteerd. Oude resultaten zonder cijfer blijven ongeclassificeerd.

Alle berekeningen lezen opgeslagen sessiemomentopnamen. Achteraf wijzigen of verwijderen van oefeningen, fragmenten of sessie-opbouwen verandert eerdere resultaten niet. Er is geen nieuwe opslagmigratie nodig.


## 24. Audioformaten en Instellingen (v0.0.15)

Op verzoek van de gebruiker verdwijnt de losse Audioproef uit de app. Oefeningen en oefensessies blijven de routes om eigen muziek te spelen. Instellingen staat in de zijbalk; daar staat Bibliotheekmap openen, met uitleg over lokale opslag. Deze actie staat niet meer bij Oefeningen.

Import accepteert MP3 en onbeveiligde M4A met AAC, maximaal 50 MB. M4A is een container: Apple Lossless (ALAC), beveiligde tracks en onleesbare of andere niet-ondersteunde varianten worden met een duidelijke melding geweigerd. Omzetten gebeurt niet automatisch. Duurbepaling, BPM-analyse, volumenormalisatie, fragmenten en beide spelers werken voor de ondersteunde formaten hetzelfde.

De bibliotheek bevat ongewijzigde kopieën van geïmporteerde audio en afbeeldingen, met interne bestandsnamen, plus de database met oefeningen en resultaten. De oorspronkelijke bestanden blijven op hun eigen locatie; verplaatsen of verwijderen daarvan breekt een opgeslagen oefening niet. Normalisatie wordt tijdens afspelen toegepast en herschrijft de audio niet. Bestaande gegevens blijven behouden.

## 25. Oefeningen beheren en uniforme sessienaam (11 oktober 2026)

Vastgesteld op verzoek van de gebruiker; geleverd in v0.0.16:

- Een oefening kan vanuit de bibliotheek worden verwijderd, na een bevestiging met uitleg. Audio, tablatuur en benoemde fragmenten worden verwijderd; historische sessiemomentopnamen en resultaten blijven behouden.
- Wanneer een oefening nog in opgeslagen sessie-opbouwen wordt gebruikt, vermeldt de app de betreffende sessies. Verwijder de oefening eerst uit deze opbouwen. Er verdwijnen geen sessieblokken stilzwijgend.
- Bij een bestaande oefening kan een nieuwe MP3 of ondersteunde M4A worden gekozen. Vervangen gebeurt uitsluitend bij opslaan; annuleren laat de opgeslagen audio intact. De nieuwe audio wordt opnieuw geanalyseerd voor duur, BPM-schatting en normalisatie. Het handmatig ingestelde BPM blijft staan tot de gebruiker het wijzigt of de schatting overneemt.
- Naam, opdracht, tablatuur, identiteit en fragmenten blijven bewaard. Vervanging die opgeslagen fragmentgrenzen of sessiegrenzen/tempo's ongeldig maakt wordt geweigerd met uitleg; eerst de betreffende fragmenten of sessie aanpassen. Na vervangen controleert de gebruiker zelf of de fragmenten muzikaal nog kloppen. Historische momentopnamen worden niet herschreven.
- De zichtbare term ‘rondje’ wordt overal ‘sessie’, ook in de editor: Sessie starten, Sessie opslaan en Sessie verwijderen.
- Het compacte appicoon gebruikt een H met audiostreepjes, in Mandarijn op Studio donker, gebaseerd op het gewaardeerde logo linksboven. Het volledige logo blijft behouden. De vormgeving van het nieuwe icoon kan op gebruiksfeedback worden verfijnd.

Dit is een afzonderlijke verbetering; fase 8, Windows-gebruikstest en muzikale luisterbeoordeling blijven open.

Gebruiksfeedback 11 oktober 2026: de gebruiker heeft v0.0.16 geprobeerd en meldt dat alles lijkt te werken. De wijzigingen zijn daarmee in gebruik goedgekeurd. Dit is geen afzonderlijke bevestiging van een Windows-test, brede BPM-nauwkeurigheid of muzikale luisterkwaliteit. Fase 8 is nog niet gestart.

Op 11 oktober 2026 heeft de gebruiker eenmalig gevraagd opnieuw te beginnen met de voortgangsrapportage. De 12 historische oefenregistraties zijn uit de lokale gebruikersdatabase verwijderd; oefeningen, media, fragmenten en opgeslagen sessie-opbouwen zijn behouden. Dit betreft een eenmalige gegevensreset, geen nieuwe resetfunctie in de app. Nieuwe oefenregistraties bouwen de voortgang opnieuw op.

## 26. Release 1.0 — vastgelegde wensen, nog niet geïmplementeerd

Op 15 oktober 2026 vraagt de gebruiker de acht open GitHub-issues in milestone Release 1.0 te onderzoeken en prioriteren. Na verduidelijking kiest de gebruiker **eerst analyse en plan ter goedkeuring**; onderstaande wensen zijn geen bestaande appfunctionaliteit. Uitwerking, afhankelijkheden, testplan en open keuzes staan in [docs/RELEASE-1.0-ANALYSE.md](docs/RELEASE-1.0-ANALYSE.md). De voorgestelde permanente werkwijze staat in docs/AGENTS-VOORSTEL.md; AGENTS.md wordt pas na akkoord definitief aangepast.

| Issue | Vastgelegde gewenste functionaliteit |
|---|---|
| [#1](https://github.com/RoJoRZ/HITtheBeat/issues/1) | Metronoom-oefening zonder audio-upload, met BPM en maatsoort, bruikbaar in gewone sessies. Duur/eindconditie en betekenis van BPM bij 6/8 vragen nog een keuze. |
| [#2](https://github.com/RoJoRZ/HITtheBeat/issues/2) | Optionele aftelmaat vóór iedere herhaling op het tempo van die herhaling; maatsoort standaard 4/4; ander geluid dan de metronoom; instelling per sessie. Gevolgen voor tijdweergave nog afstemmen. |
| [#3](https://github.com/RoJoRZ/HITtheBeat/issues/3) | Tablatuur via vergrootglas in los verplaatsbaar en vergrootbaar venster, volgt actieve oefening, beeldzoom en fullscreen; sluiten stopt sessie niet. |
| [#4](https://github.com/RoJoRZ/HITtheBeat/issues/4) | Waveformselectie met muis, sleepbare A/B, horizontaal zoomen/pannen en fragmentpreview; grenzen blijven juist bij zoom; handmatige secondeninvoer mag blijven. |
| [#5](https://github.com/RoJoRZ/HITtheBeat/issues/5) | Half-/dubbeltempo bij BPM-herkenning onderzoeken en beperken; handmatige correctie behouden; BPM overal als geheel getal tonen, interne precisie mag blijven. |
| [#6](https://github.com/RoJoRZ/HITtheBeat/issues/6) | Volledige Nederlandse en Engelse interface; eerste taal uit systeem/browser, daarna handmatige blijvende voorkeur. Fallback voor andere talen nog vastleggen. |
| [#7](https://github.com/RoJoRZ/HITtheBeat/issues/7) | Eén offline oefenbestand exporteren/importeren met aanwezige audio, tablatuur, opmerkingen en relevante instellingen; import voegt toe zonder overschrijven; gelijke naam waarschuwt en kan vóór import worden gewijzigd. |
| [#8](https://github.com/RoJoRZ/HITtheBeat/issues/8) | PR-builds en taggestuurde macOS-/Windows-installers via GitHub Actions; publiceren als release, Windows-installatie/audio/opslag testen en releaseproces beschrijven. Automatische appupdates vallen buiten scope. |

Bestaand werkend gedrag en persoonlijke gegevens blijven tijdens deze analyse ongewijzigd. De voorgestelde bouwvolgorde is #1 → #2 → #3 → #4 → #5 → #7 → #6 → #8; dit is ter goedkeuring en sluit de bestaande afrondingsfase aan op de milestone. Nieuwe diensten of een grote architectuurvervanging zijn niet voorgesteld.

Goedkeuring 15 oktober 2026: gebruiker geeft akkoord op de voorgestelde volgorde en werkwijze en opdracht te starten met #1. Een metronoomherhaling duurt standaard 8 maten, instelbaar per sessiestap. BPM is kwartnoten per minuut, ook bij 6/8. Afteltijd wordt afzonderlijk getoond en telt niet mee als gespeelde oefentijd (#2). De nieuwe functies zijn hiermee geautoriseerd, maar pas na hun afzonderlijke implementatie beschikbaar.

## 27. Metronoom-oefeningen — issue #1, v0.0.17

Geïmplementeerd op basis van het akkoord van 15 oktober 2026, ter acceptatie in een afzonderlijke PR. Bij Oefeningen kiest de muzikant Audiotrack of Metronoom zonder audiobestand. Een metronoom heeft een naam, BPM en maatsoort 3/4, 4/4 of 6/8; opdracht en afbeelding blijven optioneel. Audio-upload, BPM-detectie en volumenormalisatie horen alleen bij audiotracks. Het oefentype staat na opslaan vast; een andere soort maak je als nieuwe oefening.

Een metronoomherhaling bestaat standaard uit 8 maten. In de sessietabel is dit per stap aanpasbaar (1–128 maten), naast herhalingen en BPM. Maatsoort hoort bij de oefening. BPM is kwartnoten per minuut: bij 6/8 klinken zes achtstetellen per maat, dus twee klikken per kwartnoot. De eerste tel heeft een hoger geluid; bij 6/8 krijgt tel vier een tweede, lichtere klankaccentuering. De metronoom werkt van 20 tot 300 BPM; de bestaande 25–300%-grens blijft voor audiotracks gelden. Een 6/8-maat op 120 BPM duurt 1,5 seconde.

De sessie kan metronoom- en audio-oefeningen combineren. Maten, tempo en herhalingen bepalen meteen de geplande duur. Pauze, spatie, terug naar start met 1, overslaan en evaluaties werken via dezelfde sessieroute. Er is een zichtbare telindicatie; metronoom heeft geen track-waveform, toonhoogte of vrij audiofragment. Een tempo-opbouw binnen hetzelfde oefenblok wordt als één serie geëvalueerd; daarna volgt de volgende oefening. De tempo-aanpassing na evalueren geldt nog steeds voor dat ene oefenblok. Metronoomtijd telt als gespeelde oefentijd; pauze en evaluatie niet.

Bij de losse oefening staat een metronoomspeler voor standaard 8 maten, met lokaal instelbaar speeltempo en aantal maten. Deze bediening verandert opgeslagen sessies niet. De gedeelde volume- en dempeninstelling werkt in beide spelers. Los spelen telt, net als de losse audioplayer, niet mee in sessiehistorie.

Bestaande audio, afbeeldingen, fragmenten, sessies en resultaten blijven behouden. Nieuwe resultaten bewaren ook maatsoort en maten in hun historische context, zodat andere metronoomopbouwen niet in één voortgangsreeks worden gemengd. Een opgeslagen metronoom heeft geen audiobestand in de mediamap. Aftellen vóór herhalingen is nog niet gebouwd; dat blijft issue #2.
