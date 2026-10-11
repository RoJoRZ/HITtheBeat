"""Generate CC0 synthetic AAC/ALAC test fixtures using macOS afconvert."""
import math
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

output = Path(__file__).resolve().parent.parent / 'tests' / 'fixtures'
output.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as root:
    source = Path(root) / 'pulse.wav'
    with wave.open(str(source), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(44100)
        audio.writeframes(b''.join(struct.pack('<h', int(16000 * math.sin(2 * math.pi * 440 * i / 44100) * math.exp(-((i / 44100) % .5) * 24))) for i in range(44100 * 6)))
    for codec in ['aac', 'alac']:
        subprocess.run(['afconvert', '-f', 'm4af', '-d', codec, *(['-b', '128000'] if codec == 'aac' else []), str(source), str(output / f'pulse-{codec}.m4a')], check=True)
