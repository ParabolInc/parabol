import {sql, type Transaction} from 'kysely'
import {parseReportSpec} from '../../client/shared/reports/parseReportSpec'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import type {DB} from '../postgres/types/pg'
import {CipherId} from '../utils/CipherId'
import selectPopularReportQuestions, {
  type PopularReportQuestionRow
} from './selectPopularReportQuestions'
import toReportSpecShape from './toReportSpecShape'

export const MAX_REPORT_PINS = 24
const BUILT_IN_PIN_PREFIX = 'BuiltInReportPin'

export interface ReportPinSource {
  orgId: string
  // the pin's row once the org has pins of its own; until then the built-in ones are named by key
  rowId: number | null
  key: string | null
  title: string
  description: string | null
  spec: ReportSpec
  createdBy: string | null
  isBuiltIn: boolean
}

export const toReportPinId = ({orgId, rowId, key}: ReportPinSource) =>
  rowId === null ? `${BUILT_IN_PIN_PREFIX}:${orgId}:${key}` : CipherId.toClient(rowId, 'ReportPin')

const toBuiltInPins = (popularQuestions: PopularReportQuestionRow[]) =>
  popularQuestions
    .flatMap(({defaultPinSortOrder, ...question}) =>
      defaultPinSortOrder === null ? [] : [{...question, defaultPinSortOrder}]
    )
    .sort((a, b) => a.defaultPinSortOrder - b.defaultPinSortOrder)

// An org shows the built-in pins until someone pins, unpins or moves one; from then on it shows its own
export const selectReportPins = async (orgId: string): Promise<ReportPinSource[]> => {
  const rows = await getKysely()
    .selectFrom('ReportPin')
    .selectAll()
    .where('orgId', '=', orgId)
    .orderBy('sortOrder')
    .orderBy('id')
    .execute()
  if (rows.length === 0) {
    const builtIns = toBuiltInPins(await selectPopularReportQuestions())
    return builtIns.map(({key, title, description, spec}) => ({
      orgId,
      rowId: null,
      key,
      title,
      description,
      spec,
      createdBy: null,
      isBuiltIn: true
    }))
  }
  return rows.flatMap((row) => {
    const spec = parseReportSpec(row.spec)
    if (!spec || row.removedAt) return []
    const {id, title, description, createdBy, isBuiltIn} = row
    return [{orgId, rowId: id, key: null, title, description, spec, createdBy, isBuiltIn}]
  })
}

const copyBuiltInPins = async (trx: Transaction<DB>, orgId: string) => {
  await sql`SELECT pg_advisory_xact_lock(hashtext(${`ReportPin:${orgId}`}))`.execute(trx)
  const existing = await trx
    .selectFrom('ReportPin')
    .select('id')
    .where('orgId', '=', orgId)
    .limit(1)
    .executeTakeFirst()
  if (existing) return
  const builtIns = toBuiltInPins(await selectPopularReportQuestions())
  if (builtIns.length === 0) return
  await trx
    .insertInto('ReportPin')
    .values(
      builtIns.map(({id, title, description, spec}, idx) => ({
        orgId,
        isBuiltIn: true,
        source: 'popular' as const,
        popularQuestionId: id,
        title,
        description,
        spec: JSON.stringify(spec),
        shape: toReportSpecShape(spec),
        sortOrder: idx + 1
      }))
    )
    .execute()
}

export const selectActiveReportPins = async (trx: Transaction<DB>, orgId: string) => {
  await copyBuiltInPins(trx, orgId)
  return trx
    .selectFrom('ReportPin')
    .select(['id', 'spec', 'sortOrder', 'isBuiltIn', 'popularQuestionId'])
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .orderBy('sortOrder')
    .orderBy('id')
    .execute()
}

// The row a pin id names, copying the built-in pins first when the id is a built-in one
export const findReportPinRowId = async (trx: Transaction<DB>, orgId: string, pinId: string) => {
  const pins = await selectActiveReportPins(trx, orgId)
  const [prefix, pinOrgId, key] = pinId.split(':')
  if (prefix === BUILT_IN_PIN_PREFIX) {
    if (pinOrgId !== orgId) return null
    const popular = (await selectPopularReportQuestions()).find((question) => question.key === key)
    return pins.find((pin) => pin.isBuiltIn && pin.popularQuestionId === popular?.id)?.id ?? null
  }
  const rowId = toReportRowId(pinId)
  return pins.find((pin) => pin.id === rowId)?.id ?? null
}

export const toReportRowId = (clientId: string) => {
  const [rowId] = CipherId.fromClient(clientId)
  return Number.isInteger(rowId) ? rowId : null
}
