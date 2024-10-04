import {Kysely, PostgresDialect, sql} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  try {
    console.log('Adding index')
    await r
      .table('NewMeeting')
      .indexCreate('updatedAtId', (row: any) => [row('updatedAt'), row('id')])
      .run()
    await r.table('NewMeeting').indexWait().run()
  } catch {
    // index already exists
  }

  console.log('Adding index complete')

  await sql`ALTER TABLE "NewMeeting" DISABLE TRIGGER "check_meeting_overlap"`.execute(pg)
  const MAX_PG_PARAMS = 65545
  const PG_COLS = [
    'id',
    'isLegacy',
    'createdAt',
    'updatedAt',
    'createdBy',
    'endedAt',
    'facilitatorStageId',
    'facilitatorUserId',
    'meetingCount',
    'meetingNumber',
    'name',
    'summarySentAt',
    'teamId',
    'meetingType',
    'phases',
    'showConversionModal',
    'meetingSeriesId',
    'scheduledEndTime',
    'summary',
    'sentimentScore',
    'usedReactjis',
    'slackTs',
    'engagement',
    'totalVotes',
    'maxVotesPerGroup',
    'disableAnonymity',
    'commentCount',
    'taskCount',
    'agendaItemCount',
    'storyCount',
    'templateId',
    'topicCount',
    'reflectionCount',
    'transcription',
    'recallBotId',
    'videoMeetingURL',
    'autogroupReflectionGroups',
    'resetReflectionGroups',
    'templateRefId',
    'meetingPrompt'
  ] as const
  type NewMeeting = {
    [K in (typeof PG_COLS)[number]]: any
  }
  const BATCH_SIZE = Math.trunc(MAX_PG_PARAMS / PG_COLS.length)

  let curUpdatedAt = r.minval
  let curId = r.minval

  const insertRow = async (row) => {
    if (!row.facilitatorStageId) {
      console.log('Meeting has no facilitatorId, skipping insert', row.id, row.teamId)
      return
    }
    try {
      await pg
        .insertInto('NewMeeting')
        .values(row)
        .onConflict((oc) => oc.doNothing())
        .execute()
    } catch (e) {
      if (e.constraint === 'fk_createdBy') {
        return insertRow({...row, createdBy: null})
      }
      if (e.constraint === 'fk_facilitatorUserId') {
        return insertRow({...row, facilitatorUserId: null})
      }
      if (e.constraint === 'fk_teamId') {
        console.log('Meeting has no team, skipping insert', row.id)
        return
      }
      if (e.constraint === 'fk_meetingSeriesId') {
        return insertRow({...row, meetingSeriesId: null})
      }
      if (e.constraint === 'fk_templateId') {
        console.log('Meeting has no template, skipping insert', row.id)
        return
      }
      throw e
    }
  }
  for (let i = 0; i < 1e6; i++) {
    console.log('inserting row', i * BATCH_SIZE, String(curUpdatedAt), String(curId))
    const rawRowsToInsert = (await r
      .table('NewMeeting')
      .between([curUpdatedAt, curId], [r.maxval, r.maxval], {
        index: 'updatedAtId',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .orderBy({index: 'updatedAtId'})
      .limit(BATCH_SIZE)
      .pluck(...PG_COLS)
      .run()) as NewMeeting[]

    const rowsToInsert = rawRowsToInsert.map((row) => {
      const {
        phases,
        name,
        summary,
        usedReactjis,
        slackTs,
        transcription,
        autogroupReflectionGroups,
        resetReflectionGroups,
        meetingPrompt,
        meetingCount,
        ...rest
      } = row as any
      return {
        ...rest,
        phases: JSON.stringify(phases),
        name: name.slice(0, 100),
        summary: summary ? summary.slice(0, 10000) : null,
        usedReactjis: JSON.stringify(usedReactjis),
        slackTs: isNaN(Number(slackTs)) ? null : Number(slackTs),
        transcription: JSON.stringify(transcription),
        autogroupReflectionGroups: JSON.stringify(autogroupReflectionGroups),
        resetReflectionGroups: JSON.stringify(resetReflectionGroups),
        meetingPrompt: meetingPrompt ? meetingPrompt.slice(0, 255) : null,
        meetingCount: meetingCount || 0
      }
    })

    if (rowsToInsert.length === 0) break
    const lastRow = rowsToInsert[rowsToInsert.length - 1]
    curUpdatedAt = lastRow.updatedAt
    curId = lastRow.id
    await Promise.all(rowsToInsert.map(async (row) => insertRow(row)))
  }
  await sql`ALTER TABLE "NewMeeting" ENABLE TRIGGER "check_meeting_overlap"`.execute(pg)
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`TRUNCATE TABLE "NewMeeting" CASCADE`.execute(pg)
}
