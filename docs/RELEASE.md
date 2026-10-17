# Eerste release — 1.0.0-rc.1

De gebruiker heeft v0.0.26 geaccepteerd en expliciet een eerste release gevraagd. Deze uitgave is een GitHub-pre-release omdat Windows-gebruikstest en muzikale platformbeoordeling nog openstaan. Publicatie is handmatig; #8 (releaseautomatisering) blijft gedeeltelijk en open. Geen PR's automatisch mergen.

## Downloads en installatie

[Release v1.0.0-rc.1](https://github.com/RoJoRZ/HITtheBeat/releases/tag/v1.0.0-rc.1)

| Bestand | Gebruik |
| --- | --- |
| HITtheBeat-1.0.0-rc.1-mac-arm64.dmg | Mac Apple Silicon; open de schijfkopie, sleep HITtheBeat naar Programma's en koppel de schijfkopie los. |
| HITtheBeat-1.0.0-rc.1-mac-arm64.zip | Alternatief voor Apple Silicon; volledig uitpakken, verplaats HITtheBeat.app naar Programma's. |
| HITtheBeat-1.0.0-rc.1-win-x64.zip | Windows x64; volledige map uitpakken, daarna HITtheBeat.exe starten. Geen installer in deze RC. |
| SHA256SUMS.txt | SHA-256-controlegetallen van de drie binaries. |

Geen Intel Mac-/Windows ARM-build of gebruikstest. De Mac-app is arm64 en vereist geen Rosetta. Ze is ad-hoc ondertekend, niet met Developer ID ondertekend of genotariseerd. Windows is niet ondertekend. Het OS kan de download blokkeren/waarschuwen; beveiliging niet algemeen uitschakelen. Controleer herkomst/controlegetal en noteer blokkades voor de platformtest. Er is geen automatische updater.

Mac-controle: `shasum -a 256 <bestand>`; PowerShell: `Get-FileHash <bestand> -Algorithm SHA256`. Vergelijk met de regel voor precies dezelfde bestandsnaam in SHA256SUMS.txt. Deze hashes controleren de bytes, geen uitgeversidentiteit.

De bibliotheek staat apart van de app: Mac `~/Library/Application Support/HITtheBeat/library`, Windows `%APPDATA%\HITtheBeat\library`. De Windows-ZIP is geen opslag-op-USB-modus. Sluit een bestaande app vóór vervanging en bewaar een reservekopie van de eigen appdatamap. Een oudere versie openen na nieuwere data is geen ondersteunde rollback; herstel een vooraf gemaakte kopie indien nodig. Downloads bevatten geen persoonlijke media of database.

## Inhoud

Eigen audio-oefeningen (MP3/AAC-M4A), opdracht/tablatuur, BPM-detectie/correctie, onafhankelijk tempo/toonhoogte, volume/normalisatie, benoemde fragmenten, waveform en looptraining, sessietabel en doorlopende sessies, metronoom/aftellen per oefening, toetsenbordbeoordelingen, voortgang, los tablatuurvenster, oefening delen met informele makerherkenning, Nederlands/Engels en Info. Zie FUNCTIONEEL.md voor de exacte afspraken/open keuzes.

## Reproduceren

Node 24, pnpm 11.25.0, lockbestand gebruiken. Geen secrets of signing-account nodig voor deze niet-genotariseerde testbuild.

```sh
pnpm install --frozen-lockfile
pnpm setup:desktop
pnpm build
pnpm test
pnpm package:mac
# ZIP kan op de Mac worden gebouwd; NSIS later op Windows:
pnpm exec electron-builder --win zip --x64 --publish never
node scripts/release-checksums.mjs
```

`pnpm package:win` vraagt NSIS + ZIP; voer dit op Windows uit voor de installercontrole. Op deze arm64-Mac faalt het gedownloade Intel-makensis met fout -86 zonder Rosetta. Er is geen Rosetta geïnstalleerd en geen geslaagde EXE geclaimd. NSIS-configuratie is voorbereid, nog niet gevalideerd.

Kopieer docs/WINDOWS-TEST.md en public/licenses/THIRD-PARTY-NOTICES.txt als tekstassets bij de release. Publiceer alleen de drie genoemde binaries, SHA256SUMS.txt en de documentassets; geen .blockmap, NSIS-tussenarchief, debugbestanden of appdata. De tag `v1.0.0-rc.1` verwijst naar `codex/issue-8-first-release`, met de geaccepteerde Info-commit als basis. Publiceer als Pre-release; verplaats een gepubliceerde tag niet bij een latere fix.

## Licenties

De eigen projectlicentie is nog niet gekozen (`UNLICENSED`); deze stap verleent geen algemene open-sourcelicentie. Dependencyvermeldingen staan mee in Resources/licenses (Mac) of resources/licenses (Windows), waaronder THIRD-PARTY-NOTICES.txt en Signalsmith. Electron/Chromium-licentieteksten horen bij het runtimepakket. Voor verdere publieke herdistributie blijft de eigen licentiekeuze een expliciete open afspraak.

## Controle en vervolg

- Typecheck/productiebouw en 103 Node-tests geslaagd.
- Mac arm64 DMG en ZIP gebouwd; DMG-checksumstructuur geverifieerd, read-only aangekoppeld en app gekopieerd naar geïsoleerde testmap.
- 12 verpakte-appcontroles geslaagd (shell, import/herstart, Info, taal, tablatuur, sessies en delen), uitsluitend met geïsoleerde testgegevens. ASAR-inspectie vond geen SQLite-/env-/bibliotheek-/bijlagepaden. Runtime- en dependencyvermeldingen worden expliciet meegeleverd.
- Windows x64 ZIP gebouwd; Windows-opstarten/audio/import/opslag/installer nog niet uitgevoerd.
- PR-/tag-CI, geteste Windows-installer, Windows-gebruikstest, muzikale luisterbeoordeling en projectlicentiekeuze blijven open. Geen voltooiing van #8 claimen.

Vervolg op de door gebruiker beschikbaar te stellen Windows-machine: docs/WINDOWS-TEST.md. Daarna bevindingen herstellen in een nieuwe versie en pas bij acceptatie een definitieve 1.0 uitgeven.
