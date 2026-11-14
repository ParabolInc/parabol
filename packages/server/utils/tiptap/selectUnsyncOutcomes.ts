import type {Kysely} from 'kysely'
import type {DB} from '../../postgres/types/pg'

type UnsyncOutcome = {hiddenReaderCount: number; isPublicWithoutBlock: boolean}

export const selectUnsyncOutcomes = async (db: Kysely<DB>, blockId: number, hostIds: number[]) => {
  const outcomes = new Map<number, UnsyncOutcome>()
  if (hostIds.length === 0) return outcomes
  const [hiddenReaderCounts, externalRows] = await Promise.all([
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
      .select(['pageId', 'email'])
      .where('pageId', 'in', [blockId, ...hostIds])
      .execute()
  ])
  const blockEmails = new Set(
    externalRows.filter(({pageId}) => pageId === blockId).map(({email}) => email)
  )
  if (blockEmails.has('*')) {
    hostIds.forEach((hostId) => {
      outcomes.set(hostId, {hiddenReaderCount: 0, isPublicWithoutBlock: false})
    })
    return outcomes
  }
  hostIds.forEach((hostId) => {
    const hostEmails = externalRows.filter(({pageId}) => pageId === hostId).map(({email}) => email)
    const hiddenInviteCount = hostEmails.filter(
      (email) => email !== '*' && !blockEmails.has(email)
    ).length
    const row = hiddenReaderCounts.find(({pageId}) => pageId === hostId)
    outcomes.set(hostId, {
      hiddenReaderCount: Number(row?.hiddenReaderCount ?? 0) + hiddenInviteCount,
      isPublicWithoutBlock: hostEmails.includes('*')
    })
  })
  return outcomes
}
