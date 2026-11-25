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
      }
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

  const addComment = async (text: string, targetDiscussionId: string, threadParentId?: string) => {
    const added = await sendPublic({
      query: ADD_COMMENT,
      variables: {
        comment: {
          content: paragraph(text),
          discussionId: targetDiscussionId,
          threadSortOrder: 0,
          threadParentId
        }
      },
      cookie: owner.cookie
    })
    expect(added.errors).toBeUndefined()
    return added.data.addComment.comment.id as string
  }
  const parentId = await addComment('Deploys feel slow', discussionId)
  await addComment('Agreed, the queue is the issue', discussionId, parentId)
  await addComment('Support rota is working well', otherDiscussionId)
  const deletedId = await addComment('Said by mistake', discussionId)
  const deleted = await sendPublic({
    query: DELETE_COMMENT,
    variables: {commentId: deletedId, meetingId},
    cookie: owner.cookie
  })
  expect(deleted.errors).toBeUndefined()

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
