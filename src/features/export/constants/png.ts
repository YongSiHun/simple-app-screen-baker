export const PNG_CHUNK = {
  header: 0x49484452,
  image: 0x49444154,
  end: 0x49454e44,
};

export const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let checksum = value;

  for (let bit = 0; bit < 8; bit++) {
    checksum = checksum & 1 ? 0xedb88320 ^ (checksum >>> 1) : checksum >>> 1;
  }

  return checksum >>> 0;
});
