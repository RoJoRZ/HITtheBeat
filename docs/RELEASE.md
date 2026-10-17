# HITtheBeat 1.0.0 — installatie en releaseproces

[Definitieve release v1.0.0](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.0.0). De gebruiker heeft publicatie expliciet opgedragen na acceptatie van Windows-herstel en de interfaceaanpassingen. Bron: `codex/issue-8-final-release`, inclusief Windows-RC2 en #21. De goedgekeurde wijzigingen zijn naar main samengevoegd; de releasetag blijft het precieze bronpunt van de gepubliceerde downloads.

## Downloads

| Bestand | Platform / installatie |
| --- | --- |
| HITtheBeat-1.0.0-mac-arm64.dmg | Mac Apple Silicon: open de schijfkopie, sleep HITtheBeat naar Programma's, koppel de schijfkopie los. Geen Rosetta nodig. |
| HITtheBeat-1.0.0-mac-arm64.zip | Mac-alternatief: volledig uitpakken en HITtheBeat.app naar Programma's verplaatsen. |
| HITtheBeat-1.0.0-win-x64.exe | Windows x64: per gebruiker installeren, eigen installatiemap mogelijk. |
| HITtheBeat-1.0.0-win-x64.zip | Windows-alternatief: volledige map uitpakken en HITtheBeat.exe daarin starten. |
| SHA256SUMS.txt | SHA-256 van alle vier downloads. |

Mac is ad-hoc ondertekend/niet genotariseerd; Windows is niet ondertekend. OS-waarschuwingen kunnen voorkomen. Beveiliging niet algemeen uitschakelen. Geen Intel Mac-/Windows ARM-build. De ZIP is geen aparte draagbare bibliotheekmodus.

Sluit een bestaande app vóór installatie/vervanging en maak vooraf een reservekopie van de eigen appdatamap. Mac: `~/Library/Application Support/HITtheBeat`; Windows: `%APPDATA%\HITtheBeat`. De bibliotheek staat daaronder in `library` en is geen onderdeel van de download/installatiemap. Instellingen bevat Bibliotheekmap openen. Zonder expliciet testargument blijft dezelfde appId/productName/userData in gebruik; geen nieuwe opslagmigratie. Deïnstallatie wist de bibliotheek niet. Oude apps openen op nieuwere gegevens is geen ondersteunde rollback: herstel zo nodig een vooraf gemaakte kopie.

Controle: `shasum -a 256 <bestand>` op Mac, `Get-FileHash <bestand> -Algorithm SHA256` in PowerShell. Vergelijk de exacte bestandsnaam met SHA256SUMS.txt. Hashes verifiëren de bytes, geen uitgeversidentiteit.

## Bron en bouwen

Gebruik voor de definitieve versie tag `v1.0.0`. De hoofdbranch bevat de geaccepteerde appbron en latere workflow-/documentatieafronding. Node 24 en pnpm 11.25.0, frozen lockfile.

```sh
git checkout v1.0.0
pnpm install --frozen-lockfile
pnpm setup:desktop
pnpm build
pnpm test
# Op Mac Apple Silicon:
pnpm package:mac
# Op Windows x64:
pnpm package:win
# Na verzamelen van alle vier definitieve bestanden:
node scripts/release-checksums.mjs
```

## Pipeline en publicatie

De eerste 1.0.0 is met een native Windows-runner en lokale Mac-build gepubliceerd; de bron en assets blijven behouden. Het resterende #8-werk levert nu een gezamenlijke releaseworkflow voor volgende versies: [RELEASE-AUTOMATISERING.md](RELEASE-AUTOMATISERING.md). De oude eenmalige Windows-workflow is vervangen, zodat zij niet naast de nieuwe workflow alsnog installers zonder handmatige gate bouwt.

PR's krijgen gerichte controles; de volledige regressie hoort in de releaseworkflow. Na geslaagde regressie wacht de workflow op menselijke goedkeuring via release-approval. Pas daarna bouwen beide platformen installers en controleren ze de werkelijk geïnstalleerde app met geïsoleerde testgegevens. Gezamenlijke publicatie verifieert upload-digests en vervangt nooit een bestaande release of tag.

Historisch RC1-bewijs: RELEASE-RC1.md en WINDOWS-RC1-RESULTATEN.md. Fysieke Windows-RC2-controles, inclusief upgrade RC1 → RC2 en gegevensbehoud: RC2-WINDOWS.md. Die historie bewijst niet automatisch iedere toekomstige installer. Muzikale luisterbeoordeling op diverse echte muziek en interactieve SmartScreen/Gatekeeper-bediening blijven afzonderlijke grenzen.

## Licenties

Eigen projectlicentie nog onbeslist (`UNLICENSED`); deze publicatie kiest geen open-sourcelicentie. Dependencyvermeldingen staan in Resources/licenses (Mac) of resources/licenses (Windows), inclusief Electron/Chromium en Signalsmith. Geen nieuwe runtime-afhankelijkheden. De app blijft offline bruikbaar zonder account, telemetry of automatische updates.
