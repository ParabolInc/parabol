import {feistelCipher} from './feistelCipher'

// This ID is kept on the server since the feistel cypher uses a server secret
export const CipherId = {
  toClient: (dbId: number, entity: string) => `${entity}:${feistelCipher.encrypt(dbId)}`,
  fromClient: (clientId: string) => {
    const [entity, id] = clientId.split(':')
    const clientNum = Number(id)
    return [feistelCipher.decrypt(clientNum), clientNum, entity] as [number, number, string]
  },
  encrypt: feistelCipher.encrypt,
  decrypt: feistelCipher.decrypt
}
