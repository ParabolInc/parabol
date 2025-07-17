import {feistelCipher} from './feistelCipher'

// This ID is kept on the server since the feistel cypher uses a server secret
export const CipherId = {
  toClient: (id: number, entity: string) => `${entity}:${feistelCipher.encrypt(id)}`,
  fromClient: (key: string) => {
    const [entity, id] = key.split(':')
    const code = Number(id)
    return [feistelCipher.decrypt(code), code, entity] as [id: number, code: number, entity: string]
  },
  encrypt: feistelCipher.encrypt,
  decrypt: feistelCipher.decrypt
}
