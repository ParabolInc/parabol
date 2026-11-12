import {feistelCipher} from './feistelCipher'

const MAX_DB_ID = 0x7fffffff
const MISSING_ID = -1

// A code that can't decrypt to a Postgres integer can't belong to a row, so it maps to an id no row has
const decrypt = (code: number) => {
  if (!Number.isInteger(code) || code < 0 || code > 0xffffffff) return MISSING_ID
  const id = feistelCipher.decrypt(code)
  return id > MAX_DB_ID ? MISSING_ID : id
}

// This ID is kept on the server since the feistel cypher uses a server secret
export const CipherId = {
  toClient: (id: number, entity: string) => `${entity}:${feistelCipher.encrypt(id)}`,
  fromClient: (key: string) => {
    const [entity, id] = key.split(':')
    const code = Number(id)
    return [decrypt(code), code, entity] as [id: number, code: number, entity: string]
  },
  encrypt: feistelCipher.encrypt,
  decrypt
}
