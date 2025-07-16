import type {Document} from '@hocuspocus/server'
import {server} from '../../hocusPocus'
import {CipherId} from '../CipherId'

export const withDoc = async (
  parentPageId: number,
  fn: (doc: Document) => void | Promise<void>
) => {
  const name = CipherId.toClient(parentPageId, 'page')
  const conn = await server.openDirectConnection(name, {})
  await conn.transact(fn)
  await conn.disconnect()
}
