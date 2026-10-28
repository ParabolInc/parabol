import getKysely from '../../postgres/getKysely'
import {selectDescendantPages} from '../../postgres/select'
import getRedis from '../getRedis'

export const YJS_REVALIDATE_CHANNEL = 'yjsRevalidateConnections'

export type YjsRevalidation = {pageIds: number[]; userIds: string[]}

// Open Yjs connections keep the access they authenticated with, so tell every server to re-check them
export const revalidateYjsConnections = async ({
  pageTreeIds = [],
  userIds = []
}: {
  pageTreeIds?: number[]
  userIds?: string[]
}) => {
  const descendants = await Promise.all(
    pageTreeIds.map((pageId) =>
      selectDescendantPages(getKysely(), pageId).selectFrom('descendants').select('id').execute()
    )
  )
  const pageIds = descendants.flat().map(({id}) => id)
  if (pageIds.length === 0 && userIds.length === 0) return
  const revalidation: YjsRevalidation = {pageIds, userIds}
  await getRedis().publish(YJS_REVALIDATE_CHANNEL, JSON.stringify(revalidation))
}
