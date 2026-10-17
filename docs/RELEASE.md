# HITtheBeat 1.0.0 — installatie en releaseproces

[Definitieve release v1.0.0](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.0.0). De gebruiker heeft publicatie expliciet opgedragen na acceptatie van Windows-herstel en de interfaceaanpassingen. Bron: `codex/issue-8-final-release`, inclusief Windows-RC2 en #21. Geen automatische PR-merge; de releasetag is het precieze bronpunt voor bouwen/testen, niet een willekeurige checkout van main.

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

Gebruik voor de definitieve versie tag `v1.0.0`. De hoofdbranch kan achterlopen zolang PR's niet zijn samengevoegd. Node 24 en pnpm 11.25.0, frozen lockfile.

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

`.github/workflows/windows-release.yml` bouwt op Windows bij PR's, tags en pushes naar de expliciete final-releasebranch. Pinned officiële checkout/setup-node/artifact-actions; standaard alleen contents:read. Node 24/pnpm 11.25.0, frozen install, typecheck/productiebouw, Node-tests, native NSIS/ZIP, gerichte tests tegen het daadwerkelijk uitgepakte ZIP-pakket, stille installatie in pad met spaties, starten via pakkettest en deïnstallatie. Tests gebruiken tijdelijke geïsoleerde appdata. Windows-downloads krijgen hashes en worden als runartifact bewaard. Alleen de aparte draft-job op de expliciete releasebranch krijgt contents:write om de door gebruiker gevraagde 1.0.0 als concept met Windows-assets klaar te zetten. PR's publiceren niets. Geen persoonlijke signing-credentials of updater.

Mac wordt voor deze uitgave lokaal gebouwd/getest, de DMG read-only aangekoppeld en de gekopieerde app gecontroleerd. Voeg Mac-assets, vier-bestanden-SHA256SUMS.txt, deze handleiding en THIRD-PARTY-NOTICES.txt toe aan het concept. Controleer alle upload-digests en broncommit; publiceer pas daarna als definitieve release. Verplaats een gepubliceerde tag niet; gebruik een nieuwe versie voor latere fixes. Het toevoegen van Mac-CI en een volledige tag-publicatieketen blijft onderdeel van #8. Deze Windows-pipeline is geen voltooiing van alle automatiseringscriteria.

Exacte laatste uitslagen staan in de release-PR/Actions-run en releasebeschrijving. Historisch RC1-bewijs: RELEASE-RC1.md en WINDOWS-RC1-RESULTATEN.md. Fysieke Windows-RC2-controles, inclusief upgrade RC1 → RC2 en gegevensbehoud: RC2-WINDOWS.md. Die historie bewijst niet automatisch iedere toekomstige installer. Muzikale luisterbeoordeling op diverse echte muziek en interactieve SmartScreen/Gatekeeper-bediening blijven afzonderlijke grenzen.

## Licenties

Eigen projectlicentie nog onbeslist (`UNLICENSED`); deze publicatie kiest geen open-sourcelicentie. Dependencyvermeldingen staan in Resources/licenses (Mac) of resources/licenses (Windows), inclusief Electron/Chromium en Signalsmith. Geen nieuwe runtime-afhankelijkheden. De app blijft offline bruikbaar zonder account, telemetry of automatische updates.
