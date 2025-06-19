import type {Hocuspocus} from '@hocuspocus/server'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {updateYDocNodes} from './updateYDocNodes'

export const updateTitleInBacklinks = async (
  pageId: number,
  clientNumber: number,
  title: string,
  server: Hocuspocus
) => {
  const pg = getKysely()
  const backLinks = await pg
    .selectFrom('PageBacklink')
    .select('fromPageId')
    .where('toPageId', '=', pageId)
    .execute()
  await Promise.all(
    backLinks.map(async ({fromPageId}) => {
      const backlinkDocName = CipherId.toClient(fromPageId, 'page')
      const docConnection = await server.openDirectConnection(backlinkDocName, {})
      await docConnection.transact((doc) => {
        updateYDocNodes(doc, 'pageLinkBlock', {pageId: clientNumber}, {title})
      })
      await docConnection.disconnect()
    })
  )
}
