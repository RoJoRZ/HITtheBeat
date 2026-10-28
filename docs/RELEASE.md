# HITtheBeat - installatie en releaseproces

Kies de gewenste uitgave op [GitHub Releases](https://github.com/RoJoRZ/HITtheBeat/releases). Gebruik de tag en downloadbestanden van dezelfde versie. De releasetag legt de precieze bron vast; main kan al latere ontwikkeling bevatten. De oorspronkelijke [1.0.0](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.0.0) blijft ongewijzigd; het historische verslag staat in RELEASE-1.0.0-NOTES.md. Voor wijzigingen en controles van 1.1.0: RELEASE-1.1.0.md. Voorbereiding 1.2.0: zie RELEASE-1.2.0.md. Patch [1.1.1](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.1.1) is gepubliceerd; zie RELEASE-1.1.1.md.

## Downloads

Vervang `<versie>` door de versie van de gekozen GitHub-release.

| Bestand | Platform / installatie |
| --- | --- |
| HITtheBeat-<versie>-mac-arm64.dmg | Mac Apple Silicon: open de schijfkopie, sleep HITtheBeat naar Programma's, koppel de schijfkopie los. Geen Rosetta nodig. |
| HITtheBeat-<versie>-mac-arm64.zip | Mac-alternatief: volledig uitpakken en HITtheBeat.app naar Programma's verplaatsen. |
| HITtheBeat-<versie>-win-x64.exe | Windows x64: per gebruiker installeren, eigen installatiemap mogelijk. |
| HITtheBeat-<versie>-win-x64.zip | Windows-alternatief: volledige map uitpakken en HITtheBeat.exe daarin starten. |
| SHA256SUMS.txt | SHA-256 van alle vier downloads. |

Mac is ad-hoc ondertekend/niet genotariseerd; Windows is niet ondertekend. OS-waarschuwingen kunnen voorkomen. Beveiliging niet algemeen uitschakelen. Geen Intel Mac-/Windows ARM-build. De ZIP is geen aparte draagbare bibliotheekmodus.

Sluit een bestaande app voor installatie/vervanging en maak vooraf een reservekopie van de eigen appdatamap. Mac: `~/Library/Application Support/HITtheBeat`; Windows: `%APPDATA%\HITtheBeat`. De bibliotheek staat daaronder in `library` en is geen onderdeel van de download/installatiemap. Instellingen bevat Bibliotheekmap openen. Dezelfde appId/productName/userData blijft in gebruik. Deinstallatie wist de bibliotheek niet. Oude apps openen op nieuwere gegevens is geen ondersteunde rollback: herstel zo nodig een vooraf gemaakte kopie.

Controle: `shasum -a 256 <bestand>` op Mac, `Get-FileHash <bestand> -Algorithm SHA256` in PowerShell. Vergelijk de exacte bestandsnaam met SHA256SUMS.txt. Hashes verifieren de bytes, geen uitgeversidentiteit.

## Bron en bouwen

Gebruik voor een gepubliceerde versie de bijbehorende `v<versie>`-tag. Node 24 en pnpm 11.25.0, frozen lockfile. Voor lokale ontwikkeling: `pnpm install --frozen-lockfile`, `pnpm setup:desktop`, `pnpm build`, daarna `pnpm start`. Gerichte tests volgen de geraakte functie; de volledige regressie hoort bij de releaseketen hieronder. Nieuwe release-installers niet lokaal vooruit bouwen voordat de gebruiker de vaste bron heeft goedgekeurd.

## Pipeline en publicatie

De eerste 1.0.0 is met een native Windows-runner en lokale Mac-build gepubliceerd; de bron en assets blijven behouden. Het resterende #8-werk levert nu een gezamenlijke releaseworkflow voor volgende versies: [RELEASE-AUTOMATISERING.md](RELEASE-AUTOMATISERING.md). De oude eenmalige Windows-workflow is vervangen, zodat zij niet naast de nieuwe workflow alsnog installers zonder handmatige gate bouwt.

PR's krijgen gerichte controles; de volledige regressie hoort in de releaseworkflow. Na geslaagde regressie wacht de workflow op menselijke goedkeuring via release-approval. Pas daarna bouwen beide platformen installers en controleren ze de werkelijk geïnstalleerde app met geïsoleerde testgegevens. Gezamenlijke publicatie verifieert upload-digests en vervangt nooit een bestaande release of tag.

Historisch RC1-bewijs: RELEASE-RC1.md en WINDOWS-RC1-RESULTATEN.md. Fysieke Windows-RC2-controles, inclusief upgrade RC1 → RC2 en gegevensbehoud: RC2-WINDOWS.md. Die historie bewijst niet automatisch iedere toekomstige installer. Muzikale luisterbeoordeling op diverse echte muziek en interactieve SmartScreen/Gatekeeper-bediening blijven afzonderlijke grenzen.

## Licenties

Eigen projectlicentie nog onbeslist (`UNLICENSED`); deze publicatie kiest geen open-sourcelicentie. Dependencyvermeldingen staan in Resources/licenses (Mac) of resources/licenses (Windows), inclusief Electron/Chromium en Signalsmith. Geen nieuwe runtime-afhankelijkheden. De app blijft offline bruikbaar zonder account, telemetry of automatische updates.
