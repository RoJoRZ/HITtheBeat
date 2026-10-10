# HITtheBeat — Designrichtlijnen

Bijgewerkt: 10 oktober 2026.

## 1. Status en gekozen richting

De gebruiker heeft **Studio donker, B — Mandarijn** gekozen. De basisreferentie is [het oorspronkelijke Studio donker met Mandarijn](design/10-studio-mandarijn.png). Het eerdere kleurstaal #FC4C02 en de eerdere varianten met andere lettertypen zijn niet leidend.

De gebruiker heeft op 10 oktober 2026 de stijl en de vier nieuwe schermdesigns goedgekeurd. Deze vormen samen met onderstaande richtlijnen het uitgangspunt voor ontwikkeling. Concrete font- en maatvoeringkeuzes vertalen de renders naar een reproduceerbare interface en worden bij de eerste werkende schermen visueel gecontroleerd. Functioneel gedrag volgt `FUNCTIONEEL.md`; goedkeuring van een render stelt geen onbesproken functionaliteit vast.

## 2. Visueel karakter

Een rustige, professionele oefenomgeving met donkere grafietvlakken, lichte tekst en warme oranje accenten. Eenvoudige omrande panelen, beperkte afronding en heldere uitlijning. Gebruik geen gloed, decoratieve verlopen, glasachtige panelen of wisselende stijlen per scherm.

Oranje markeert een primaire actie, selectie, focus of de audio. Maak niet ieder paneel oranje. Behoud de oorspronkelijke humanistische sans-serifuitstraling van Studio donker.

## 3. Kleuren

Onderstaande waarden zijn concrete implementatietokens die het gekozen beeld vertalen naar reproduceerbare kleuren. Renders zijn geen pixelnauwkeurige specificatie.

| Token | Waarde | Gebruik |
| --- | --- | --- |
| background | #141719 | Appachtergrond. |
| surface | #1B2024 | Panelen en kaarten. |
| surface-raised | #23292E | Verhoogde bediening en hovervlakken. |
| surface-inset | #111619 | Waveform, opdrachtinvoer en verdiept vlak. |
| border | #343D44 | Subtiele randen en scheidingslijnen. |
| text | #F2F4F6 | Hoofdtekst. |
| text-muted | #A9B2BA | Secundaire tekst en labels. |
| accent | #FF922E | Mandarijn, primaire acties en actieve bediening. |
| accent-hover | #FFA34F | Hover op primaire actie. |
| on-accent | #141719 | Tekst en iconen op gevulde oranje knoppen. |
| success | #7CDBA1 | Bevestiging met tekst en icoon; geen tweede merkkleur. |
| error | #F08B87 | Fouten met een concrete melding. |

Selectievlakken gebruiken het accent met circa 10–14% dekking plus een zichtbare rand, indicator of vinkje. Disabled bediening behoudt leesbare tekst en krijgt een duidelijke niet-actieve toestand. Controleer contrast in de implementatie: minimaal 4,5:1 voor normale tekst en 3:1 voor grote tekst en belangrijke bediening. Gebruik kleur nooit als enige statusindicator.

## 4. Typografie

Voorgestelde implementatie: **Source Sans 3**, lokaal meegeleverd, voor alle schermen. Dit benadert de open, iets smalle humanistische letters van het oorspronkelijke Studio donker. Gebruik geen serifkoppen of alternatieve letterfamilie per scherm. Controleer de fontlicentie bij opname en lever de vereiste licentietekst mee.

| Toepassing | Grootte | Gewicht |
| --- | ---: | ---: |
| Paginatitel | 32 px | 700 |
| Paneeltitel | 22 px | 600 |
| Geschreven oefenopdracht | 18 px | 400 |
| Hoofdtekst, tabel en bediening | 16 px | 400 / 600 |
| Metadata en toetshints | 14 px | 400 |

Tekst heeft ongeveer 1,45 regelhoogte; langere opdrachten circa 1,55. Gebruik tabulaire cijfers voor BPM, tijd, herhalingen en toonhoogte. Toon expliciet de eenheid: BPM, min of halve tonen. Essentiële instructies en bediening worden niet kleiner gemaakt om meer inhoud te laten passen.

## 5. Raster en componenten

- Afstanden volgen een 4px-raster, doorgaans 8, 12, 16, 24 en 32 px.
- Panelen hebben 8px afronding en een rustige 1px rand; interne padding meestal 20–24 px.
- De zijbalk is op ruime desktopvensters circa 220–240 px breed. De inhoud gebruikt de resterende breedte met 24px buitenruimte en 16–24px tussen panelen.
- Knoppen en invoervelden zijn circa 44px hoog. De primaire afspeelknop is 64–72px. Icoonknoppen hebben een bruikbaar klikvlak en een toegankelijk label.
- Gebruik één consistente set eenvoudige lijniconen. Een actieve navigatieoptie heeft een subtiel oranje vlak en een zichtbare oranje indicator.
- Primaire knoppen zijn oranje met donkere tekst; secundaire knoppen donker met lichte tekst en rand. Beperk concurrerende primaire acties binnen één taak.
- Getalvelden gebruiken dezelfde min/waarde/plusbediening. Direct typen blijft mogelijk; een ongeldige waarde krijgt een melding bij het veld.
- Selectie, hover, toetsenfocus, laden, leeg, fout en disabled krijgen expliciete toestanden. Focus heeft een zichtbare ring met voldoende scheiding van bestaande randen.

De referentiebeelden zijn 1536×1024. Bij kleinere vensters mag de inhoud scrollen en kunnen panelen onder elkaar komen. Geef tablatuur ruimte met behouden beeldverhouding. Vermijd het verkleinen van het hele scherm als één afbeelding.

## 6. Schermen

### Rondje samenstellen

Gebruik de bewerkbare tabel uit de basisreferentie. Groepeer stappen visueel per oefenblok. Kolommen tonen oefening, fragment, herhalingen, BPM en de nog voorgestelde toonhoogte per stap. De totale geplande duur blijft duidelijk zichtbaar. Invoeren en afspelen hebben een eigen schermindeling.

### Speelscherm

[Referentie](design/14-speelscherm-mandarijn.png).

De belangrijkste ruimte gaat naar **tablatuur, speler en geschreven opdracht**. Bovenaan staat compacte context: oefening, rondje, speelbeurt en resterende geplande tijd. Op een ruim venster heeft de tablatuur ongeveer twee derde en het opdrachtvak ongeveer één derde van de bovenste inhoudsrij. De brede speler staat eronder.

Het speelscherm bevat daarnaast een compact afspeellijstoverzicht van **het hele oefenrondje**, met alle oefeningen in volgorde en de huidige oefening gemarkeerd. Afgeronde en komende oefeningen blijven herkenbaar. Dit overzicht geeft rondjecontext; het is niet de bewerkbare opbouwtabel. Speler, tablatuur en opdracht behouden de belangrijkste ruimte. De schermproef v0.0.3 toont dit volledige overzicht nog niet; de feedback van de gebruiker maakt dit een expliciet aandachtspunt voor de verdere schermuitwerking.

Het opdrachtvak heeft de titel ‘Opdracht’ en eventueel ‘Let op’ met aandachtspunten. Het is direct leesbaar naast de tablatuur; essentiële instructies verdwijnen niet achter een tab. Lange opdrachten kunnen binnen een bruikbaar tekstvlak scrollen. Zonder afbeelding benutten speler en opdracht de vrijgekomen ruimte.

De speler toont waveform, tijdschaal, A/B-handgrepen, huidige afspeelpositie, afspelen/pauzeren, opnieuw, loop, tempo, toonhoogte en ‘Fragment oefenen’. Tijdlabels verwijzen naar de brontrack. Selectie en afspeelpositie moeten onderscheidbaar zijn. Gebruik labels en vormen naast kleur.

Bij vrije fragmenttraining behoudt het scherm deze opbouw, met duidelijke status ‘Fragment oefenen · Rondje onderbroken’ en de actie ‘Verder met mijn rondje’. De geplande resterende tijd en werkelijk geoefende tijd worden niet samengevoegd. Dit is een richtlijn voor een nog te renderen toestand.

### Oefeningenbibliotheek

[Referentie](design/15-bibliotheek-mandarijn.png).

Een lijst met oefeningen links en details rechts. De details tonen audiobestand, herkenbaar/corrigeerbaar brontempo, opdracht, afbeelding en een compacte audiovoorvertoning. ‘Oefening toevoegen’ staat bij de paginatitel. Een zoekveld is een voorstel voor navigatie, nog geen apart vastgestelde functionele eis.

### Evaluatie

[Referentie](design/16-evaluatie-mandarijn.png).

Een korte, rustige pagina met oefencontext, beoordeling, optionele notitie en keuze voor de volgende keer. ‘Nog een keer’ en ‘Opslaan en verder’ hebben duidelijk verschillende gevolgen. Toon een aangepaste tempo-opbouw vóór opslaan. De concrete beoordelingsopties en toepassing van de BPM-verandering blijven functionele voorstellen.

### Voortgang

[Referentie](design/17-voortgang-mandarijn.png).

Een beperkt aantal samenvattingen, een leesbare BPM-grafiek met context en recente sessies. Vergelijk volledige tracks en fragmenten niet als dezelfde prestatie. Toon bij een grafiek welke oefening, welk rondje en welk onderdeel zijn geselecteerd. Benoem gespeeld tempo; stel niet dat een hoog BPM automatisch beheersing betekent.

Beoordelingen zijn die van de muzikant. Teksten over stabiliteit of ontspannen spelen mogen alleen uit de evaluatie/notitie komen; de render impliceert geen automatische beoordeling van het spel. Getallen en sessies in alle beelden zijn fictieve voorbeeldinhoud.

## 7. Toetsen en toegankelijkheid

Knoppen en toetsen sturen dezelfde acties aan. Spatie en 1 worden als compacte toetshints getoond; definitieve sneltoetsen volgen de functionele afspraken. In invoervelden blijven tekst en getallen normaal te typen. Focusvolgorde volgt de visuele taakvolgorde. A/B-selectie moet naast slepen ook met invoer of toetsen mogelijk zijn in de uiteindelijke bediening.

Iconen krijgen toegankelijke namen; statusmeldingen zijn ook als tekst beschikbaar. Een afbeelding van tablatuur blijft een gebruikersbestand en wordt niet automatisch gegenereerd of getransponeerd. Deze renders tonen uitsluitend illustratieve tablatuur.

## 8. Onderhoud

Werk dit document bij bij gewijzigde designafspraken. Verwerk wijzigingen in gedrag ook in `FUNCTIONEEL.md`. Gebruik dezelfde tokens, typografie, iconen en componenttoestanden in alle schermen. Nieuwe schermen borduren op deze richting voort. Bewaar renders en prompts in `design/` en versieer de documenten met Git.

De vier nieuwe schermen zijn met de ingebouwde imagegen-tool gemaakt op basis van de gekozen Mandarijnreferentie. Prompts staan in `design/mandarijn-schermen-prompts.json`. De beelden zijn visueel bekeken op stijl en hoofdindeling; definitieve contrast- en interactiecontrole volgt in de werkende app.

## 9. Werkende audioproef

Fase 1 voegt een tijdelijk, expliciet benoemd scherm ‘Audioproef’ toe. Het volgt dezelfde kleuren en Source Sans 3, met de golfvorm en transportbediening centraal, daaronder tempo/toonhoogte en A/B-invoer. Bestandskeuze, proefstatus en bedieningsuitleg blijven zichtbaar. Dit scherm valideert audio; de volledige spelerindeling met tablatuur en opdrachtvak volgt in fase 2 volgens render 14.

## 10. Doorloopbare schermen (v0.0.3)

De werkende voorbeelden volgen renders 10 en 14–17. De zijbalk begint met de drie productpagina’s; Audioproef blijft een aparte proefpagina. Een vaste voorbeeldmelding maakt fictieve gegevens herkenbaar. Lege toestanden zijn apart te bekijken.

De rondjetabel gebruikt dezelfde min/getal/plusbediening als de speler. Op smallere vensters scrollt alleen de brede tabel horizontaal. De totale duur staat boven de tabel; onderaan staat de route naar de speler. Voorbeeldstappen zijn tijdelijk aanpasbaar, geen opgeslagen rondjes.

In de speler krijgt de tablatuur circa twee derde en de opdracht circa één derde van de bovenste rij. De paginakop is daar compact zodat de afspeelbediening eerder in beeld komt. Onder 1000 px vensterbreedte staan tablatuur en opdracht onder elkaar. Een lange opdracht scrollt binnen het opdrachtvak; zonder tablatuur benut het opdrachtvak de breedte. Vergroten van voorbeeldtablatuur gebruikt een dialoog met sluitknop en Escape.

De speler hergebruikt de audioproef met waveform, transport en getalbediening. Bij brede vensters staan transport, BPM en toonhoogte op één rij. A/B blijft daarnaast exact via seconden instelbaar. Evaluatie en dashboard volgen de goedgekeurde paneelopbouw, met herkenbare voorbeeldkeuzes en fictieve resultaten. Screenshots en controles staan in `docs/FASE-2.md`.

## Bibliotheek en rondje-overzicht in v0.0.4

De voorbeeldspeler toont boven tablatuur/opdracht een compacte horizontale lijst van de oefenblokken. Het huidige blok heeft een mandarijnrand; de contextregel toont oefening X van Y. Iedere kaart noemt de oefening en tempo-opbouw. Meer blokken kunnen horizontaal scrollen. De lijst blijft compact zodat tablatuur en afspeelbediening centraal staan; de notatie kan vergroot worden bekeken. De proef toont geen fictieve voltooiingsstatus. Definitieve voortgangsmarkeringen worden bij de echte uitvoering aangesloten.

Eigen gegevens hebben een herkenbaar andere melding dan de voorbeeldomgeving. De echte bibliotheek gebruikt dezelfde lijst/detailindeling en kleuren. Het invoerformulier heeft zichtbare labels, een status voor de BPM-analyse en een aparte bevestiging van het originele BPM. Het detail toont zowel schatting als bevestigd tempo. De opdracht ondersteunt regeleinden en scrollt bij lange inhoud; de afbeelding behoudt haar verhouding en kan in een dialoog worden vergroot. De speler is aangesloten op de lokale kopie van de MP3. Een ontbrekende afbeelding verhindert oefenen niet.

## Eigen rondje-editor in v0.0.5

De eigen rondjes gebruiken dezelfde Studio donker/Mandarijn-stijl. Boven de tabel staan de rondjekeuze, naam en geplande totale duur. Iedere oefening heeft een eigen blokkop met bronkeuze, origineel tempo en verplaats-/verwijderknoppen. Daaronder staan de stappen met volledige track of fragment, A/B-seconden, herhalingen en BPM. Acties hebben zichtbare knoppen en afzonderlijke toegankelijke labels.

De tabel kan binnen haar paneel horizontaal scrollen op kleinere vensters; de hele pagina hoort niet horizontaal te verschuiven. De geplande duur blijft buiten dat scrolldeel zichtbaar. Ongeldige invoer toont een melding en geen misleidende tijd. Onder de tabel staan de wijzigingsstatus en de primaire actie ‘Rondje opslaan’. Een dialoog voorkomt onbedoeld verlies bij het wisselen van concept of verwijderen van een opgeslagen rondje. De toonhoogtekolom blijft een voorstel in de voorbeelden en wordt nog niet aan de echte editor toegevoegd.

## Eigen rondjespeler in v0.0.6

Een gestart rondje heeft een rustige spelermodus met de rondjenaam, een compacte lijst van alle oefenblokken en de huidige oefening als eigen titel. De huidige kaart heeft een mandarijnrand. Statuswoorden onderscheiden Huidige oefening, Hierna, Afgerond en Overgeslagen; kleur is niet de enige aanwijzing.

Tablatuur en opdracht staan boven de brede speler. Stap/herhaling, BPM en oorspronkelijk fragment blijven zichtbaar. De primaire transportknop bedient afspelen/pauzeren. Fragmenttraining heeft een duidelijke eigen titel en een vaste actie ‘Terug naar rondje’; extra A/B-, tempo- en toonhoogtevelden verschijnen alleen in die vrije modus. Het rondje-overzicht blijft daarbij in beeld.

Na ieder oefenblok verschijnt een rustige terugblik met ‘Deze oefening opnieuw’ en ‘Verder’. Dit is herkenbaar tijdelijk, zonder fictief opgeslagen evaluatieresultaat. De tijdstrook onderscheidt rondje-afspelen, vrije training en pauze. Navigatie uit een onvoltooid rondje toont een bevestigingsdialoog en laat de sessie bij annuleren gepauzeerd beschikbaar.


## Fase 6: evaluatie en sessiehistorie

De evaluatie staat in het bestaande spelerpaneel, na de gehele fragmentserie. Toon de oefennaam, stapnummers en fragmentgrenzen; bied dezelfde serie opnieuw of Verder aan. De keuze Hetzelfde/Sneller/Rustiger, BPM-aanpassing, zichtbare voor/na-opbouw en optionele notitie staan bij elkaar. Benoem expliciet dat een wijziging voor de volgende sessie en voor de hele gekozen oefening geldt. Behoud Studio donker en Mandarijn.

Voortgang toont in deze fase rustige kaarten met echte sessiehistorie. Iedere kaart heeft datum, rondje, een expliciete status en werkelijk geoefende tijd. Fragmenten, tempo’s, toonhoogte, afgeronde speelbeurten en evaluaties zijn uitklapbaar. Gestopt, onderbroken en overgeslagen mogen niet de indruk van een volledig afgerond rondje geven. Grafieken volgen in fase 7.
