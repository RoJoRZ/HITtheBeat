# Opslag

De implementatie staat in `electron/library.mjs`: SQLite en beheerde media in het hoofdproces, bereikbaar via de beperkte preload-API. Schema 9 ondersteunt audio- en metronoom-oefeningen, opgeslagen sessie-opbouwen en historische momentopnamen. De renderer krijgt geen directe bestandstoegang. Deze map bevat geen tweede opslagimplementatie. Zie `TECHNISCH-ONTWERP.md`.
