import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

type Member = Awaited<ReturnType<typeof signUp>>

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const START_SPRINT_POKER = `
  mutation StartSprintPoker($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      meetingId
    }
  }
`

const START_RETROSPECTIVE = `
  mutation StartRetrospective($teamId: ID!) {
    startRetrospective(teamId: $teamId) {
      meeting {
        id
        phases {
          ... on ReflectPhase {
            reflectPrompts {
              id
            }
          }
        }
      }
    }
  }
`

const CREATE_REFLECTION = `
  mutation CreateReflection($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      ... on CreateReflectionPayload {
        reflectionId
      }
    }
  }
`

const START_CHECK_IN = `
  mutation StartCheckIn($teamId: ID!) {
    startCheckIn(teamId: $teamId) {
      meeting {
        id
      }
    }
  }
`

const ADD_AGENDA_ITEM = `
  mutation AddAgendaItem($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
      agendaItem {
        id
      }
    }
  }
`

const END_CHECK_IN = `
  mutation EndCheckIn($meetingId: ID!) {
    endCheckIn(meetingId: $meetingId) {
      __typename
    }
  }
`

const START_TEAM_HEALTH = `
  mutation StartTeamHealth($teamIds: [ID!]!, $templateId: ID!) {
    startTeamHealth(teamIds: $teamIds, templateId: $templateId) {
      meetings {
        id
      }
    }
  }
`

const UPDATE_POKER_SCOPE = `
  mutation UpdatePokerScope($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      newStages {
        id
      }
    }
  }
`

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      task {
        id
      }
    }
  }
`

const ADD_COMMENT = `
  mutation AddComment($comment: AddCommentInput!) {
    addComment(comment: $comment) {
      comment {
        id
      }
    }
  }
`

const DELETE_COMMENT = `
  mutation DeleteComment($commentId: ID!, $meetingId: ID!) {
    deleteComment(commentId: $commentId, meetingId: $meetingId) {
      comment {
        id
      }
    }
  }
`

const END_SPRINT_POKER = `
  mutation EndSprintPoker($meetingId: ID!) {
    endSprintPoker(meetingId: $meetingId) {
      __typename
    }
  }
`

const END_RETROSPECTIVE = `
  mutation EndRetrospective($meetingId: ID!) {
    endRetrospective(meetingId: $meetingId) {
      __typename
    }
  }
`

const END_TEAM_HEALTH = `
  mutation EndTeamHealth($meetingId: ID!) {
    endTeamHealth(meetingId: $meetingId) {
      meetingId
    }
  }
`

const POKER_STORY_COUNT = `
  query PokerStoryCount($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on PokerMeeting {
          storyCount
        }
      }
    }
  }
`

const waitForSummaryText = async (meetingId: string, lastExpectedText: string) => {
  const deadline = Date.now() + 20000
  while (true) {
    const summaryPage = await getKysely()
      .selectFrom('Page')
      .select('plaintextContent')
      .where('summaryMeetingId', '=', meetingId)
      .executeTakeFirst()
    const summaryText = summaryPage?.plaintextContent ?? ''
    if (summaryText.includes(lastExpectedText) || Date.now() > deadline) return summaryText
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

const addComment = async (
  member: Member,
  discussionId: string,
  text: string,
  threadParentId?: string,
  isAnonymous?: boolean
) => {
  const added = await sendPublic({
    query: ADD_COMMENT,
    variables: {
      comment: {
        content: paragraph(text),
        discussionId,
        threadSortOrder: 0,
        threadParentId,
        isAnonymous
      }
    },
    cookie: member.cookie
  })
  expect(added.errors).toBeUndefined()
  return added.data.addComment.comment.id as string
}

const deleteComment = async (member: Member, meetingId: string, commentId: string) => {
  const deleted = await sendPublic({
    query: DELETE_COMMENT,
    variables: {commentId, meetingId},
    cookie: member.cookie
  })
  expect(deleted.errors).toBeUndefined()
}

const createTask = async (
  member: Member,
  extra: {content: string; userId?: string; meetingId?: string; discussionId?: string}
) => {
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {newTask: {status: 'active', teamId: member.teamId, ...extra}},
    cookie: member.cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createTask.task.id as string
}

const makeTaskPrivate = (taskId: string) =>
  getKysely()
    .updateTable('Task')
    .set({tags: ['private']})
    .where('id', '=', taskId)
    .execute()

test('a poker meeting counts every scoped story, even when none was navigated to', async () => {
  const owner = await signUp()
  const started = await sendPublic({
    query: START_SPRINT_POKER,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const meetingId: string = started.data.startSprintPoker.meetingId
  const taskIds = await Promise.all(
    ['Story one', 'Story two', 'Story three'].map((text) =>
      createTask(owner, {content: paragraph(text), userId: owner.userId})
    )
  )
  const scoped = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: taskIds.map((serviceTaskId) => ({service: 'PARABOL', serviceTaskId, action: 'ADD'}))
    },
    cookie: owner.cookie
  })
  expect(scoped.data.updatePokerScope.newStages).toHaveLength(3)

  const ended = await sendPublic({
    query: END_SPRINT_POKER,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()

  const meeting = await sendPublic({
    query: POKER_STORY_COUNT,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(meeting.data.viewer.meeting.storyCount).toBe(3)
  expect(await waitForSummaryText(meetingId, '3 Stories')).toContain('3 Stories')
}, 60000)

test('a retro summary lists tasks nobody is assigned to', async () => {
  const owner = await signUp()
  const started = await sendPublic({
    query: START_RETROSPECTIVE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const meetingId: string = started.data.startRetrospective.meeting.id
  await createTask(owner, {
    content: paragraph('Assigned retro task'),
    userId: owner.userId,
    meetingId
  })
  await createTask(owner, {content: paragraph('Unassigned retro task'), meetingId})
  const privateTaskId = await createTask(owner, {
    content: paragraph('Private retro task'),
    userId: owner.userId,
    meetingId
  })
  await makeTaskPrivate(privateTaskId)

  const ended = await sendPublic({
    query: END_RETROSPECTIVE,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()

  const summary = await waitForSummaryText(meetingId, 'Discussion Thread')
  expect(summary).toContain('2 Tasks')
  expect(summary).toContain('Assigned retro task')
  expect(summary).toContain('Unassigned retro task')
  expect(summary).not.toContain('Private retro task')
}, 60000)

test('a team health summary holds the meeting tasks and the comments on each question', async () => {
  const owner = await signUp()
  const started = await sendPublic({
    query: START_TEAM_HEALTH,
    variables: {teamIds: [owner.teamId], templateId: 'googleProjectAristotleTemplate'},
    cookie: owner.cookie
  })
  const meetingId: string = started.data.startTeamHealth.meetings[0].id
  const [firstDiscussion, secondDiscussion] = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .orderBy('id')
    .execute()
  const discussionId = firstDiscussion!.id
  const otherDiscussionId = secondDiscussion!.id

  const parentId = await addComment(owner, discussionId, 'Deploys feel slow')
  await addComment(owner, discussionId, 'Agreed, the queue is the issue', parentId)
  await addComment(owner, otherDiscussionId, 'Support rota is working well')
  await deleteComment(owner, meetingId, await addComment(owner, discussionId, 'Said by mistake'))

  await createTask(owner, {
    content: paragraph('Assigned health task'),
    userId: owner.userId,
    meetingId,
    discussionId
  })
  await createTask(owner, {
    content: paragraph('Unassigned health task'),
    meetingId,
    discussionId: otherDiscussionId
  })

  const ended = await sendPublic({
    query: END_TEAM_HEALTH,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()

  const summary = await waitForSummaryText(meetingId, 'Average')
  expect(summary).toContain('2 Tasks')
  expect(summary).toContain('Assigned health task')
  expect(summary).toContain('Unassigned health task')
  expect(summary).toContain('3 Discussion Comments')
  expect(summary).toContain('Deploys feel slow')
  expect(summary).toContain('Agreed, the queue is the issue')
  expect(summary).toContain('Support rota is working well')
  expect(summary).not.toContain('Said by mistake')
}, 60000)

test('a retro summary keeps private tasks and deleted comments out of its table and task blocks', async () => {
  const owner = await signUp()
  const started = await sendPublic({
    query: START_RETROSPECTIVE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: meetingId, phases} = started.data.startRetrospective.meeting
  const [prompt] = phases.flatMap(
    ({reflectPrompts}: {reflectPrompts?: {id: string}[]}) => reflectPrompts ?? []
  )
  for (const text of ['Went well', 'Went badly', 'Confusing']) {
    await sendPublic({
      query: CREATE_REFLECTION,
      variables: {input: {content: paragraph(text), meetingId, promptId: prompt.id, sortOrder: 0}},
      cookie: owner.cookie
    })
  }
  const pg = getKysely()
  const reflection = await pg
    .selectFrom('RetroReflection')
    .select('reflectionGroupId')
    .where('meetingId', '=', meetingId)
    .where('plaintextContent', '=', 'Went well')
    .executeTakeFirstOrThrow()
  const meeting = await pg
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  const meetingPhases = meeting.phases as {phaseType: string; stages: Record<string, unknown>[]}[]
  const discussStage = meetingPhases.find(({phaseType}) => phaseType === 'discuss')!.stages[0]!
  discussStage.reflectionGroupId = reflection.reflectionGroupId
  const discussionId = discussStage.discussionId as string
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(meetingPhases)})
    .where('id', '=', meetingId)
    .execute()
  await pg
    .insertInto('Discussion')
    .values({
      id: discussionId,
      meetingId,
      teamId: owner.teamId,
      discussionTopicType: 'reflectionGroup',
      discussionTopicId: reflection.reflectionGroupId
    })
    .execute()

  await createTask(owner, {
    content: paragraph('Public discussion task'),
    userId: owner.userId,
    meetingId,
    discussionId
  })
  const privateTaskId = await createTask(owner, {
    content: paragraph('Private discussion task'),
    userId: owner.userId,
    meetingId,
    discussionId
  })
  await makeTaskPrivate(privateTaskId)
  await addComment(owner, discussionId, 'Kept comment')
  await deleteComment(owner, meetingId, await addComment(owner, discussionId, 'Deleted comment'))

  const ended = await sendPublic({
    query: END_RETROSPECTIVE,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()

  const summary = await waitForSummaryText(meetingId, 'Discussion Thread')
  expect(summary).toContain('Public discussion task')
  expect(summary).toContain('Kept comment')
  expect(summary).not.toContain('Private discussion task')
  expect(summary).not.toContain('Deleted comment')
}, 60000)

const startCheckInWithAgendaItem = async (owner: Member) => {
  const started = await sendPublic({
    query: START_CHECK_IN,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const meetingId: string = started.data.startCheckIn.meeting.id
  const added = await sendPublic({
    query: ADD_AGENDA_ITEM,
    variables: {
      newAgendaItem: {
        content: 'Hiring plan',
        pinned: false,
        teamId: owner.teamId,
        teamMemberId: TeamMemberId.join(owner.teamId, owner.userId),
        meetingId
      }
    },
    cookie: owner.cookie
  })
  expect(added.errors).toBeUndefined()
  const {id: discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .executeTakeFirstOrThrow()
  return {meetingId, discussionId}
}

const endCheckIn = async (owner: Member, meetingId: string) => {
  const ended = await sendPublic({
    query: END_CHECK_IN,
    variables: {meetingId},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()
}

test('a check-in summary keeps private tasks out of its table and task blocks', async () => {
  const owner = await signUp()
  const {meetingId, discussionId} = await startCheckInWithAgendaItem(owner)

  await createTask(owner, {
    content: paragraph('Public agenda task'),
    userId: owner.userId,
    meetingId,
    discussionId
  })
  const privateTaskId = await createTask(owner, {
    content: paragraph('Private agenda task'),
    userId: owner.userId,
    meetingId,
    discussionId
  })
  await makeTaskPrivate(privateTaskId)

  await endCheckIn(owner, meetingId)

  const summary = await waitForSummaryText(meetingId, 'Discussion Thread')
  expect(summary).toMatch(/\b1 Task\b/)
  expect(summary).toContain('Public agenda task')
  expect(summary).not.toContain('Private agenda task')
}, 60000)

test('a check-in summary leaves deleted comments out and names anonymous commenters Anonymous', async () => {
  const owner = await signUp()
  const {preferredName} = await getKysely()
    .selectFrom('User')
    .select('preferredName')
    .where('id', '=', owner.userId)
    .executeTakeFirstOrThrow()
  const {meetingId, discussionId} = await startCheckInWithAgendaItem(owner)

  await addComment(owner, discussionId, 'Said in confidence', undefined, true)
  await deleteComment(owner, meetingId, await addComment(owner, discussionId, 'Said by mistake'))

  await endCheckIn(owner, meetingId)

  const summary = await waitForSummaryText(meetingId, 'Discussion Thread')
  const tableRows = summary.slice(summary.indexOf('Discussion Thread'))
  expect(tableRows).toContain('Said in confidence')
  expect(tableRows).toContain('Anonymous')
  expect(tableRows).not.toContain(preferredName)
  expect(tableRows).not.toContain('Said by mistake')
}, 60000)
