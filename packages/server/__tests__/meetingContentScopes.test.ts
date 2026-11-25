import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'
import {createPersonalAccessToken} from './mcpClient'

afterAll(async () => {
  await getKysely().destroy()
})

const MISSING_SCOPE = 'Access token is missing required scope'
const COMMENT_TEXT = 'A comment only comments:read may see'
const REPLY_TEXT = 'A reply only comments:read may see'
const TASK_TEXT = 'A task made in the discussion'

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const START_TEAM_PROMPT = `
  mutation StartTeamPrompt($teamId: ID!) {
    startTeamPrompt(teamId: $teamId) {
      meeting {
        id
      }
    }
  }
`

const JOIN_MEETING = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meetingId
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

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      task {
        id
      }
    }
  }
`

const THREAD_WITH_COMMENTS = `
  query ThreadWithComments($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              discussion {
                thread {
                  edges {
                    node {
                      __typename
                      id
                      ... on Comment {
                        plaintextContent
                      }
                      ... on Task {
                        plaintextContent
                        replies {
                          __typename
                          id
                          ... on Comment {
                            plaintextContent
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const THREAD_TASKS = `
  query ThreadTasks($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              discussion {
                thread {
                  edges {
                    node {
                      __typename
                      id
                      ... on Task {
                        plaintextContent
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const THREAD_TASK_REPLIES = `
  query ThreadTaskReplies($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              discussion {
                thread {
                  edges {
                    node {
                      ... on Task {
                        plaintextContent
                        replies {
                          ... on Comment {
                            plaintextContent
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const MEETING_TASKS = `
  query MeetingTasks($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on TeamPromptMeeting {
          tasks {
            id
            plaintextContent
          }
        }
      }
    }
  }
`

const REPLY_NOTIFICATIONS = `
  query ReplyNotifications {
    viewer {
      notifications(first: 10) {
        edges {
          node {
            ... on NotifyResponseReplied {
              comment {
                plaintextContent
              }
            }
          }
        }
      }
    }
  }
`

type Auth = {cookie?: string; bearerToken?: string}

const sessionTokenFor = async (userId: string) => {
  const teamMembers = await getKysely()
    .selectFrom('TeamMember')
    .select('teamId')
    .where('userId', '=', userId)
    .where('isNotRemoved', '=', true)
    .execute()
  return encodeAuthToken(new AuthToken({sub: userId, tms: teamMembers.map(({teamId}) => teamId)}))
}

const addTeammate = async (teamId: string) => {
  const teammate = await signUp()
  await getKysely()
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(teamId, teammate.userId),
      teamId,
      userId: teammate.userId,
      isLead: false
    })
    .execute()
  return {bearerToken: await sessionTokenFor(teammate.userId)}
}

const send = async (query: string, variables: Record<string, unknown>, auth: Auth) => {
  const res = await sendPublic({query, variables, ...auth})
  expect(res.errors).toBeUndefined()
  return res.data
}

const setUpThread = async () => {
  const owner = await signUp()
  const ownerAuth = {cookie: owner.cookie}
  const started = await send(START_TEAM_PROMPT, {teamId: owner.teamId}, ownerAuth)
  const meetingId = started.startTeamPrompt.meeting.id as string
  await send(JOIN_MEETING, {meetingId}, ownerAuth)
  const {id: discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .where('discussionTopicId', '=', TeamMemberId.join(owner.teamId, owner.userId))
    .executeTakeFirstOrThrow()

  const teammateAuth = await addTeammate(owner.teamId)
  await send(JOIN_MEETING, {meetingId}, teammateAuth)
  await send(
    ADD_COMMENT,
    {comment: {content: paragraph(COMMENT_TEXT), discussionId, threadSortOrder: 0}},
    teammateAuth
  )
  const created = await send(
    CREATE_TASK,
    {
      newTask: {
        status: 'active',
        teamId: owner.teamId,
        userId: owner.userId,
        meetingId,
        discussionId,
        threadSortOrder: 1,
        content: paragraph(TASK_TEXT)
      }
    },
    ownerAuth
  )
  const taskId = created.createTask.task.id as string
  await send(
    ADD_COMMENT,
    {
      comment: {
        content: paragraph(REPLY_TEXT),
        discussionId,
        threadSortOrder: 0,
        threadParentId: taskId
      }
    },
    ownerAuth
  )
  return {owner, meetingId}
}

const expectMissingScope = (
  res: {data?: unknown; errors?: {message: string; extensions: {code: string}}[]},
  scope: string,
  hiddenTexts: string[]
) => {
  expect(res.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: `${MISSING_SCOPE}: ${scope}`,
        extensions: expect.objectContaining({code: 'FORBIDDEN'})
      })
    ])
  )
  const data = JSON.stringify(res.data)
  for (const text of hiddenTexts) {
    expect(data).not.toContain(text)
  }
}

const expectMissingCommentsRead = (res: Parameters<typeof expectMissingScope>[0]) =>
  expectMissingScope(res, 'comments:read', [COMMENT_TEXT, REPLY_TEXT])

test('a token without comments:read gets FORBIDDEN on comments reached through a meeting', async () => {
  const {owner, meetingId} = await setUpThread()
  const bearerToken = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'TASKS_READ'],
    {
      cookie: owner.cookie
    }
  )

  const res = await sendPublic({query: THREAD_WITH_COMMENTS, variables: {meetingId}, bearerToken})

  expectMissingCommentsRead(res)
})

test('tasks in a thread stay readable with tasks:read and no comments:read', async () => {
  const {owner, meetingId} = await setUpThread()
  const bearerToken = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'TASKS_READ'],
    {
      cookie: owner.cookie
    }
  )

  const data = await send(THREAD_TASKS, {meetingId}, {bearerToken})

  const [stage] = data.viewer.meeting.phases.find((phase: object) => 'stages' in phase).stages
  const nodes = stage.discussion.thread.edges.map(({node}: {node: object}) => node)
  expect(nodes).toEqual([
    {__typename: 'Comment', id: expect.any(String)},
    {__typename: 'Task', id: expect.any(String), plaintextContent: TASK_TEXT}
  ])
})

test('replies under a task need comments:read', async () => {
  const {owner, meetingId} = await setUpThread()
  const bearerToken = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'TASKS_READ'],
    {
      cookie: owner.cookie
    }
  )

  const res = await sendPublic({query: THREAD_TASK_REPLIES, variables: {meetingId}, bearerToken})

  expectMissingCommentsRead(res)
})

test('the comment on a reply notification needs comments:read', async () => {
  const {owner} = await setUpThread()
  const usersOnly = await createPersonalAccessToken(['USERS_READ'], {cookie: owner.cookie})

  expectMissingCommentsRead(await sendPublic({query: REPLY_NOTIFICATIONS, bearerToken: usersOnly}))

  const withComments = await createPersonalAccessToken(['USERS_READ', 'COMMENTS_READ'], {
    cookie: owner.cookie
  })
  const data = await send(REPLY_NOTIFICATIONS, {}, {bearerToken: withComments})
  expect(JSON.stringify(data)).toContain(COMMENT_TEXT)
})

test('comments:read and a session read the whole thread', async () => {
  const {owner, meetingId} = await setUpThread()
  const bearerToken = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'COMMENTS_READ', 'TASKS_READ'],
    {cookie: owner.cookie}
  )

  for (const auth of [{bearerToken}, {cookie: owner.cookie}]) {
    const data = JSON.stringify(await send(THREAD_WITH_COMMENTS, {meetingId}, auth))
    expect(data).toContain(COMMENT_TEXT)
    expect(data).toContain(TASK_TEXT)
    expect(data).toContain(REPLY_TEXT)
  }
})

test('a token without tasks:read gets FORBIDDEN on tasks reached through a meeting', async () => {
  const {owner, meetingId} = await setUpThread()
  const withoutTasks = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'COMMENTS_READ'],
    {cookie: owner.cookie}
  )

  for (const query of [MEETING_TASKS, THREAD_TASKS]) {
    const res = await sendPublic({query, variables: {meetingId}, bearerToken: withoutTasks})
    expectMissingScope(res, 'tasks:read', [TASK_TEXT])
  }

  const withTasks = await createPersonalAccessToken(['USERS_READ', 'MEETINGS_READ', 'TASKS_READ'], {
    cookie: owner.cookie
  })
  const data = await send(MEETING_TASKS, {meetingId}, {bearerToken: withTasks})
  expect(data.viewer.meeting.tasks).toEqual([{id: expect.any(String), plaintextContent: TASK_TEXT}])
})
