import {redisHocusPocus} from '../../../../../hocusPocus'
import getKysely from '../../../../../postgres/getKysely'
import {CipherId} from '../../../../../utils/CipherId'
import {mapInBatches} from '../../../../../utils/mapInBatches'
import {getEmptyPageDocState} from '../../../../../utils/tiptap/getEmptyPageDocState'

const OPEN_DOC_LOOKUPS_PER_BATCH = 20

const readOpenPageState = async (pageId: number) => {
  const state = await redisHocusPocus.handleEvent(
    'readPageState',
    CipherId.toClient(pageId, 'page'),
    {},
    true
  )
  return state ? new Uint8Array(Buffer.from(state, 'base64')) : null
}

const readSavedPageStates = async (pageIds: number[]) => {
  if (pageIds.length === 0) return new Map<number, Uint8Array>()
  const rows = await getKysely()
    .selectFrom('Page')
    .select(['id', 'yDoc'])
    .where('id', 'in', pageIds)
    .execute()
  const savedStates = new Map(rows.map(({id, yDoc}) => [id, yDoc]))
  return new Map(
    pageIds.map((pageId) => [
      pageId,
      new Uint8Array(savedStates.get(pageId) ?? getEmptyPageDocState())
    ])
  )
}

export const readPageStates = async (pageIds: number[]) => {
  const openStates = await mapInBatches(pageIds, OPEN_DOC_LOOKUPS_PER_BATCH, readOpenPageState)
  const closedIds = pageIds.filter((_pageId, idx) => !openStates[idx])
  const savedStates = await readSavedPageStates(closedIds)
  return new Map(
    pageIds.map((pageId, idx) => [pageId, openStates[idx] ?? savedStates.get(pageId)!])
  )
}
