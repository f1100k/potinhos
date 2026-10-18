// Static Pix "BR Code", as in the Banco Central manual: EMV fields written as
// id + two-digit length + value, closed by a CRC16-CCITT of the whole text.

type PixRecipient = {
  key: string;
  name: string;
  city: string;
};

function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(text: string): string {
  let crc = 0xffff;
  for (const char of text) {
    crc ^= (char.codePointAt(0) ?? 0) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function pixCode({ key, name, city }: PixRecipient): string {
  const payload = [
    field('00', '01'),
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)),
    field('52', '0000'),
    field('53', '986'),
    field('58', 'BR'),
    field('59', name),
    field('60', city),
    field('62', field('05', '***')),
    '6304',
  ].join('');
  return payload + crc16(payload);
}
