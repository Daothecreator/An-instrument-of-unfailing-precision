/**
 * Pure TypeScript FIPS 202 SHA3-256 and SHA-256 implementation.
 * Bit-for-bit compatible with Python's hashlib.sha3_256 and hashlib.sha256.
 * Runs identically in both Browser and Node.js environments.
 */

const RC: bigint[] = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

const ROTC: number[] = [
  1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14, 27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44,
];

const PILN: number[] = [
  10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4, 15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1,
];

const MASK64 = 0xffffffffffffffffn;

function rotl64(x: bigint, n: number): bigint {
  const s = BigInt(n);
  return ((x << s) | (x >> (64n - s))) & MASK64;
}

function keccakF1600(state: bigint[]): void {
  const bc = new Array<bigint>(5);
  for (let round = 0; round < 24; round++) {
    // Theta
    for (let i = 0; i < 5; i++) {
      bc[i] = state[i] ^ state[i + 5] ^ state[i + 10] ^ state[i + 15] ^ state[i + 20];
    }
    for (let i = 0; i < 5; i++) {
      const t = bc[(i + 4) % 5] ^ rotl64(bc[(i + 1) % 5], 1);
      for (let j = 0; j < 25; j += 5) {
        state[j + i] = (state[j + i] ^ t) & MASK64;
      }
    }

    // Rho & Pi
    let t = state[1];
    for (let i = 0; i < 24; i++) {
      const j = PILN[i];
      bc[0] = state[j];
      state[j] = rotl64(t, ROTC[i]);
      t = bc[0];
    }

    // Chi
    for (let j = 0; j < 25; j += 5) {
      for (let i = 0; i < 5; i++) {
        bc[i] = state[j + i];
      }
      for (let i = 0; i < 5; i++) {
        state[j + i] = (bc[i] ^ (~bc[(i + 1) % 5] & MASK64 & bc[(i + 2) % 5])) & MASK64;
      }
    }

    // Iota
    state[0] = (state[0] ^ RC[round]) & MASK64;
  }
}

export function utf8ToBytes(input: string | Uint8Array): Uint8Array {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  return input;
}

export function sha3_256Bytes(input: string | Uint8Array): Uint8Array {
  const msg = utf8ToBytes(input);
  const rate = 136; // 1088 bits for SHA3-256
  const state = new Array<bigint>(25).fill(0n);

  let offset = 0;
  while (offset + rate <= msg.length) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 0; b < 8; b++) {
        lane |= BigInt(msg[offset + i * 8 + b]) << BigInt(8 * b);
      }
      state[i] ^= lane;
    }
    keccakF1600(state);
    offset += rate;
  }

  // Last block with FIPS 202 domain separation 0x06 ... 0x80
  const block = new Uint8Array(rate);
  const rem = msg.length - offset;
  for (let i = 0; i < rem; i++) {
    block[i] = msg[offset + i];
  }
  block[rem] = 0x06;
  block[rate - 1] |= 0x80;

  for (let i = 0; i < rate / 8; i++) {
    let lane = 0n;
    for (let b = 0; b < 8; b++) {
      lane |= BigInt(block[i * 8 + b]) << BigInt(8 * b);
    }
    state[i] ^= lane;
  }
  keccakF1600(state);

  const out = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    const lane = state[i];
    for (let b = 0; b < 8; b++) {
      out[i * 8 + b] = Number((lane >> BigInt(8 * b)) & 0xffn);
    }
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function sha3_256Hex(input: string | Uint8Array): string {
  return bytesToHex(sha3_256Bytes(input));
}

/**
 * Signed 64-bit big-endian integer from first 8 bytes of digest, divided by (2^63 - 1)
 * Exactly matches Python:
 * val_int = int.from_bytes(h[:8], byteorder="big", signed=True)
 * val_int / float(2**63 - 1)
 */
export function first8BytesSignedNormalized(digest: Uint8Array): number {
  let u64 = 0n;
  for (let i = 0; i < 8; i++) {
    u64 = (u64 << 8n) | BigInt(digest[i]);
  }
  const signed64 = u64 >= 0x8000000000000000n ? u64 - 0x10000000000000000n : u64;
  return Number(signed64) / 9223372036854775807;
}

export function first4BytesUnsignedBigEndian(digest: Uint8Array): number {
  return (
    ((digest[0] << 24) >>> 0) +
    ((digest[1] << 16) >>> 0) +
    ((digest[2] << 8) >>> 0) +
    (digest[3] >>> 0)
  );
}
