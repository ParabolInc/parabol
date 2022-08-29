import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import {r, RValue} from 'rethinkdb-ts'
import {parse} from 'url'
import AgendaItemsPhase from '../../database/types/AgendaItemsPhase'
import DiscussPhase from '../../database/types/DiscussPhase'
import EstimatePhase from '../../database/types/EstimatePhase'
import generateUID from '../../generateUID'
import {insertDiscussionsQuery} from '../generatedMigrationHelpers'
import getPgConfig from '../getPgConfig'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host: host!,
    port: parseInt(port!, 10),
    db: path!.split('/')[1]
  })
  const client = new Client(getPgConfig())
  await client.connect()
  const BATCH_SIZE = 3000
  const MAX_PG_PARAMS = 2 ** 16 - 1
  const DISCUSSION_COLS = 5
  const MAX_INSERT_BATCH_SIZE = MAX_PG_PARAMS / DISCUSSION_COLS
  const updateStagesWithDiscussionIds = (
    meetingId: string,
    phaseType: string,
    discussionIds: string[]
  ) => {
    return r
      .table('NewMeeting')
      .get(meetingId)
      .update((meeting: RValue) => ({
        phases: meeting('phases').map((phase: RValue) =>
          r.branch(
            phase('phaseType').eq(phaseType),
            phase.merge({
              stages: r.map(phase('stages'), r(discussionIds), (stage, discussionId) =>
                stage.merge({discussionId})
              )
            }),
            phase
          )
        )
      }))
      .run()
  }

  const taskServiceToDiscussionTopicType = {
    github: 'githubIssue',
    jira: 'jiraIssue',
    PARABOL: 'task'
  } as const

  try {
    await r.table('NewMeeting').indexCreate('createdAt').run()
    await r.table('NewMeeting').indexWait('createdAt').run()
  } catch (e) {
    console.log('failed to create new meeting index createdAt')
  }

  // update meeting stages with discussionId
  for (let i = 0; i < 1e6; i++) {
    const skip = i * BATCH_SIZE
    console.log('migrating meeting #', skip)
    const curMeetings = await r
      .table('NewMeeting')
      .orderBy('createdAt', {index: 'createdAt'})
      .skip(skip)
      .limit(BATCH_SIZE)
      .run()
    if (curMeetings.length < 1) break
    const discussions = [] as any[]
    const threadIdToDiscussionId = [] as [string, string][]
    const stageUpdates = curMeetings.map((meeting) => {
      const {id: meetingId, teamId, meetingType, phases} = meeting
      if (meetingType === 'retrospective') {
        const discussPhase = phases.find((phase) => phase.phaseType === 'discuss') as DiscussPhase
        if (!discussPhase) return
        const {stages} = discussPhase
        const discussionIds = stages.map(() => generateUID())
        if (stages.length === 1 && !stages[0].reflectionGroupId) return undefined
        stages.forEach((stage, idx) => {
          const {reflectionGroupId} = stage
          if (reflectionGroupId) {
            const discussionId = discussionIds[idx]
            threadIdToDiscussionId.push([reflectionGroupId, discussionId])
            discussions.push({
              id: discussionId,
              meetingId,
              teamId,
              discussionTopicId: reflectionGroupId,
              discussionTopicType: 'reflectionGroup' as const
            })
          }
        })
        return updateStagesWithDiscussionIds(meetingId, 'discuss', discussionIds)
      } else if (meetingType === 'action') {
        const phase = phases.find((phase) => phase.phaseType === 'agendaitems') as AgendaItemsPhase
        if (!phase) return
        const {stages} = phase
        const discussionIds = stages.map(() => generateUID())
        stages.forEach((stage, idx) => {
          const {agendaItemId} = stage
          const discussionId = discussionIds[idx]
          threadIdToDiscussionId.push([agendaItemId, discussionId])
          discussions.push({
            id: discussionId,
            meetingId,
            teamId,
            discussionTopicId: agendaItemId,
            discussionTopicType: 'agendaItem' as const
          })
        })
        return updateStagesWithDiscussionIds(meetingId, 'agendaitems', discussionIds)
      } else if (meetingType === 'poker') {
        const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as EstimatePhase
        if (!phase) return
        const {stages} = phase
        const discussionIds = stages.map(() => generateUID())
        stages.forEach((stage, idx) => {
          const {service, serviceTaskId} = stage as any
          const discussionId = discussionIds[idx]
          threadIdToDiscussionId.push([serviceTaskId, discussionId])
          discussions.push({
            id: discussionId,
            meetingId,
            teamId,
            discussionTopicId: serviceTaskId,
            discussionTopicType: taskServiceToDiscussionTopicType[service] || 'task'
          })
        })
        return updateStagesWithDiscussionIds(meetingId, 'ESTIMATE', discussionIds)
      }
    })
    try {
      if (discussions.length > 0) {
        for (let startIdx = 0; startIdx < discussions.length; startIdx += MAX_INSERT_BATCH_SIZE) {
          const batch = discussions.slice(startIdx, startIdx + MAX_INSERT_BATCH_SIZE)
          await insertDiscussionsQuery.run({discussions: batch}, client)
        }
      }
    } catch (e) {
      console.log('error inserting discussions', e)
      throw e
    }
    try {
      await Promise.all(stageUpdates)
    } catch (e) {
      console.log('error updating stage discussionId', e)
    }

    const threadableUpdates = threadIdToDiscussionId.map((item) => {
      const [threadId, discussionId] = item
      return r({
        comment: r.table('Comment').getAll(threadId, {index: 'threadId'}).update({discussionId}),
        task: r.table('Task').getAll(threadId, {index: 'threadId'}).update({discussionId})
      }).run()
    })

    try {
      await Promise.all(threadableUpdates)
    } catch (e) {
      console.log('error updating threadables', e)
    }
  }

  // update comments with discussionId
  try {
    await r({
      comment: r.table('Comment').indexCreate('discussionId'),
      task: r.table('Task').indexCreate('discussionId')
    }).run()
  } catch (e) {
    // commented out because this is guaranteed to happen if installing from scratch
    // console.log('cannot create rethinkdb indexes', e)
  }

  try {
    await r({
      comment: r.table('Comment').indexWait('discussionId'),
      task: r.table('Task').indexWait('discussionId')
    }).run()
  } catch (e) {
    console.log('cannot wait on rethinkdb indexes', e)
  }

  await client.end()
  await r.getPoolMaster().drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: path.split('/')[1]
  })
  try {
    await Promise.all([
      r.table('Comment').indexDrop('discussionId').run(),
      r.table('Task').indexDrop('discussionId').run()
    ])
  } catch (e) {
    // nope
  }
  await r.getPoolMaster().drain()
  await pgm.db.query(`
    DELETE FROM "Discussion";
  `)
}
