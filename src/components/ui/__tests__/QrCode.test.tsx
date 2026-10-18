import { render, screen } from '@testing-library/react';
import { encode } from 'uqr';
import { describe, expect, it } from 'vitest';
import { QrCode } from '../QrCode';

describe('QrCode', () => {
  it('draws one square per dark module, with a quiet zone', () => {
    render(<QrCode value="potinhos" label="QR code do Pix" size={150} />);
    const svg = screen.getByRole('img', { name: 'QR code do Pix' });
    const { data } = encode('potinhos', { ecc: 'M', border: 2 });
    const dark = data.flat().filter(Boolean).length;

    expect(svg).toHaveAttribute('width', '150');
    expect(svg).toHaveAttribute('viewBox', `0 0 ${data.length} ${data.length}`);
    const squares = svg.querySelector('path')?.getAttribute('d')?.match(/M/g);
    expect(squares).toHaveLength(dark);
    expect(data[0]?.every((module) => !module)).toBe(true);
  });
});
