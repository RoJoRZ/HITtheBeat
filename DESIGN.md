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


## Normalisatie en volumeregeling

Zet een compacte rij met luidspreker-/dempenknop, label Volume, horizontale schuif en percentage direct onder de afspeelbediening. Gebruik Mandarijn voor de schuif en dezelfde focusstijl als de overige bediening. Maak gedempt zichtbaar met icoon, knoptekst voor hulptechnologie en de tekst Gedempt. Geef de schuif toetsenbordbediening zonder dat Spatie de speler start.

In het import-/bewerkformulier staat Geluidsniveau normaliseren standaard aan voor nieuwe oefeningen. Toon de gemeten dB-correctie en eventuele begrenzing als toelichting. Bij bestaande oefeningen staat Volume normaliseren bij deze instelling; de gebruiker bewaart de wijziging met de gewone opslagknop. In de oefeningsdetails staat of normalisatie aan, uit of nog niet gemeten is.


## Evaluatie met toetsenbord (v0.0.9)

Toon de beoordeling als vijf genummerde knoppen en de tempokeuze als drie knoppen: 1 Langzamer, 2 Gelijk houden, 3 Sneller. De gekozen knoppen krijgen een Mandarijn-vulling; de actieve invoergroep krijgt een Mandarijn-rand. Houd de twee betekenissen van cijfers visueel uit elkaar met genummerde groepskoppen. Toon bij de primaire Verder-knop de hint Enter en boven de groepen de standaardwaarden 3/5 en gelijk houden.

Bij sneller/langzamer verschijnt het BPM-veld met de bestaande voor/na-opbouw. Selecteer de klaarstaande 5 zodat meteen typen deze vervangt. Behoud de notitie en de secundaire actie Deze serie opnieuw. In de sessiehistorie staat het bewaarde cijfer als Beoordeling: x/5 bij de betreffende evaluatie.


## Vaste schermteksten (11 oktober 2026)

Gebruik **Jouw muziekmoment** als bovenregel (in de bestaande hoofdletterstijl), **Mijn oefensessies** in de navigatie en als paginatitel, en **Vind je ritme, ontwikkel je spel.** als ondertitel van die pagina. Deze door de gebruiker gekozen combinatie vervangt de eerdere drie teksten.


## Benoemde fragmenten (v0.0.11)

Gebruik in de sessietabel de fragmentkiezer: Volledige track, de fragmenten van de gekozen oefening als Naam · A–B s, en Eigen fragment A–B. Toon begin- en eindtijden naast de keuze en accepteer zowel punt als komma. Een bewaarde selectie waarvan de bron is gewijzigd of verwijderd krijgt de tekst bewaarde selectie met haar oorspronkelijke tijden.

Bij een oefening staat een paneel Opgeslagen fragmenten met namen, tijden en acties voor toevoegen/bewerken/verwijderen. Het compacte formulier bevat naam, Begin A (seconden), Einde B (seconden), bewaren en annuleren. De speler biedt onder de A/B-bediening Fragment opslaan, gevolgd door een naamveld en een zichtbare bevestiging. De bediening voor Terug naar rondje blijft beschikbaar. Gebruik de bestaande donkere panelen, Mandarijn-acties en focusstijl.


## Fase 6B — Eigen omgeving zonder omschakelen (v0.0.12)

De dagelijkse interface opent direct op Mijn oefensessies met eigen gegevens. De voorbeeldbanner en knoppen om tussen voorbeelden en eigen bibliotheek te wisselen verdwijnen. Bij een lege bibliotheek krijgt het toevoegen van de eerste oefening een duidelijke actie. Voortgang toont echte historie totdat het dashboard is gebouwd. Deze fase is geïmplementeerd op 11 oktober 2026. De lege startpagina toont Begin met jouw oefeningen en de actie Naar oefeningen; daar staat Oefening toevoegen.


## Sessies als startoverzicht (v0.0.13)

Mijn oefensessies toont Recente oefensessies met maximaal tien kaarten in de bestaande donkere panelen. Elke kaart bevat naam, aantal oefeningen, geplande duur en laatste oefenmoment. Gebruik Mandarijn voor Starten en een secundaire knop voor Bewerken. Nieuwe oefensessie staat bovenaan. Alleen bij meer dan tien is Alle oefensessies zichtbaar; daar staan een gelabeld zoekveld en Terug naar recente sessies. De editor verschijnt pas na Nieuwe oefensessie of Bewerken en biedt Terug naar overzicht. Kaarten passen in één kolom op smalle vensters.


## Voortgangsdashboard met eigen resultaten (fase 7, v0.0.14)

Volg render 17 met drie rustige samenvattingskaarten, de tempo-grafiek met context en een kaart met het laatste resultaat ernaast. De kaarten tonen werkelijk geoefende tijd, oefendagen en geoefende sessies. De bestaande periodekeuze bevat Deze week, Deze maand en Alle tijd. Op smalle vensters staan grafiek en resultaat onder elkaar.

Gebruik een mandarijnlijn en punten voor BPM, met gelabelde assen en exacte waarden in een uitklapbare tabel. Eén meting toont één punt. De onderdeelkeuze noemt sessie-opbouw, oefenblok, oefening, fragment, geplande/vrije training, oorspronkelijk BPM en bronduur; afwijkende toonhoogte staat erbij. Herhaal de actieve context leesbaar onder de kiezer.

Onder de grafiek volgt Jouw oefenritme met dagbalken en een tabel met tijden. De bestaande historie blijft onderaan beschikbaar, gefilterd op dezelfde periode. Toon lege resultaten zonder voorbeeldprestaties. Cijfers 1–5 en notities blijven zelfevaluaties; voeg geen automatische labels over speelkwaliteit toe.

## Instellingen en audio-import (v0.0.15)

De zijbalk bevat Mijn oefensessies, Oefeningen, Voortgang en Instellingen. De tijdelijke Audioproef is verwijderd. Instellingen gebruikt dezelfde panelen, typografie en Mandarijn-acties. Lokale bibliotheek legt de ongewijzigde kopieën uit en biedt Bibliotheekmap openen. Audio importeren noemt MP3, M4A met AAC, de 50 MB-grens en de ALAC-beperking. Het oefenformulier heeft één zichtbaar label Audiobestand (MP3 of M4A) en meldt fouten vóór opslaan.

## Compact appicoon — v0.0.16

Op verzoek: een centrale H met symmetrische audiostreepjes, Mandarijn #FF922E op Studio donker #141719. Afgerond donker vlak met transparante buitenhoeken. Het volledige logo linksboven blijft behouden. Vectorbron: `design/app-icon.svg`; afgeleide PNG, ICNS en meerformaats-ICO in `build/`. Het icoon wordt toegepast in Dock, appvenster en Mac-/Windows-pakketten. Visuele gebruiksfeedback blijft welkom.

## Metronoom als oefentype — issue #1, v0.0.17

De bestaande Studio donker/Mandarijn-stijl blijft leidend. Oefentype staat bovenaan het formulier. Metronoom toont maatsoort, kwartnoot-BPM, naam, opdracht en optionele tablatuur; upload/analyse/normalisatie verdwijnen daar. Opgeslagen oefeningen houden hun type. De lijst en het detail benoemen Metronoom en maatsoort in plaats van een lege audiobestandsnaam of trackduur.

De sessietabel gebruikt dezelfde kolommen en rijen: in Fragment / maten staat bij een metronoom een Maten-invoer (standaard 8); A en B zijn niet van toepassing. Het speelscherm behoudt tablatuur en opdracht. De waveform wordt voor metronoom vervangen door maatsoort, aantal maten en actuele tel, met dezelfde transport- en volumebediening. Vrij fragment oefenen is daar uitgeschakeld. Tempo en werkelijke duur blijven zichtbaar; evaluatie gebruikt de bestaande toetsenbediening. De losse metronoomspeler vermeldt expliciet dat lokale instellingen opgeslagen sessies niet wijzigen.

### Gebruiksfeedback v0.0.18: maten bij de oefening

Maten per herhaling staat bij de maatsoort in het metronoomformulier, zowel bij aanmaken als bewerken. Het detail toont het opgeslagen aantal. De sessietabel toont alleen het aantal maten; de invoer hoort bij Oefeningen → Bewerken. De losse speler verwijst voor het aantal naar Bewerken. De formulieruitleg benoemt dat opslaan ook toekomstige sessie-opbouwen bijwerkt; gespeelde resultaten blijven behouden. Oude afwijkende stapinstellingen krijgen een herkenbare toelichting tot de oefening wordt opgeslagen. Dit vervangt de maten-invoer in de sessietabel uit v0.0.17.

## Aftelmaat per sessie — issue #2, v0.0.19

De editor toont een eigen paneel Aftelmaat boven de stappentabel. Een checkbox schakelt aftellen in; de keuze Maatsoort aftelmaat is anders uitgeschakeld en toont standaard 4/4. Oefentijd, aftellen en totaal staan bij elkaar als aftellen aan staat. Sessies in het startoverzicht vermelden de voorbereidingstijd apart onder de totale geplande duur.

Tijdens aftellen staat boven de gebruikelijke transportbediening een Mandarijn kader met Aftellen, maatsoort, tel en BPM. Het scherm behoudt tablatuur, opdracht en de komende stap/herhaling. De telindicatie spreekt niet iedere schermverversing via een live-regio uit. Play/pause, herstart, overslaan en de bestaande toetsen blijven bereikbaar. De afteltijd heeft een eigen teller naast sessie-afspelen, fragmenttraining en pauze. Historie toont aftellen alleen voor sessies met deze instelling; bestaande schermen zonder aftellen blijven herkenbaar hetzelfde.
