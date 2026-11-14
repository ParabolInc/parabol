import type {Kysely} from 'kysely'
import type {DB} from '../../postgres/types/pg'

type UnsyncOutcome = {hiddenReaderCount: number; isPublicWithoutBlock: boolean}

export const selectUnsyncOutcomes = async (db: Kysely<DB>, blockId: number, hostIds: number[]) => {
  const outcomes = new Map<number, UnsyncOutcome>()
  if (hostIds.length === 0) return outcomes
  const [hiddenReaderCounts, publicRows] = await Promise.all([
    db
      .selectFrom('PageAccess as hostAccess')
      .leftJoin('PageAccess as blockAccess', (join) =>
        join
          .onRef('blockAccess.userId', '=', 'hostAccess.userId')
          .on('blockAccess.pageId', '=', blockId)
      )
      .select(({fn}) => ['hostAccess.pageId', fn.countAll<string>().as('hiddenReaderCount')])
      .where('hostAccess.pageId', 'in', hostIds)
      .where('blockAccess.userId', 'is', null)
      .groupBy('hostAccess.pageId')
      .execute(),
    db
      .selectFrom('PageExternalAccess')
      .select('pageId')
      .where('pageId', 'in', [blockId, ...hostIds])
      .where('email', '=', '*')
      .execute()
  ])
  const publicPageIds = new Set(publicRows.map(({pageId}) => pageId))
  const isBlockPublic = publicPageIds.has(blockId)
  hostIds.forEach((hostId) => {
    if (isBlockPublic) {
      outcomes.set(hostId, {hiddenReaderCount: 0, isPublicWithoutBlock: false})
      return
    }
    const row = hiddenReaderCounts.find(({pageId}) => pageId === hostId)
    outcomes.set(hostId, {
      hiddenReaderCount: Number(row?.hiddenReaderCount ?? 0),
      isPublicWithoutBlock: publicPageIds.has(hostId)
    })
  })
  return outcomes
}
