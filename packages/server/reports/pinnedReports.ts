import {sql, type Transaction} from 'kysely'
import {parseReportSpec} from '../../client/shared/reports/parseReportSpec'
import {POPULAR_REPORT_QUESTIONS} from '../../client/shared/reports/popularReportQuestions'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import type {DB} from '../postgres/types/pg'
import {CipherId} from '../utils/CipherId'
import toReportSpecShape from './toReportSpecShape'

export const MAX_REPORT_PINS = 24
const BUILT_IN_PIN_PREFIX = 'BuiltInPinnedReport'

export interface PinnedReportSource {
  orgId: string
  // the pin's row once the org has pins of its own
  id: number | null
  // a built-in pin's popular question, which names it before and after the org's pins get rows, so a page
  // showing it stays current
  builtInKey: string | null
  title: string
  description: string | null
  spec: ReportSpec
  createdBy: string | null
}

export const toPinnedReportKey = ({orgId, id, builtInKey}: PinnedReportSource) =>
  builtInKey !== null || id === null
    ? `${BUILT_IN_PIN_PREFIX}:${orgId}:${builtInKey}`
    : CipherId.toClient(id, 'PinnedReport')

const BUILT_IN_PINS = POPULAR_REPORT_QUESTIONS.flatMap(({defaultPinSortOrder, ...question}) =>
  defaultPinSortOrder === undefined ? [] : [{...question, defaultPinSortOrder}]
).sort((a, b) => a.defaultPinSortOrder - b.defaultPinSortOrder)

// An org shows the built-in pins until someone pins, unpins or moves one; from then on it shows its own
export const selectPinnedReports = async (orgId: string): Promise<PinnedReportSource[]> => {
  const rows = await getKysely()
    .selectFrom('PinnedReport')
    .selectAll()
    .where('orgId', '=', orgId)
    .orderBy('sortOrder')
    .orderBy('id')
    .execute()
  if (rows.length === 0) {
    return BUILT_IN_PINS.map(({key, title, description, spec}) => ({
      orgId,
      id: null,
      builtInKey: key,
      title,
      description,
      spec,
      createdBy: null
    }))
  }
  return rows.flatMap(({id, builtInKey, title, description, createdBy, spec, removedAt}) => {
    const parsedSpec = parseReportSpec(spec).spec
    if (!parsedSpec || removedAt) return []
    return [{orgId, id, builtInKey, title, description, spec: parsedSpec, createdBy}]
  })
}

const copyBuiltInPins = async (trx: Transaction<DB>, orgId: string) => {
  await sql`SELECT pg_advisory_xact_lock(hashtext(${`PinnedReport:${orgId}`}))`.execute(trx)
  const existing = await trx
    .selectFrom('PinnedReport')
    .select('id')
    .where('orgId', '=', orgId)
    .limit(1)
    .executeTakeFirst()
  if (existing) return
  if (BUILT_IN_PINS.length === 0) return
  await trx
    .insertInto('PinnedReport')
    .values(
      BUILT_IN_PINS.map(({key, title, description, spec}, idx) => ({
        orgId,
        builtInKey: key,
        source: 'popular' as const,
        title,
        description,
        spec: JSON.stringify(spec),
        shape: toReportSpecShape(spec),
        sortOrder: idx + 1
      }))
    )
    .execute()
}

export const selectActivePinnedReports = async (trx: Transaction<DB>, orgId: string) => {
  await copyBuiltInPins(trx, orgId)
  return trx
    .selectFrom('PinnedReport')
    .select(['id', 'spec', 'sortOrder', 'builtInKey'])
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .orderBy('sortOrder')
    .orderBy('id')
    .execute()
}

// The row a pin key names, copying the built-in pins first when the key is a built-in one
export const findPinnedReportId = async (trx: Transaction<DB>, orgId: string, pinId: string) => {
  const pins = await selectActivePinnedReports(trx, orgId)
  const [prefix, pinOrgId, builtInKey] = pinId.split(':')
  if (prefix === BUILT_IN_PIN_PREFIX) {
    if (pinOrgId !== orgId) return null
    return pins.find((pin) => pin.builtInKey === builtInKey)?.id ?? null
  }
  const pinnedReportId = fromReportKey(pinId)
  return pins.find((pin) => pin.id === pinnedReportId)?.id ?? null
}

export const fromReportKey = (key: string) => {
  const [id] = CipherId.fromClient(key)
  return Number.isInteger(id) ? id : null
}
