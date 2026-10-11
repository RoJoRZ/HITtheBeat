/** Recognize supported audio before copying it into managed storage.
 * M4A is a container; this version accepts unencrypted AAC tracks.
 * @param {string} name @param {Uint8Array} bytes
 */
export function audioFormat(name, bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 12 || bytes.length > 50 * 1024 * 1024) throw new Error('Kies een MP3 of M4A van maximaal 50 MB.');
  const extension = name.toLowerCase().match(/\.(mp3|m4a)$/)?.[1];
  const text = (/** @type {number} */ offset, length = 4) => String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (extension === 'mp3') {
    if (!(text(0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224))) throw new Error('Dit bestand is geen herkenbare MP3.');
    return { extension: 'mp3', mime: 'audio/mpeg' };
  }
  if (extension !== 'm4a') throw new Error('Kies een MP3 of M4A van maximaal 50 MB.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const invalid = () => { throw new Error('Deze M4A is beschadigd of geen herkenbaar audiobestand.'); };
  let count = 0, audio = false, video = false, aac = false, lossless = false, protectedAudio = false, mediaData = false;
  /** @param {number} start @param {number} end @param {number} depth */
  function scan(start, end, depth) {
    for (let offset = start; offset < end;) {
      if (++count > 10000 || offset + 8 > end) return invalid();
      let size = view.getUint32(offset), header = 8;
      const type = text(offset + 4);
      if (size === 1) {
        if (offset + 16 > end) return invalid();
        const large = view.getBigUint64(offset + 8);
        if (large > BigInt(bytes.length)) return invalid();
        size = Number(large); header = 16;
      } else if (size === 0) size = end - offset;
      if (size < header || offset + size > end) return invalid();
      const body = offset + header, limit = offset + size;
      if (depth === 0 && offset === 0 && (type !== 'ftyp' || size < header + 8)) return invalid();
      if (depth === 0 && type === 'mdat' && limit > body) mediaData = true;
      if (['moov','trak','mdia','minf','stbl'].includes(type)) {
        if (depth > 5) return invalid();
        scan(body, limit, depth + 1);
      } else if (type === 'hdlr') {
        if (body + 12 > limit) return invalid();
        const handler = text(body + 8); audio ||= handler === 'soun'; video ||= handler === 'vide';
      } else if (type === 'stsd') {
        if (body + 8 > limit) return invalid();
        const entries = view.getUint32(body + 4);
        let entry = body + 8;
        for (let i = 0; i < entries; i++) {
          if (entry + 8 > limit || i > 100) return invalid();
          const length = view.getUint32(entry), codec = text(entry + 4);
          if (length < 8 || entry + length > limit) return invalid();
          aac ||= codec === 'mp4a'; lossless ||= codec === 'alac'; protectedAudio ||= ['enca','drms'].includes(codec);
          entry += length;
        }
      }
      offset = limit;
    }
  }
  scan(0, bytes.length, 0);
  if (protectedAudio) throw new Error('Deze M4A is beveiligd en kan niet worden geïmporteerd. Kies een onbeveiligde MP3 of M4A met AAC.');
  if (lossless) throw new Error('Deze M4A bevat Apple Lossless (ALAC). Kies een MP3 of exporteer de track als M4A met AAC.');
  if (!audio || video || !aac || !mediaData) throw new Error('Kies een M4A-audiobestand met AAC. Deze variant wordt niet ondersteund.');
  return { extension: 'm4a', mime: 'audio/mp4' };
}
