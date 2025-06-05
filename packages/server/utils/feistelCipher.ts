// Using a cypher here so the serial ID in the database is (somewhat) obfuscated from the client
// So users can't figure
class FeistelCipher {
  private readonly key: number
  private readonly rounds: number

  constructor(key: number, rounds: number = 4) {
    this.key = key >>> 0 // Ensure the key is treated as unsigned 32-bit
    this.rounds = rounds
  }

  private feistelFunction(value: number): number {
    return ((value * this.key) ^ (value >>> 3)) >>> 0 // Ensure 32-bit unsigned
  }

  encrypt(input: number): number {
    if (input < 0 || input > 0xffffffff) {
      throw new Error('Input must be a valid uint32 (0 to 4294967295)')
    }

    let l = input & 0xffff // Lower 16 bits
    let r = (input >>> 16) & 0xffff // Upper 16 bits

    for (let i = 0; i < this.rounds; i++) {
      const temp = r
      r = (l ^ this.feistelFunction(r)) & 0xffff
      l = temp
    }

    // Ensure output is a valid uint32
    return ((r << 16) | l) >>> 0
  }

  decrypt(input: number): number {
    if (input < 0 || input > 0xffffffff) {
      throw new Error('Input must be a valid uint32 (0 to 4294967295)')
    }

    let l = input & 0xffff
    let r = (input >>> 16) & 0xffff

    for (let i = 0; i < this.rounds; i++) {
      const temp = l
      l = (r ^ this.feistelFunction(l)) & 0xffff
      r = temp
    }

    return ((r << 16) | l) >>> 0
  }
}

function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5 // FNV offset basis (32-bit)
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0 // FNV prime (force 32-bit unsigned)
  }
  return hash
}

const secret = process.env.SERVER_SECRET!
const key = fnv1aHash(secret.slice(0, 10))

export const feistelCipher = new FeistelCipher(key)
