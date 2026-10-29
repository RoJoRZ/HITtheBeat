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


### Correctie na gebruikstest — maten per oefening (v0.0.18)

De gebruiker verduidelijkt dat het aantal maten bij het instellen van de metronoom hoort, dus **per oefening**. Dit vervangt de eerdere keuze voor maten per sessiestap. Bij aanmaken én bewerken van een metronoom staat Maten per herhaling (standaard 8, 1–128). Het aantal wordt opgeslagen bij de oefening en gebruikt door de losse speler en alle sessies. De sessietabel toont het aantal alleen; herhalingen en BPM blijven daar per stap instelbaar. De losse speler wijzigt het aantal niet tijdelijk.

Opslaan van de metronoom-oefening past bestaande sessie-opbouwen aan dat aantal aan. Geplande duur wordt opnieuw berekend. Een lopende of historische sessie houdt haar eigen momentopname. Om gegevens bij de upgrade te behouden wordt een gemeenschappelijk oud aantal maten overgenomen als oefeninstelling. Verschillende bestaande stapinstellingen blijven herkenbaar als oude stapinstelling staan totdat de oefening expliciet wordt opgeslagen; dan gebruiken ze allemaal het gekozen aantal van de oefening. Historische resultaten worden niet herschreven.

Gebruiksfeedback op v0.0.18: de gebruiker heeft maten per metronoom-oefening getest en goedgekeurd en geeft opdracht verder te gaan met issue #2 (aftelmaat).

## 28. Optionele aftelmaat per oefensessie — issue #2, v0.0.19

De sessie-editor heeft Aftellen vóór iedere herhaling. Dit staat standaard uit, ook voor bestaande sessies. De aftelmaat bestaat uit één maat, met keuze 3/4, 4/4 of 6/8 en standaard 4/4. Dit is een instelling van de opgeslagen oefensessie, onafhankelijk van de maatsoort en het aantal maten van de oefening. De instelling blijft bewaard na herstart en wordt onderdeel van de momentopname wanneer een sessie start.

Vóór iedere geplande speelbeurt klinkt de aftelmaat op het BPM van die komende herhaling: eerste start, volgende herhalingen, tempowissels, volgende oefeningen en herhalen vanuit de evaluatie. BPM blijft kwartnoten per minuut, dus in 6/8 klinken zes achtstetellen. Aftellen heeft een ander, korter en hoger klikgeluid dan de metronoom; de gedeelde volumeregeling en dempen gelden ook hiervoor. Het scherm toont Aftellen, maatsoort, tel en BPM, met behoud van tablatuur en opdracht.

Spatie of de pauzeknop onderbreekt ook het aftellen. Bij hervatten tijdens een onderbroken aftelmaat begint die maat opnieuw; bij gewoon pauzeren midden in de muziek wordt de muziek op haar plek hervat zonder nieuwe aftelmaat. Terug naar begin van de herhaling (ook toets 1) begint de hele speelbeurt opnieuw met aftellen. Stoppen of overslaan annuleert de nog geplande geluiden. Een onderbroken aftelmaat is geen afgeronde herhaling.

Vrije fragmenttraining krijgt niet bij iedere loop een aftelmaat. Na terugkeer begint de onderbroken geplande herhaling opnieuw met aftellen; als de sessie voordien gepauzeerd stond, wacht dat tot Afspelen. De losse audio- en metronoomspelers gebruiken deze sessie-instelling niet.

De editor en het startoverzicht nemen aftellen mee in de geplande totale duur en tonen de afteltijd afzonderlijk. De editor toont tevens de geplande oefentijd. Tijdens spelen bevat Resterend sessie zowel de nog te spelen muziek als de resterende geplande aftelmaten. Extra aftellen na handmatig opnieuw starten kan de werkelijk bestede tijd verlengen.

Werkelijk verbruikte afteltijd wordt apart opgeslagen en getoond bij de sessietijden en historie. Ze telt niet mee in gespeelde oefentijd, herhalingen, oefendagen of tempo-meetpunten van het dashboard. Een sessie die alleen aftelt en wordt gestopt blijft zichtbaar in de historie, zonder als geoefende sessie te tellen. Pauzes en evaluaties blijven eveneens buiten de oefentijd. Oude resultaten zonder afteltijd behouden hun betekenis.


### Correctie na gebruikstest — aftellen per oefening in de sessie (v0.0.20)

De aftelinstelling staat in de kopregel van elk oefenblok in de sessietabel, naast de oefennaam: een vinkje Aftellen en een maatsoortkeuze (standaard 4/4, ook 3/4 of 6/8). Dit vervangt het algemene aftelpaneel uit v0.0.19. Iedere oefening binnen dezelfde sessie kan onafhankelijk wel/niet aftellen en een andere aftelmaat gebruiken. De keuze geldt voor alle stappen en herhalingen van dat oefenblok. Ze hoort bij de sessie-opbouw; dezelfde bibliotheekoefening kan in een ander blok of een andere sessie een andere keuze hebben.

Bij een volgende oefening gebruikt de speler de instellingen van die volgende oefening. Opbouwen en resterende duur tellen de aftelmaten per oefenblok op. Werkelijk verbruikte afteltijd blijft apart zichtbaar, ook wanneer de volgende oefening aftellen uit heeft staan. De bestaande transport-, tempo- en evaluatieregels blijven gelden voor de blokken met aftellen ingeschakeld.

Bij upgraden wordt een eerder opgeslagen algemene aftelinstelling overgenomen voor alle bestaande blokken van die sessie, zodat hun gedrag behouden blijft. Nieuw toegevoegde oefenblokken beginnen met aftellen uit. Historische momentopnamen blijven ongewijzigd leesbaar met hun oorspronkelijke instelling. Dit verandert de maatsoort of het aantal maten van de bibliotheekmetronoom niet.


Gebruiksgoedkeuring v0.0.20: de gebruiker bevestigt dat aftellen per oefenblok met bediening naast de oefennaam de gewenste werking is en geeft opdracht verder te gaan met issue #3.

## 29. Los tablatuurvenster — issue #3, v0.0.21

Het vergrootglas bij de tablatuur opent één los venster, zowel bij een bibliotheekoefening als in de sessiespeler. Het venster is onafhankelijk te verplaatsen en in grootte aan te passen, bijvoorbeeld op een tweede scherm. Opnieuw klikken brengt hetzelfde venster naar voren; er ontstaan geen extra exemplaren.

Het venster volgt de actieve oefening, ook tijdens aftellen, evalueren en vrije fragmenttraining. Bij een volgende oefening verschijnt haar afbeelding en naam. Zonder tablatuur toont het venster een duidelijke melding en verdwijnt de vorige afbeelding. Bij het verlaten van de oefening of sessiespeler toont het dat er geen oefening actief is. Afbeeldingen worden lokaal geladen. Een fout toont een melding, geen oude afbeelding.

De muzikant kan in- en uitzoomen op de afbeelding, terug naar Passend en naar volledig scherm. Inzoomen maakt scrollen over de afbeelding mogelijk. Sneltoetsen in dit venster: +/− zoomen, 0 passend, F volledig scherm aan/uit, Escape verlaat volledig scherm. Het zoompercentage is ten opzichte van de passende weergave. Een andere oefening begint passend; vergroten/verkleinen of volledig scherm behoudt de gekozen zoomfactor. Het venster onthoudt geen positie/zoom na sluiten.

Sluiten van het tablatuurvenster stopt of pauzeert de sessie niet. Afspelen, evaluaties en hun bestaande sneltoetsen blijven in het hoofdvenster; het losse venster heeft beeldbediening. Sluiten van het hoofdvenster ruimt ook het tablatuurvenster op. Er is geen wijziging aan oefeningen, sessie-opbouwen, afbeeldingen of historische resultaten door het venster te gebruiken.


Gebruiksgoedkeuring v0.0.21: de gebruiker bevestigt dat het losse tablatuurvenster werkt en geeft opdracht verder te gaan met issue #4.

## 30. Fragmenten kiezen in de waveform — issue #4, v0.0.22

De audio-waveform in de sessiespeler en losse oefeningspeler is interactief. Sleep over het beeld om een fragment te selecteren, ook van rechts naar links. De markeringen A en B zijn afzonderlijk versleepbaar, met grenzen binnen de track en minimaal 0,1 seconde speelduur. Een klik zonder slepen wijzigt de selectie niet. De numerieke begin-/eindinvoer blijft beschikbaar en is gekoppeld aan dezelfde selectie. A/B-markeringen zijn ook met de pijltjestoetsen te verplaatsen (0,01 seconde, Shift 0,1); Home/End verplaatsen naar de toegestane rand.

Met +/− zoom je horizontaal; Hele track herstelt het overzicht en Toon selectie brengt het gekozen fragment in beeld. De schuif en pijlen verschuiven het zichtbare tijdvenster. Met Verschuiven aan sleep je het beeld in plaats van een nieuwe selectie te tekenen; A/B-markeringen blijven bedienbaar. Selectiegrenzen zijn bronseconden en blijven gelijk bij zoomen, pannen of wijzigen van de afspeelsnelheid. Het scherm toont de zichtbare tijdgrenzen en de gekozen A/B-grenzen.

Een selectie in de geplande sessie onderbreekt die sessie via de bestaande vrije fragmenttraining en pauzeert het geluid. De onderbroken herhaling en haar tempo blijven bewaard. Een nieuwe selectie of versleepte markering wordt pas bij loslaten toegepast, niet bij iedere muisbeweging. Fragment beluisteren start de selectie vanaf A als loop; pauze stopt die preview. Dit gebruikt het gekozen oefentempo en de bestaande volume/toonhoogtebediening. Vrije loops blijven apart geregistreerd en tellen niet als geplande herhalingen.

Vanuit deze training kun je het fragment met een naam opslaan voor later gebruik. Selecteren of beluisteren wijzigt de opgeslagen sessie-opbouw niet. Terug naar sessie gebruikt de bestaande hervatregel: de onderbroken geplande herhaling start opnieuw, met aftellen als dat voor deze oefening aan staat; een eerder gepauzeerde sessie wacht op Afspelen. De losse speler gebruikt dezelfde selectie-/previewbediening zonder sessiehistorie te schrijven. Metronoom-oefeningen hebben geen waveform of audioloops.


Gebruiksgoedkeuring v0.0.22: de gebruiker bevestigt de waveformselectie en geeft opdracht verder te gaan met issue #5.

## 31. BPM-herkenning en gehele BPM-weergave — issue #5, v0.0.23

De detector is aangepast om een deel van de dubbele-tempo-missers bij geaccentueerde onderverdelingen te beperken. Een langere periode wordt alleen gekozen wanneer die duidelijk sterker wordt herhaald; snelle gelijkmatige pulsen worden niet standaard gehalveerd. Herkenning blijft een schatting binnen het bestaande analysebereik 40–240 BPM, met handmatige correctie beschikbaar. Nieuwe imports en expliciet BPM opnieuw analyseren gebruiken de aangepaste detector; bestaande oefeningen worden niet automatisch opnieuw geanalyseerd of aangepast.

Bij audio-oefeningen staan Halveer BPM en Verdubbel BPM in het aanmaak-/bewerkformulier. Ze passen het huidige veld aan, zodat de muzikant de bedoelde halve of dubbele tel kan kiezen. Opslaan blijft expliciet. Een handmatig gekozen tempo wordt niet overschreven door een nog lopende analyse. Een ontbrekende of onduidelijke schatting blijft handmatig invulbaar.

BPM-waarden worden overal afgerond als hele getallen getoond: bibliotheek, formulieren, sessietabel, spelers, aftellen, evaluatievoorbeelden, fouten, historie en dashboard inclusief grafieklabels/toegankelijke teksten. Nieuwe handmatige BPM-invoer en BPM-aanpassingen worden bij bevestigen op hele getallen gezet. Tijdgrenzen, toonhoogte en dB behouden hun eigen precisie.

Dit is weergaveafronding. Bestaande bron-BPM, staptempo's, detectieprecisie en historische momentopnamen blijven intern ongewijzigd wanneer je alleen kijkt, een veld zonder wijziging verlaat, of bijvoorbeeld een naam/opdracht wijzigt. Ook berekeningen, bereikvalidatie en voortgangscontext blijven de precieze waarden gebruiken. Alleen een expliciete tempo-aanpassing wijzigt het betreffende tempo. Historische resultaten worden niet herschreven.

Gecontroleerde gegenereerde ritmepatronen tonen verbetering; dit is geen algemene nauwkeurigheidsclaim op echte muziekopnamen. Eenzelfde hoorbare puls kan bijvoorbeeld 90 BPM of een schaars gespeelde 180 BPM betekenen. Ook sterke afwisselende accenten kunnen zowel kwartnoten als achtsten voorstellen; de voorkeur voor de langere periode kan bij een andere bedoelde tel een halve-tempo-uitkomst geven. Die bedoelde tel kan de detector niet altijd vaststellen; luisteren en zo nodig halve/dubbele of handmatige correctie blijven nodig. Zie docs/BPM.md voor de meetreeks en beperkingen.

Gebruiksgoedkeuring v0.0.23: de gebruiker accepteert de BPM-stap en vraagt bij het delen om een informele ondertekening als erkenning van de maker.

## 32. Oefeningen delen en maker vermelden — issue #7, v0.0.24

Vanuit Oefeningen kun je één oefening exporteren als één `.htbexercise`-bestand. Het bevat de oorspronkelijke audio indien aanwezig, tablatuur/foto, opdracht, bron-BPM en analysegegevens, volumenormalisatie, benoemde fragmenten en bij een metronoom maatsoort en maten per herhaling. Het werkt volledig offline en zonder account. Audio wordt niet opnieuw gecodeerd. Een sessie-opbouw, aftelinstellingen per sessieblok en persoonlijke voortgang worden niet meegestuurd.

Bij export kun je optioneel een makernaam of artiestennaam toevoegen (maximaal 120 tekens), plus een korte persoonlijke boodschap (maximaal 1000 tekens). Een boodschap hoort bij een ingevulde makernaam. Dit is een informele erkenning van de maker, geen gecontroleerde identiteit of digitale handtekening. Beide velden mogen leeg blijven. Het exportformulier vult een bestaande makervermelding alvast in; de exporteur kan de vermelding voor dit bestand expliciet wijzigen of weglaten. Exporteren bewerkt de oorspronkelijke bibliotheekoefening niet.

Na import blijft de vermelding zichtbaar bij de oefening als Gemaakt door … met de eventuele boodschap. Naam- of opdrachtwijzigingen aan de oefening behouden de makervermelding. Bij opnieuw delen wordt die bewaarde vermelding weer voorgesteld. Oudere oefeningen zonder maker blijven bruikbaar zonder vermelding.

Oefening importeren opent een bestandskeuze en daarna een voorvertoning met naam, oefentype, BPM, aantal opgeslagen fragmenten, opdracht en makervermelding. Vóór bevestiging kun je de oefennaam veranderen. Bestaat die naam al (hoofdletterongevoelig), dan verschijnt een waarschuwing: kies eventueel een andere naam, of importeer bewust als nog een nieuwe oefening. Een import krijgt altijd nieuwe oefening-/fragmentidentiteiten en eigen mediakopieën; bestaande oefeningen, sessies en historie worden niet overschreven. Annuleren voegt niets toe.

Beschadigde, te grote of onbekende exportformaten krijgen een melding. Het bestand wordt vóór import volledig gecontroleerd; een mislukte opslag laat geen gedeeltelijke oefening of mediakopie achter. De bestaande grenzen blijven gelden: audio tot 50 MB, afbeelding tot 12 MB, maximaal 100 benoemde fragmenten. Het deelbestand zelf mag maximaal 84 MB zijn. Het is bedoeld om één oefening te delen, niet als volledige bibliotheekback-up. Zie docs/OEFENING-DELEN.md voor formaat en controles.

Gebruiksgoedkeuring v0.0.24: de gebruiker accepteert de deelstap met makerherkenning en geeft opdracht door te gaan met taalkeuze.

## 33. Nederlands en Engels — issue #6, v0.0.25

De volledige appinterface is beschikbaar in Nederlands en Engels, inclusief spelers, sessietabel, evaluatie, voortgang/historie, fragmenten, import/export, makervermeldingslabels, meldingen, toegankelijke bediening en het losse tablatuurvenster. Appmenu en eigen teksten in bestandsdialogen volgen de appkeuze. De standaard OS-bediening in native dialogen volgt het besturingssysteem.

Zonder opgeslagen voorkeur volgt de app de systeemtaal: Nederlands bij nl/nl-NL/nl-BE, anders Engels. In een browservoorvertoning geldt de browsertaal. In Instellingen kiest de gebruiker Nederlands of English; de handmatige keuze blijft lokaal bewaard en wint bij een volgende start van de systeemtaal. Een onleesbare of ongeldige voorkeur valt terug op de systeemkeuze. Bij een mislukte opslag verschijnt een melding en blijft de vorige taal actief.

Wisselen werkt direct, zonder herstart. De taalkeuze staat uitsluitend in Instellingen. De eerdere compacte taalkeuze in de paginakop vervalt op gebruikersverzoek van 16 oktober 2026. Wisselen gebeurt via Instellingen; navigeren vanuit een actieve sessie volgt de bestaande stopbevestiging. De taalwijziging zelf herlaadt de app niet en herschrijft geen tempo, fragmentgrenzen, evaluaties of eigen inhoud. Een open tablatuurvenster wisselt mee en behoudt afbeelding/zoom.

Alleen appteksten en datumweergave veranderen. Eigen oefen-/sessienamen, opdrachten, fragmentnamen, evaluatienotities en makernaam/boodschap blijven letterlijk behouden. Opgeslagen audio, sessie-opbouwen en historische momentopnamen worden niet vertaald of herschreven. De taalvoorkeur hoort bij de lokale app, niet bij een gedeeld oefenbestand. De bediening met cijfertoetsen, Spatie en Enter blijft gelijk. Engelse datumweergave gebruikt en-GB; Nederlandse nl-NL. Dagindeling en geregistreerde tijden blijven ongewijzigd.

Gebruiksgoedkeuring v0.0.25: de gebruiker accepteert de taalkeuze en vraagt aanvullend een About/Info-knop met het concept en een overzichtelijke puntsgewijze functiesamenvatting.

## 34. Info over HITtheBeat — issue #17, v0.0.26

Onderaan de zijbalk staat Info over HITtheBeat. De knop opent een leesbaar informatievenster boven het huidige scherm, ook tijdens een oefensessie. Het toont het concept van het programma als persoonlijk oefenmaatje: losse oefeningen samenbrengen in een gericht muziekmoment, spelen op eigen tempo, lastige passages uitlichten en met korte evaluaties en zichtbare voortgang regelmatig oefenen.

Een puntsgewijze samenvatting beschrijft de gerealiseerde functies: eigen audio met opdracht/tablatuur en volumenormalisatie; BPM-schatting en onafhankelijke tempo-/toonhoogtebediening; opgeslagen oefensessies met fragmenten/herhalingen/BPM en totale duur; metronoom en aftellen; A–B-looptraining met bewaren en hervatten; evaluaties en volgende-tempo-keuze; voortgang/historie; offline delen met makererkenning; lokale opslag, taalkeuze en toetsen-/muisbediening. De tekst presenteert geen open voorstellen als beschikbare functies en noemt geen onbewezen detectienauwkeurigheid. De actuele appversie staat erbij.

De informatie volgt Nederlands/Engels. Het venster is te scrollen op kleinere schermen en sluit met Sluiten, de onderste terugknop of Escape. De focus keert terug naar de Info-knop. Openen/sluiten navigeert niet weg, wijzigt geen opgeslagen gegevens en onderbreekt geen spelende sessie; bestaande formulierinvoer blijft staan. Sneltoetsen in het informatievenster bedienen de onderliggende speler niet.


## 35. Eerste downloadbare release

Vastgesteld op 16 oktober 2026: de gebruiker accepteert het infovenster en geeft opdracht een eerste release te maken. Een echte Windows-gebruikstest volgt zodra de gebruiker een Windows-machine met Codex beschikbaar maakt.

De eerste uitgave is daarom `1.0.0-rc.1`, gemarkeerd als pre-release: macOS Apple Silicon (DMG en ZIP) en Windows x64 (ZIP, volledig uitpakken). De Windows-installer is nog niet geleverd; de Mac-cross-build van NSIS vereist een Intel-hulpprogramma/Rosetta. De app werkt zelfstandig en offline, met bestaande lokale opslag en zonder account, telemetry of automatische updates. Downloads bevatten geen persoonlijke bibliotheek of oefenmedia.

Dit is een handmatig gepubliceerde testrelease, geen afgeronde Windows-acceptatie of voltooiing van releaseautomatisering (#8). Windows-installer, native Windows-controles, muzikale luisterbeoordeling en CI/tag-automatisering blijven expliciet open. De Mac-app is ad-hoc ondertekend en niet genotariseerd; Windows is niet ondertekend. De projectlicentie blijft onbeslist (`UNLICENSED`); meegeleverde dependencyvermeldingen kiezen geen projectlicentie. Zie docs/RELEASE.md en docs/WINDOWS-TEST.md.

Vervolg op 16 oktober 2026: de gebruiker geeft na de Windows-controle opdracht de gevonden tablatuur- en testproblemen vanaf RC1 te herstellen op een aparte branch, met afzonderlijke commits, Windows-regressie en een reviewbare PR. De volgende kandidaat heet `1.0.0-rc.2`; de gepubliceerde RC1 blijft ongewijzigd. Volledig scherm in het tablatuurvenster moet op Windows de juiste knopstatus tonen en met Escape verlaten kunnen worden. Dit herstelt de bestaande afspraak, zonder opslag- of designwijziging. Mac-regressie en muzikale luisterbeoordeling blijven afzonderlijke acceptatiecontroles. Zie docs/RC2-WINDOWS.md.


## 36. Rustigere interface — issue #21

Vastgesteld op 16 oktober 2026: taalkeuze is alleen zichtbaar in Instellingen, zonder extra keuze in de algemene interface. De bewaarde voorkeur en directe vertaling blijven werken. Deze plaatsingsafspraak vervangt de eerdere compacte taalkeuze bovenaan.

In Oefeningen staat Oefening verwijderen direct naast Oefening importeren in de bovenste actiebalk. De actie verwijdert de geselecteerde oefening na de bestaande bevestiging en verwijzingscontrole. Zonder selectie, tijdens een bewerk-/toevoegformulier of tijdens verwijderen is de knop uitgeschakeld. De actiebalk mag omslaan bij een smal venster. Geen wijziging aan opslag, audio of Windows-fullscreenherstel.


## 37. Definitieve release 1.0.0

De gebruiker accepteert de interfacewijzigingen van #21 en geeft expliciet opdracht versie 1.0.0 met installers voor Mac en Windows te publiceren. Gebruik dezelfde bronversie inclusief Windows-RC2-herstel en #21: Mac Apple Silicon DMG en Windows x64 per-user NSIS-installer, met ZIP-alternatieven en SHA-256-controlegetallen. Dit vervangt voor deze uitgave de eerdere afspraak uitsluitend testreleases uit te geven. Geen zelfstandige PR-merge of verplaatsing van RC1-tag.

De app blijft offline, zonder automatische updates, met dezelfde lokale appdata en schema 10. De installers bevatten geen persoonlijke media. Mac is ad-hoc ondertekend/niet genotariseerd; Windows is niet ondertekend. Windows-runner bouwt de definitieve installer; eerdere fysieke Windows-RC2-installatie-/upgradetests blijven herkenbaar afzonderlijk. Muzikale luisterkwaliteit, interactieve OS-waarschuwingen en projectlicentiekeuze blijven open; UNLICENSED wordt niet stilzwijgend gewijzigd. Publiceer als definitieve GitHub-release, niet als pre-release, na geslaagde pakketcontroles.


## 38. Ontwikkelprocedure na milestone 1

Vastgesteld op 17 oktober 2026: na afronding van milestone 1 maakt de gebruiker issues op GitHub en bundelt maximaal tien issues in een volgende releasemilestone. Binnen een door de gebruiker gestarte milestone handelt de agent de geselecteerde issues zelfstandig af en keurt ze inhoudelijk goed op basis van acceptatiecriteria, review en passende gerichte tests. Na aantoonbare afhandeling en vastgelegde goedkeuring mag het geselecteerde issue worden gesloten. Niet na ieder issue een nieuwe gebruikersgoedkeuring of volledige regressietest.

De volledige gecureerde testreeks wordt uitsluitend in de releasefase uitgevoerd. De gebruiker heeft de beschreven testcuratie en zelfstandige PR-merges binnen een gestarte milestone goedgekeurd. Daardoor mogen geverifieerde issuewijzigingen zelfstandig worden samengevoegd en issues worden gesloten; de hoofdbranch blijft actueel.

Aanvullend vastgesteld op 17 oktober 2026: na afronding van de geselecteerde issues en de volledige regressie volgt een handmatige eindcontrole door de gebruiker, vóór het bouwen van de nieuwe release-installers. De agent levert wijzigingsoverzicht, testresultaten, beperkingen en een testbare ontwikkelversie met exacte broncommit/voorgestelde versie. Pas na expliciet akkoord starten de automatische installerbuilds. Daarna volgen gerichte pakket-/installatiecontroles en publicatie; daarvoor is geen tweede routinematig akkoord nodig. Bij relevante codewijziging na akkoord moet de gewijzigde bron opnieuw gevalideerd en voorgelegd worden. De releasemilestone sluit na geslaagde publicatie en administratieve controle.

De procedure is actief na de gecontroleerde afsluiting van milestone 1 op 17 oktober 2026. De gebruiker heeft het samenvoegen van deze afspraken in PR #25 expliciet bevestigd; PR #26 implementeert de CI-scheiding en handmatige gate. AGENTS.md bevat de uitvoeringsafspraken; geen wijziging van appgedrag.


## 39. Afronding milestone 1 en bijwerken GitHub

De gebruiker geeft op 17 oktober 2026 expliciet opdracht milestone 1 af te handelen en GitHub actueel te maken. Daarmee is samenvoegen van het goedgekeurde milestone-1-werk naar main en sluiten van aantoonbaar afgeronde issues geautoriseerd. De gepubliceerde tag v1.0.0 en haar downloads blijven ongewijzigd.

Het resterende werk van #8 wordt afgemaakt: gerichte PR-controles op Mac en Windows; bij een nieuwe release/tag volledige regressie, daarna verplichte handmatige goedkeuring vóór installerbuilds, beide native platforminstallers met pakket-/opslagcontrole en gezamenlijke publicatie met hashes. De GitHub-omgeving release-approval vereist RoJoRZ als reviewer en staat geen beheerdersbypass toe. Deze afronding creëert geen nieuwe release en verleent de agent geen bevoegdheid om zelf de handmatige eindcontrole goed te keuren.

Milestone 1 is op 17 oktober 2026 gesloten: tien gesloten issues en nul open issues. De goedgekeurde app-/release-PR's en de resterende CI-afronding (#26) staan op main. De geaccepteerde appbron is gelijk aan v1.0.0; tag en downloads zijn ongewijzigd. De gerichte CI-run https://github.com/RoJoRZ/HITtheBeat/actions/runs/39016523327 slaagt op Mac en Windows (per platform negen Node-tests, één starttest en vier installatieharnas-tests). PR #25 werd aanvankelijk tegengehouden door automatische goedkeuringscontrole. De gebruiker heeft daarna expliciet bevestigd ook deze PR samen te voegen; daarmee wordt de goedgekeurde algemene werkwijze actief.


## 40. Release 1.1.0 — eenvoudigere evaluatie (#28)

Op 17 oktober 2026 start de gebruiker milestone Release 1.1.0 volgens hoofdstuk 38. De geselecteerde scope is #28 (evaluatie) en #27 (voortgang); geen aanvullende issues.

De evaluatie biedt geen veld meer om een opmerking toe te voegen. Cijfer, tempo-aanpassing, herhalen en Enter/toetsenbediening blijven gelijk. Nieuwe evaluaties bewaren een lege notitie voor compatibiliteit. Bestaande opmerkingen blijven ongewijzigd in historische momentopnamen.


## 41. Voortgang in één overzicht — Release 1.1.0 (#27)

De gebruiker heeft op 17 oktober 2026 opdracht gegeven dit geselecteerde milestone-issue te verwerken. Het dashboard krijgt vier periodes: Week (maandag tot vandaag), Maand (kalendermaand tot vandaag), Jaar (twaalf kalendermaanden terug tot vandaag, schrikkeldag begrensd op 28 februari) en Altijd. De drie samenvattingen tonen werkelijk gespeelde oefentijd, oefendagen en oefensessies in die periode. Pauzes, evaluaties en aftellen tellen niet mee; gestopte/onderbroken sessies tellen mee voor hun gespeelde tijd. De bestaande toerekening aan de lokale startdag blijft gelden.

Eén tempografiek toont alle geoefende oefeningen; één scoregrafiek toont alle bewaarde beoordelingen. De oefening-checkboxen verbergen een oefening in beide lijngrafieken, zonder totalen of staafdiagram te veranderen. Contexten (sessie-opbouw, oefenblok, fragment, originele broninstellingen, toonhoogte en geplande/vrije training) blijven afzonderlijke lijnen met de oefeningkleur. Er wordt geen tempoverbetering tussen verschillende contexten verzonnen. Per context/sessie geldt de hoogste BPM uit afgeronde geplande herhalingen of werkelijk gespeelde vrije training; de score is de laatste bijpassende eigen beoordeling. Geen ontbrekend cijfer invullen. Puntlabels vermelden datum, oefening en context; hele BPM-getallen zijn weergave, geen opslagafronding.

Het staafdiagram toont hoe vaak elke oefening is geoefend in de gekozen periode, met namen onder 45 graden. Tel eenmaal per oefening-identiteit per gespeelde sessie, ook als meerdere blokken/fragmenten/herhalingen voorkomen. Vrije training en gedeeltelijke uitvoering tellen bij gespeelde tijd mee. Deze telwijze staat zichtbaar in het dashboard. Gelijknamige oefeningen blijven verschillende identiteiten.

Oefentijd per dag heeft een eigen, aaneengesloten venster van 30 dagen: aanvankelijk de laatste 30 inclusief vandaag; Vorige/Volgende bladeren telkens 30 dagen zonder gaten of overlap. Dit staat los van de periode bovenaan. Geen bladeren naar de toekomst; terug stopt zodra er geen oudere gespeelde historie is. Exacte dagtijden blijven via de dagtabel toegankelijk.

Het vak Laatste resultaat en de gedetailleerde sessie-/oefeninginformatie verdwijnen uit dit scherm. Opgeslagen sessies, evaluaties, oorspronkelijke notities en bronmomentopnamen blijven intact. De UI toont uitsluitend eigen geschiedenis en werkt offline, in Nederlands en Engels. Geen schemawijziging of nieuwe bibliotheekafhankelijkheid.

Bij direct wisselen van taal vertalen ook de historische contextlabels in de grafieken. De gekozen periode, verborgen oefeningen en dagvenster blijven daarbij staan; eigen namen en opgeslagen historie worden niet vertaald.


## 42. Definitieve release 1.1.0

Op 17 oktober 2026 heeft de gebruiker de ontwikkelapp na handmatige eindcontrole geaccepteerd en expliciet akkoord gegeven voor de release. Dit akkoord betreft versie 1.1.0 op bron 7ac4d8a115bfe9f6d4da19f2e3c05ae087add266: de eenvoudigere evaluatie (#28) en het vernieuwde dashboard (#27), inclusief live contextvertaling. De volledige native regressie is op beide platformen geslaagd: elk 111 Node-tests en 31 desktop-/audiotests.

Het expliciete gebruikersakkoord is vastgelegd bij de bestaande workflowgate; dezelfde workflow bouwt daarna Mac arm64 DMG/ZIP en Windows x64 per-user NSIS/ZIP, controleert de werkelijk geinstalleerde app met tijdelijke gegevens en publiceert de bestanden gezamenlijk met SHA-256-controle. Geen nieuwe volledige regressie op ongewijzigde productcode na het akkoord.

De bestaande bibliotheek, schema 10, appdatapaden en afhankelijkheden blijven gelijk. Mac is ad-hoc ondertekend en niet genotariseerd; Windows is niet ondertekend. Geen nieuwe claim over muzikale luisteracceptatie of fysieke Windows-gebruikstest. De oorspronkelijke 1.0.0 blijft behouden. Milestone 2 sluit na geslaagde publicatie en administratieve controle.

Release 1.1.0 is op 17 oktober 2026 definitief gepubliceerd, met vier platformdownloads, controlegetallen en instructies. Beide native installercontroles zijn geslaagd (elk vier gerichte tests). De automatische conceptpublicatie is na een tag-opvraagfout op dezelfde release-ID met gecontroleerde hashes afgerond; geen wijziging aan de goedgekeurde appbron. Zie docs/RELEASE-1.1.0.md.


## Fragmentbediening robuuster — issue #36 (24 oktober 2026)

Geïmplementeerd op de issuebranch: A/B slepen in de losse oefeningspeler en sessiespeler gebruikt bij mislukte pointer capture een vensterbrede terugval, ook bij loslaten buiten de waveform. De definitieve loslaatpositie bepaalt de selectie als een laatste bewegingsevent ontbreekt. Een klik zonder slepen, annuleren of focusverlies in de terugvalroute behoudt de vorige grenzen. Audio gebruikt de bestaande selectie-/looproute; sessie-opbouwen en historische momentopnamen wijzigen niet.

Aanleiding is een Windows-gebruiker bij wie markeringen en audioloop op de vorige grenzen blijven staan. De precieze oorzaak en Windows-versie zijn niet vastgesteld. Dit is een defensieve reparatie, geen bewezen oplossing op de betrokken machine. Praktijkcontrole daar blijft open; er is geen nieuwe release gepubliceerd.


## Releasevoorbereiding 1.1.1 — 24 oktober 2026

De gebruiker heeft de reparatie gecontroleerd en expliciet opdracht gegeven PR #37 samen te voegen en een nieuwe release te maken. #37 is samengevoegd na groene gerichte Mac/Windows-CI; #36 is gesloten. Voorgestelde patchversie: 1.1.1, uitsluitend de defensieve fragmentbediening uit #36. Geen schema-/historiewijziging of nieuwe afhankelijkheden. De bestaande releaseketen blijft gelden: volledige native regressie op vaste bron, testbare ontwikkelapp en daarna expliciet gebruikersakkoord bij release-approval vóór de nieuwe installers en publicatie. Controle van de oorspronkelijke Windows-oorzaak blijft open. Zie docs/RELEASE-1.1.1.md.


### Release 1.1.1 gepubliceerd — 25 oktober 2026

Na controle van de ontwikkelapp heeft de gebruiker expliciet toestemming gegeven voor de release. Bron `4ff243d0eedd0a1d36a2229c8bfa5fc896435947`: volledige native Mac/Windows-regressie groen (elk 120 Node- en 32 desktop-/audiotests), daarna akkoord via release-approval, native installerbuilds en elk vier gerichte pakkettests. Release 1.1.1 met Mac arm64 DMG/ZIP en Windows x64 NSIS/ZIP is automatisch gepubliceerd. Tag, zeven assets en digests gecontroleerd; run 40081653930 volledig groen. Geen opslag-/historiewijziging, geen nieuwe milestone of wijziging aan bestaande releases. Zie docs/RELEASE-1.1.1.md. Oorzaak op de oorspronkelijke Windows-machine blijft onbevestigd.

## Release 1.2.0 — dashboardbeheer, vastgesteld 28 oktober 2026

De gebruiker heeft milestone Release 1.2.0 gestart met issues #40–#42 en één menselijke eindcontrole vóór nieuwe release-installers. Dashboard beheren staat in Instellingen. Bewaarde standaardperiode: Week/Maand/Jaar/Altijd, initieel Altijd; een tijdelijke keuze op Voortgang verandert die voorkeur niet. Getoond tempo: Minimum (initieel), Maximum of Gemiddelde. Eén tempolijn per oefenidentiteit, één meetpunt per sessie; alle gespeelde fragmenten, volledige oefening en gedeeltelijk gespeelde herhalingen tellen samen. Geen splitsing naar fragment, sessie-opbouw of toonhoogte. Minimum/maximum gebruiken werkelijk gespeelde BPM; gemiddelde weegt naar werkelijk gespeelde oefentijd. Geen geplande maar ongespeelde tempi. Keuze verandert alleen weergave, niet historie.

Ook vastgesteld voor deze milestone: scoregrafiek en cijferinvoer vervallen; oude cijfers blijven bewaard. Evaluatie biedt tempo, herhalen en doorgaan. Voortgang per oefening verwijderen vraagt bevestiging met titel, aantal sessies en oefentijd; verwijdert resultaten uit alle dashboardtotalen/grafieken/ritme, behoudt bibliotheekoefening en overige resultaten uit gemengde sessies. Nieuwe training verschijnt opnieuw. Details en teststatus: docs/RELEASE-1.2.0.md. Persoonlijke gegevens worden tijdens ontwikkeling niet automatisch gewist.

### #41 — evaluatie zonder cijfers

De cijferstap en scoregrafiek zijn verwijderd. Evaluatie start bij 1 · Langzamer, 2 · Gelijk houden, 3 · Sneller; daarna zo nodig het aantal BPM. Enter bewaart en gaat door, herhalen blijft beschikbaar. Standaard tempo gelijk en 5 BPM aanpassing. Nieuwe evaluaties zonder cijfer krijgen geen fictieve 3; oude expliciete cijfers blijven ongewijzigd bewaard. Deze afspraak vervangt de eerdere cijferinvoer uit hoofdstuk 18/19 en scoreweergave uit hoofdstuk 23. Overige tempo-/sessieregels blijven behouden.


### #42 — bewaarde voortgang verwijderen

Dashboard beheren toont alle oefenidentiteiten met gespeelde historie, ook na verwijderen uit de bibliotheek, met sessieaantal en oefentijd. Gelijke namen zijn afzonderlijke identiteiten. De actie toont een native waarschuwing met oefening, sessies en seconden; Annuleren is standaard. Bevestigen wist alleen gespeelde resultaten en evaluaties voor de gekozen oefenidentiteit. Oefening/media, sessie-opbouwen en historische oefen-/opbouwmomentopnamen blijven behouden. Geaggregeerde gespeelde tijden en herhalingen worden opnieuw uit de resterende resultaten bepaald; overige resultaten blijven intact. Een lege historische sessie blijft als momentopname bestaan maar telt niet meer mee in het dashboard. Nieuwe training verschijnt weer. Wissen wordt geweigerd bij een lopende sessie met deze oefening of gewijzigde gegevens na de bevestigingspreview.


### Releasevoorbereiding 1.2.0

#40, #41 en #42 zijn geïmplementeerd en samengevoegd via PR #43, #44 en #45. Voorgestelde versie 1.2.0 bevat uitsluitend deze gestarte milestonescope. De volledige native regressie volgt op de vaste releasebron; daarna één menselijke eindcontrole met ontwikkelapp. Nieuwe installers en publicatie wachten op expliciet akkoord. Geen persoonlijke voortgang is tijdens de ontwikkeling gewist.


### Release 1.2.0 gepubliceerd — 28 oktober 2026

De gebruiker heeft de ontwikkelversie getest en expliciet akkoord voor release gegeven. Versie 1.2.0 is gepubliceerd vanuit bron `a56c71c047f607da355f056ad4eda4bb563dad79`: dashboardinstellingen en één tempografiek per oefening inclusief fragmenten, verwijderen van cijfers en beheer van bewaarde voortgang. Native Mac/Windows-regressie: elk 125 Node- en 34 desktop-/audiotests; daadwerkelijke pakketcontroles: elk vier geslaagd. Run 40707188776 is geslaagd; alle zeven releasebestanden en digests zijn gecontroleerd. Milestone 3 is na publicatie gesloten met drie gesloten issues (#40–#42) en nul open issues. Zie [releaseverslag](docs/RELEASE-1.2.0.md) en [downloads](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.2.0). Persoonlijke resultaten zijn niet door de agent verwijderd. Geen nieuwe milestone starten zonder gebruikersopdracht.


## Release 1.3.0 — gestart 29 oktober 2026

Milestone 4 bevat uitsluitend #50–#53. Geaccepteerd: eerste tel per oefening bij aanmaken/bewerken, optioneel beat-snappen voor fragmenten; onderzoek dubbele audio; klikbare oefenblokken naar eerste stap met behoud spelen/pauze en werkelijk gespeelde tijd; evaluatie met bewaarde Audio/Alleen metronoom-keuze per stap vanaf de volgende uitvoering van de oefensessie, zoals tempoaanpassingen. Aantal kwarttellen van het oorspronkelijke geselecteerde fragment blijft gelijk, speelduur schaalt met BPM. Enter gaat zonder wijzigingen door. Volgorde #51 → #50 → #53 → #52. Eén menselijke eindcontrole na volledige native regressie en vóór installers. De scheiding private ontwikkeling/publieke downloads blijft geparkeerd.


### #50 — eerste tel en beat-raster

Geïmplementeerd: optionele Eerste tel in bronseconden bij Oefening aanmaken/bewerken, met lokale audio beluisteren en Hier begint een tel. Leeg betekent vrije selectie. Instellen bewaart het raster per oefening; beide spelers bieden Vastklikken op tel (aan bij beschikbaar raster), uit voor vrije selectie. Raster volgt origineel BPM, ook bij ander speeltempo. Bestaande grenzen worden niet automatisch aangepast; expliciet slepen/toetsen past de selectie aan. Audio vervangen behoudt de instelling zolang geldig; ongeldige positie wordt geweigerd. Oude oefeningen en snapshots blijven compatibel zonder raster. Export/import bewaart de eerste tel.


### #53 — direct naar oefenblok springen

De bovenste oefenblokken zijn knoppen (ook via toetsen bereikbaar). Spring naar eerste stap/herhaling van gekozen blok. Spelen/aftellen blijft spelen met eigen aftelinstelling, ready/pauze blijft stil; tijdens evaluatie spring je gepauzeerd en onbevestigde keuzes worden niet opgeslagen. Gespeelde tijd/passes blijven behouden; ongespeelde voorgaande pending blokken worden Overgeslagen, geen fictieve herhalingen. Opnieuw bezoeken zet doelblok op pending. Actieve oefening/tablatuur volgt bestaande routes. Na sessieafronding zijn de knoppen uitgeschakeld.


### #52 — audio of metronoom per sessiestap

De evaluatie van een audioblok begint met Tempo aanpassen of Audio/metronoom kiezen; toetsen 1/2 kiezen deze routes, Enter gaat vanuit de beginstand zonder wijzigingen door. De klankroute toont alle stappen van dit oefenblok met Alleen metronoom per stap; uitgevinkt is audio. Bevestigen bewaart deze keuzes per stap in de sessie-opbouw voor de volgende uitvoering van de oefensessie, net als de tempoaanpassing. De huidige sessie en haar herhalingen houden de oorspronkelijke momentopname; andere blokken en bibliotheekoefeningen blijven gelijk. Een nieuwe sessie neemt de bewaarde keuzes over, ook na herstart en opbouwbewerking. In een volgende evaluatie kan weer voor Audio worden gekozen. Bij een conflicterende editorwijziging wordt geen instelling overschreven.

Bronseconden blijven leidend: aantal kwarttellen = fragmentduur × origineel BPM / 60; speelduur = fragmentduur × origineel BPM / speel-BPM. Niet afronden naar hele tellen/maten. Track klinkt niet, metronoom en eventueel aftellen wel; gedeeld volume/dempen blijft gelden. Pauze/herstart/vrije fragmenttraining stoppen oude klikken. Vrije fragmenttraining gebruikt audio; terugkeer naar de geplande stap volgt weer haar momentopname. Werkelijk gespeelde historie bewaart klank per resultaat; bestaande resultaten krijgen geen verzonnen veld. Dit vervangt de eerdere agentinterpretatie ‘alleen lopende sessie’ en volgt de gebruikersafspraak ‘volgende herhaling van de oefensessie, zoals snelheid’.


### Releasevoorbereiding 1.3.0

#51/#50/#53/#52 zijn samengevoegd via PR #54/#55/#56/#57 na gerichte controles en zelfreview. Voorgestelde versie 1.3.0, schema 12. Volledige native regressie volgt op vaste bron; ontwikkelapp is toegestaan, nieuwe installers/publicatie wachten op de ene expliciete menselijke eindcontrole. De testmatrix en beperkingen staan in docs/RELEASE-1.3.0.md.


### 1.3.0 gereed voor menselijke eindcontrole — 29 oktober 2026

Alle vier geselecteerde issues zijn uitgevoerd via PR #54–#57, met #52-toepassingscorrectie in #60 en testcuratie #59/#61. Definitieve bron `430ac0863dabd51899fd77d42e5c925ba940ce1d`, versie 1.3.0, schema 12. Run 40923261862 is native Mac/Windows groen: elk 130 Node- en 38 desktop-/audiotests plus build/typecheck. De ontwikkelapp is op beide bronnen product-identiek; aparte lokale reviewkopie en launcher staan klaar. Zie docs/RELEASE-1.3.0.md voor bewijs, hash en controlepunten. Eén expliciet menselijk eindakkoord blijft verplicht vóór nieuwe installers. Milestone 4 blijft open; nog geen tag of publicatie. De bronoorzaak van dubbele audio op de gebruikersopname is niet bewezen.
