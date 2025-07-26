import type {Document} from '@hocuspocus/server'
import {server} from '../../hocusPocus'
import {CipherId} from '../CipherId'

export const withDoc = async (pageId: number, fn: (doc: Document) => void | Promise<void>) => {
  const name = CipherId.toClient(pageId, 'page')
  const conn = await server.hocuspocus.openDirectConnection(name, {})
  await conn.transact(fn)
  await conn.disconnect()
}
