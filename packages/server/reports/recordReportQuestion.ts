import {sql} from 'kysely'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import getHashAndJSON from '../utils/getHashAndJSON'
import toReportSpecShape from './toReportSpecShape'

interface Options {
  userId: string
  orgId: string
  source: 'ask' | 'popular' | 'builder'
  question: string | null
  title: string
  aiSpec?: unknown
  spec: ReportSpec | null
}

// One row per person, org and report: asking for the same report again moves it to the top of their recent questions
const recordReportQuestion = async ({
  userId,
  orgId,
  source,
  question,
  title,
  aiSpec = null,
  spec
}: Options) => {
  const {id: dedupeKey} = getHashAndJSON(
    spec ?? {source, question: question?.trim().toLowerCase() ?? null}
  )
  return getKysely()
    .insertInto('ReportQuestion')
    .values({
      userId,
      orgId,
      source,
      question,
      title,
      aiSpec: aiSpec === null ? null : JSON.stringify(aiSpec),
      spec: spec && JSON.stringify(spec),
      outcome: spec ? 'shown' : 'couldNotBuild',
      shape: spec && toReportSpecShape(spec),
      dedupeKey
    })
    .onConflict((oc) =>
      oc.columns(['userId', 'orgId', 'dedupeKey']).doUpdateSet((eb) => ({
        source: eb.ref('excluded.source'),
        question: eb.ref('excluded.question'),
        title: eb.ref('excluded.title'),
        aiSpec: eb.ref('excluded.aiSpec'),
        outcome: eb.ref('excluded.outcome'),
        uses: sql<number>`"ReportQuestion".uses + 1`,
        lastUsedAt: sql<Date>`CURRENT_TIMESTAMP`
      }))
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

export default recordReportQuestion
