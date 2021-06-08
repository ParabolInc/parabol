import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import {parse} from 'url'
import AgendaItemsPhase from '../../database/types/AgendaItemsPhase'
import DiscussPhase from '../../database/types/DiscussPhase'
import EstimatePhase from '../../database/types/EstimatePhase'
import generateUID from '../../generateUID'
import getPgConfig from '../getPgConfig'
import {insertDiscussionsQuery} from '../queries/generated/insertDiscussionsQuery'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: path.split('/')[1]
  })
  const client = new Client(getPgConfig())
  await client.connect()
  const BATCH_SIZE = 3000
  const rMapIf = (r) => (rArr, test, f) => {
    return rArr.map((x) => r.branch(test(x), f(x), x))
  }

  const taskServiceToDiscussionTopicType = {
    github: 'githubIssue',
    jira: 'jiraIssue',
    PARABOL: 'task'
  } as const

  const threadIdToDiscussionId = [] as [string, string][]

  // update meeting stages with discussionId
  for (let i = 0; i < 1e6; i++) {
    const skip = i * BATCH_SIZE
    const curMeetings = await r
      .table('NewMeeting')
      .orderBy('id')
      .skip(skip)
      .limit(BATCH_SIZE)
      .run()
    if (curMeetings.length < 1) break
    const discussions = []
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
        const mapIf = rMapIf(r)
        return r
          .table('NewMeeting')
          .get(meetingId)
          .update((meeting) => ({
            phases: mapIf(
              meeting('phases'),
              (phase) => phase('phaseType').eq('discuss'),
              (phase) =>
                phase.merge({
                  stages: r.map(phase('stages'), r(discussionIds), (stage, discussionId) =>
                    stage.merge({discussionId})
                  )
                })
            )
          }))
          .run()
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
        const mapIf = rMapIf(r)
        return r
          .table('NewMeeting')
          .get(meetingId)
          .update((meeting) => ({
            phases: mapIf(
              meeting('phases'),
              (phase) => phase('phaseType').eq('agendaitems'),
              (phase) =>
                phase.merge({
                  stages: r.map(phase('stages'), r(discussionIds), (stage, discussionId) =>
                    stage.merge({discussionId})
                  )
                })
            )
          }))
          .run()
      } else if (meetingType === 'poker') {
        const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as EstimatePhase
        if (!phase) return
        const {stages} = phase
        const discussionIds = stages.map(() => generateUID())
        stages.forEach((stage, idx) => {
          const {service, serviceTaskId} = stage
          const discussionId = discussionIds[idx]
          threadIdToDiscussionId.push([serviceTaskId, discussionId])
          discussions.push({
            id: discussionId,
            meetingId,
            teamId,
            discussionTopicId: serviceTaskId,
            discussionTopicType: taskServiceToDiscussionTopicType[service]
          })
        })
        const mapIf = rMapIf(r)
        return r
          .table('NewMeeting')
          .get(meetingId)
          .update((meeting) => ({
            phases: mapIf(
              meeting('phases'),
              (phase) => phase('phaseType').eq('ESTIMATE'),
              (phase) =>
                phase.merge({
                  stages: r.map(phase('stages'), r(discussionIds), (stage, discussionId) =>
                    stage.merge({discussionId})
                  )
                })
            )
          }))
          .run()
      }
    })
    try {
      await insertDiscussionsQuery.run({discussions}, client)
    } catch (e) {
      console.log('error inserting discussions', e)
    }
    try {
      await Promise.all(stageUpdates)
    } catch (e) {
      console.log('error updating stage discussionId', e)
    }
  }

  // update comments with discussionId
  await r({
    comment: r.table('Comment').indexCreate('discussionId'),
    task: r.table('Task').indexCreate('discussionId')
  }).run()

  const threadableUpdates = threadIdToDiscussionId.map((item) => {
    const [threadId, discussionId] = item
    return r({
      comment: r
        .table('Comment')
        .getAll(threadId, {index: 'threadId'})
        .update({discussionId}),
      task: r
        .table('Task')
        .getAll(threadId, {index: 'threadId'})
        .update({discussionId})
    }).run()
  })

  try {
    await Promise.all(threadableUpdates)
  } catch (e) {
    console.log('error updating threadables', e)
  }

  await r({
    comment: r.table('Comment').indexDrop('threadId'),
    task: r.table('Task').indexDrop('threadId')
  }).run()

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
      r
        .table('Comment')
        .indexCreate('threadId')
        .run(),
      r
        .table('Task')
        .indexCreate('threadId')
        .run(),
      r
        .table('Comment')
        .indexDrop('discussionId')
        .run(),
      r
        .table('Task')
        .indexDrop('discussionId')
        .run()
    ])
  } catch (e) {
    // nope
  }
  await r.getPoolMaster().drain()
  await pgm.db.query(`
    DELETE FROM "Discussion";
  `)
}
