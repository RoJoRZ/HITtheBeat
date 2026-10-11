# Audiofixtures

Deze zes seconden durende puls op 440 Hz is synthetisch gegenereerd voor HITtheBeat; geen muziek of opnamen van derden. Gebruik is vrij onder CC0-1.0.

`pulse-aac.m4a`: AAC, 128 kb/s, mono, 44,1 kHz. `pulse-alac.m4a`: Apple Lossless, mono, 44,1 kHz (voor de melding bij niet-ondersteunde varianten).

Reproduceren op macOS, vanuit de repository:

```sh
python3 scripts/generate-audio-fixtures.py
```

Tests lezen de meegeleverde bestanden en vereisen geen afconvert of netwerkverbinding, ook niet op Windows.
