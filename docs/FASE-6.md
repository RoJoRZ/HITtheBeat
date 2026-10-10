# Fase 6 — Evaluaties en sessiehistorie, v0.0.7

Eigen rondjes evalueren nu na iedere fragmentserie. Resultaten blijven lokaal bewaard, ook na afsluiten en heropenen.

## Proberen

1. Open de eigen bibliotheek en kies een rondje met meerdere tempo’s voor hetzelfde fragment. Voeg daarna een ander fragment of een volgende oefening toe.
2. Start het rondje. Alle tempo’s en herhalingen van het eerste fragment lopen door zonder evaluatie tussendoor.
3. Bij de fragmentwissel verschijnt de evaluatie. Een paar seconden lezen of nadenken verhoogt de oefentijd niet.
4. Kies ‘Deze serie opnieuw’. Alleen de zojuist gespeelde fragmentserie herhaalt, op haar oorspronkelijke tempo’s. Een eventuele notitie wordt bewaard.
5. Kies na de serie Sneller of Rustiger en bijvoorbeeld 5 BPM. Bekijk de volledige voor/na-opbouw: alle stappen van deze oefening in dit rondje krijgen dezelfde aanpassing. Andere oefeningen en rondjes veranderen niet.
6. Kies Verder. De huidige sessie houdt haar oorspronkelijke tempo’s; de aangepaste opbouw is voor de volgende sessie. Bevestig eventueel bij een latere serie nog een aanpassing; de getoonde toekomstige waarden nemen eerdere aanpassingen mee.
7. Rond het rondje af en kijk bij Voortgang. Klap de fragmenten en evaluaties open: afgespeelde instellingen, vrije training, afgeronde speelbeurten en notities zijn herkenbaar.
8. Sluit en open de app opnieuw. Het rondje bevat de nieuwe tempo’s; de vorige sessie toont nog de werkelijk gespeelde oorspronkelijke tempo’s.
9. Stop een volgend rondje vroegtijdig. De historie noemt deze sessie Gestopt. Overgeslagen oefeningen tellen niet als afgerond.

## Tijd en bewaren

Werkelijk oefenen = rondje-afspelen + vrije fragmenttraining. Pauzes, evaluatie, laden en wisselen tellen niet mee. Opnieuw afspelen telt als extra oefentijd. Tijdelijke vrije loops worden niet als geplande herhalingen geteld.

Checkpoint-opslag gebeurt iedere seconde en bij overgangen. Bewust stoppen wacht op bewaren. Bij venstersluiten of een onverwachte onderbreking blijft de laatst bewaarde voortgang zichtbaar als Onderbroken bij afsluiten; het laatste onopgeslagen interval kan ontbreken. Hervatten op de oude afspeelpositie is nog niet beschikbaar. Een nieuw gestart rondje is een nieuwe sessie.

Een evaluatie en de bijbehorende toekomstige BPM-aanpassing worden samen opgeslagen. Dubbele verzoeken met dezelfde evaluatie-ID veranderen de opbouw slechts eenmaal. Bij een opslagfout of gewijzigd rondje blijft de evaluatie open. Een intussen gewijzigd rondje kan niet vanuit de oude sessie worden overschreven; bewaren zonder tempoaanpassing blijft mogelijk.

## Grenzen

Er zijn nog geen voortgangsgrafieken: die volgen in fase 7. Aanvullende beoordelingen zoals Nog lastig/Ging goed/Voelt vertrouwd blijven een voorstel. Toonhoogte per geplande tabelrij, aftellen en ingestelde extra pauzes blijven open. Muzikale kwaliteit en BPM-herkenning op meer echte muziek blijven te beoordelen. Een Windows-build is nog geen Windows-gebruikstest.

## Controles

- 25 Node-tests geslaagd: seriegrenzen, herhalen van alleen de huidige serie, resterende duur, migratie vanaf schema 2, bewaarde momentopnamen, éénmalige BPM-aanpassing per blok, verhoging en verlaging, transactieterugdraaiing bij ongeldige tempo’s, gewijzigde rondjes, verouderde checkpoints en onderscheid tussen afgerond/overgeslagen/gestopt/onderbroken.
- De bestaande desktopcontroles voor audio/DSP, ontwikkelserver, bibliotheek, editor, voorbeelden en venster/heropenen zijn geslaagd.
- De volledige nieuwe desktoproute is geslaagd: evaluatie bij fragmentwissel, drie speelbeurten zonder tussenevaluatie, opnieuw dezelfde serie, +5 BPM voor het hele gekozen oefenblok, huidige tempo’s ongewijzigd, andere blokken/rondjes ongewijzigd, acht afgeronde speelbeurten, historie en opnieuw openen, normaal stoppen en onderbreken bij afsluiten.
- Een gerichte conflictproef bevestigt dat een mislukte evaluatie zichtbaar open blijft, geen BPM wijzigt en daarna zonder BPM-aanpassing kan worden bewaard.
- De bestaande volledige route met vrije fragmenttraining en de route met ontbrekende media zijn opnieuw geslaagd.

## Pakketcontrole

Het Mac arm64-pakket van v0.0.7 is gebouwd en getest: 9 desktopcontroles geslaagd. De 2 broncodecontroles voor DSP en ontwikkelserver worden bewust overgeslagen in het pakket; die zijn afzonderlijk op de ontwikkelversie geslaagd. De pakketproef bevestigt ook dat vrije training op het aangepaste fragment, tempo en toonhoogte bewaard blijft, zonder vrije loops als geplande herhalingen te tellen.

- [Evaluatie bij een fragmentwissel](screenshots/fase-6-evaluatie.png)
- [Bewaarde sessie met fragmenten en evaluaties](screenshots/fase-6-sessiehistorie.png)


Het Windows x64-pakket van v0.0.7 is eveneens gebouwd. Het is nog niet op een Windows-computer uitgevoerd of beluisterd.
