import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {SEED_TASK_TEXT} from 'parabol-client/utils/isSeedTask'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import type {NewMeetingPhase, UpdatesStage} from '../postgres/types/NewMeetingPhase'
import type {Tasktagenum} from '../postgres/types/pg'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

type Auth = {cookie?: string; bearerToken?: string}

const START_RETRO = `
  mutation StartRetrospective($teamId: ID!) {
    startRetrospective(teamId: $teamId) {
      ... on StartRetrospectiveSuccess {
        meeting {
          id
        }
      }
    }
  }
`

const START_CHECK_IN = `
  mutation StartCheckIn($teamId: ID!) {
    startCheckIn(teamId: $teamId) {
      ... on StartCheckInSuccess {
        meeting {
          id
        }
      }
    }
  }
`

const JOIN_MEETING = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const addTeammate = async (teamId: string) => {
  const teammate = await signUp()
  const pg = getKysely()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(teamId, teammate.userId),
      teamId,
      userId: teammate.userId,
      isLead: false
    })
    .execute()
  const teamMembers = await pg
    .selectFrom('TeamMember')
    .select('teamId')
    .where('userId', '=', teammate.userId)
    .where('isNotRemoved', '=', true)
    .execute()
  const bearerToken = encodeAuthToken(
    new AuthToken({sub: teammate.userId, tms: teamMembers.map(({teamId}) => teamId)})
  )
  return {...teammate, bearerToken}
}

const addTask = (
  teamId: string,
  userId: string,
  status: 'active' | 'done' = 'active',
  tags: Tasktagenum[] = [],
  plaintextContent = ''
) =>
  getKysely()
    .insertInto('Task')
    .values({
      id: `${teamId}::${generateUID()}`,
      content: JSON.stringify({}),
      createdBy: userId,
      plaintextContent,
      teamId,
      userId,
      status,
      tags
    })
    .execute()

const start = async (query: string, field: string, cookie: string, teamId: string) => {
  const res = await sendPublic({query, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data[field].meeting.id as string
}

const join = async (auth: Auth, meetingId: string) => {
  const res = await sendPublic({query: JOIN_MEETING, variables: {meetingId}, ...auth})
  expect(res.errors).toBeUndefined()
  expect(res.data.joinMeeting.error).toBeUndefined()
}

const getPhases = async (meetingId: string) => {
  const {phases} = await getKysely()
    .selectFrom('NewMeeting')
    .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  return phases
}

const getUpdatesStages = async (meetingId: string) => {
  const phases = await getPhases(meetingId)
  const updates = phases.find(({phaseType}) => phaseType === 'updates')
  return (updates?.stages ?? []) as UpdatesStage[]
}

const setUp = async () => {
  const owner = await signUp()
  const {teamId} = owner
  await getKysely().deleteFrom('Task').where('teamId', '=', teamId).execute()
  const first = await addTeammate(teamId)
  const second = await addTeammate(teamId)
  return {owner, first, second, teamId}
}

const stageOwners = (stages: UpdatesStage[]) =>
  stages.map(({teamMemberId}) => TeamMemberId.split(teamMemberId).userId).sort()

test('a team with no open tasks reviews them in one stage', async () => {
  const {owner, first, second, teamId} = await setUp()
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  await join({cookie: owner.cookie}, meetingId)
  await join({bearerToken: first.bearerToken}, meetingId)
  await join({bearerToken: second.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual([owner.userId])
})

test('done, private and archived tasks do not count as open', async () => {
  const {owner, first, teamId} = await setUp()
  await addTask(teamId, first.userId, 'done')
  await addTask(teamId, first.userId, 'active', ['private'])
  await addTask(teamId, first.userId, 'active', ['archived'])
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  await join({bearerToken: first.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual([owner.userId])
})

test('sample tasks do not count as open', async () => {
  const {owner, first, teamId} = await setUp()
  await addTask(teamId, first.userId, 'active', [], SEED_TASK_TEXT)
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  await join({bearerToken: first.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual([owner.userId])
})

test('every joiner gets a stage once anyone on the team has an open task', async () => {
  const {owner, first, second, teamId} = await setUp()
  await addTask(teamId, owner.userId)
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  await join({bearerToken: first.bearerToken}, meetingId)
  await join({bearerToken: second.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual(
    [owner.userId, first.userId, second.userId].sort()
  )
})

test('a task added between joins gives later joiners a stage', async () => {
  const {owner, first, second, teamId} = await setUp()
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  await join({bearerToken: first.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual([owner.userId])
  await addTask(teamId, second.userId)
  await join({bearerToken: second.bearerToken}, meetingId)
  await join({bearerToken: first.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual(
    [owner.userId, second.userId, first.userId].sort()
  )
})

test('a stage added after the phase is complete is complete too', async () => {
  const {owner, first, teamId} = await setUp()
  const meetingId = await start(START_RETRO, 'startRetrospective', owner.cookie, teamId)
  const pg = getKysely()
  const phases = await getPhases(meetingId)
  phases
    .find(({phaseType}) => phaseType === 'updates')!
    .stages.forEach((stage) => {
      stage.isComplete = true
    })
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  await addTask(teamId, first.userId)
  await join({bearerToken: first.bearerToken}, meetingId)
  const stages = await getUpdatesStages(meetingId)
  expect(stages).toHaveLength(2)
  expect(stages.every(({isComplete}) => isComplete)).toBe(true)
})

test('check-ins keep a stage per person with no tasks', async () => {
  const {owner, first, teamId} = await setUp()
  const meetingId = await start(START_CHECK_IN, 'startCheckIn', owner.cookie, teamId)
  await join({bearerToken: first.bearerToken}, meetingId)
  expect(stageOwners(await getUpdatesStages(meetingId))).toEqual(
    [owner.userId, first.userId].sort()
  )
})
