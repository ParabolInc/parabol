import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

type Member = Awaited<ReturnType<typeof signUp>>

const MARKDOWN = 'Did **a thing** & fixed [the link](https://example.com)\n\n- one\n- two'
const DRAFT_JS = JSON.stringify({blocks: [{text: 'old format', type: 'unstyled'}], entityMap: {}})
const EXPECTED_FORMAT = 'stringified TipTap JSON'
const INVALID_DOCUMENT = 'The content is not a valid editor document'
const INVALID_DOCUMENTS = {
  'an unknown node type': JSON.stringify({type: 'doc', content: [{type: 'bogus'}]}),
  'content that is not a list': JSON.stringify({type: 'doc', content: 'hello'}),
  'text directly under the doc': JSON.stringify({
    type: 'doc',
    content: [{type: 'text', text: 'x'}]
  }),
  'a top node that is not a doc': JSON.stringify({
    type: 'paragraph',
    content: [{type: 'text', text: 'x'}]
  })
}

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const EMPTY_PARAGRAPH = {type: 'doc', content: [{type: 'paragraph'}]}

const START_TEAM_PROMPT = `
  mutation StartTeamPrompt($teamId: ID!) {
    startTeamPrompt(teamId: $teamId) {
      meeting {
        id
        prompts {
          id
        }
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

const UPDATE_COMMENT_CONTENT = `
  mutation UpdateCommentContent($commentId: ID!, $meetingId: ID!, $content: String!) {
    updateCommentContent(commentId: $commentId, meetingId: $meetingId, content: $content) {
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
        plaintextContent
      }
    }
  }
`

const UPDATE_TASK = `
  mutation UpdateTask($updatedTask: UpdateTaskInput!) {
    updateTask(updatedTask: $updatedTask) {
      task {
        id
        plaintextContent
      }
    }
  }
`

const UPSERT_RESPONSE = `
  mutation UpsertTeamPromptResponse($meetingId: ID!, $promptId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
      teamPromptResponse {
        id
      }
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

const UPDATE_REFLECTION_CONTENT = `
  mutation UpdateReflectionContent($reflectionId: ID!, $content: String!) {
    updateReflectionContent(reflectionId: $reflectionId, content: $content) {
      reflection {
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
        isActive
        plaintextContent
      }
    }
  }
`

const THREAD_COMMENTS = `
  query ThreadComments($discussionId: ID!) {
    viewer {
      discussion(id: $discussionId) {
        thread {
          edges {
            node {
              ... on Comment {
                id
                isActive
                plaintextContent
                replies {
                  ... on Comment {
                    id
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
`

const startStandup = async (owner: Member) => {
  const started = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: meetingId, prompts} = started.data.startTeamPrompt.meeting
  await sendPublic({query: JOIN_MEETING, variables: {meetingId}, cookie: owner.cookie})
  const {id: discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .executeTakeFirstOrThrow()
  return {meetingId: meetingId as string, promptId: prompts[0].id as string, discussionId}
}

const commentCount = async (discussionId: string) => {
  const {count} = await getKysely()
    .selectFrom('Comment')
    .select(({fn}) => fn.countAll<string>().as('count'))
    .where('discussionId', '=', discussionId)
    .executeTakeFirstOrThrow()
  return Number(count)
}

const taskCount = async (teamId: string) => {
  const {count} = await getKysely()
    .selectFrom('Task')
    .select(({fn}) => fn.countAll<string>().as('count'))
    .where('teamId', '=', teamId)
    .executeTakeFirstOrThrow()
  return Number(count)
}

const expectRefusal = (res: {errors?: {message: string; extensions: {code: string}}[]}) => {
  expect(res.errors).toEqual([
    expect.objectContaining({
      message: expect.stringContaining(EXPECTED_FORMAT),
      extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})
    })
  ])
}

const expectInvalidDocument = (res: {errors?: {message: string; extensions: {code: string}}[]}) => {
  expect(res.errors).toEqual([
    expect.objectContaining({
      message: expect.stringContaining(INVALID_DOCUMENT),
      extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})
    })
  ])
}

const createTask = async (owner: Member, content?: string) =>
  sendPublic({
    query: CREATE_TASK,
    variables: {newTask: {status: 'active', teamId: owner.teamId, userId: owner.userId, content}},
    cookie: owner.cookie
  })

test('addComment refuses markdown and stores nothing', async () => {
  const owner = await signUp()
  const {discussionId} = await startStandup(owner)

  const res = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: MARKDOWN, discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })

  expectRefusal(res)
  expect(await commentCount(discussionId)).toBe(0)
})

test('addComment refuses valid JSON that is not a TipTap document', async () => {
  const owner = await signUp()
  const {discussionId} = await startStandup(owner)

  const res = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: DRAFT_JS, discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })

  expectInvalidDocument(res)
  expect(await commentCount(discussionId)).toBe(0)
})

test('addComment stores TipTap JSON and Comment.plaintextContent returns its text', async () => {
  const owner = await signUp()
  const {discussionId} = await startStandup(owner)

  const added = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: paragraph('Nice work'), discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })
  expect(added.errors).toBeUndefined()

  const thread = await sendPublic({
    query: THREAD_COMMENTS,
    variables: {discussionId},
    cookie: owner.cookie
  })
  expect(thread.errors).toBeUndefined()
  expect(thread.data.viewer.discussion.thread.edges).toEqual([
    {
      node: {
        id: added.data.addComment.comment.id,
        isActive: true,
        plaintextContent: 'Nice work',
        replies: []
      }
    }
  ])
})

test('deleteComment turns a comment with replies into a [deleted] tombstone', async () => {
  const owner = await signUp()
  const {meetingId, discussionId} = await startStandup(owner)
  const added = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: paragraph('Secret words'), discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })
  const commentId = added.data.addComment.comment.id as string
  const reply = await sendPublic({
    query: ADD_COMMENT,
    variables: {
      comment: {
        content: paragraph('Still here'),
        discussionId,
        threadSortOrder: 0,
        threadParentId: commentId
      }
    },
    cookie: owner.cookie
  })
  const replyId = reply.data.addComment.comment.id as string

  const deleted = await sendPublic({
    query: DELETE_COMMENT,
    variables: {commentId, meetingId},
    cookie: owner.cookie
  })
  expect(deleted.errors).toBeUndefined()
  expect(deleted.data.deleteComment.comment).toEqual({
    id: commentId,
    isActive: false,
    plaintextContent: '[deleted]'
  })

  const thread = await sendPublic({
    query: THREAD_COMMENTS,
    variables: {discussionId},
    cookie: owner.cookie
  })

  expect(thread.errors).toBeUndefined()
  expect(thread.data.viewer.discussion.thread.edges).toEqual([
    {
      node: {
        id: commentId,
        isActive: false,
        plaintextContent: '[deleted]',
        replies: [{id: replyId, plaintextContent: 'Still here'}]
      }
    }
  ])
})

test('deleteComment drops a comment with no replies from the thread, and a deleted reply from its parent', async () => {
  const owner = await signUp()
  const {meetingId, discussionId} = await startStandup(owner)
  const addComment = async (text: string, threadParentId?: string) => {
    const added = await sendPublic({
      query: ADD_COMMENT,
      variables: {
        comment: {content: paragraph(text), discussionId, threadSortOrder: 0, threadParentId}
      },
      cookie: owner.cookie
    })
    return added.data.addComment.comment.id as string
  }
  const deleteComment = (commentId: string) =>
    sendPublic({query: DELETE_COMMENT, variables: {commentId, meetingId}, cookie: owner.cookie})
  const threadNodes = async () => {
    const thread = await sendPublic({
      query: THREAD_COMMENTS,
      variables: {discussionId},
      cookie: owner.cookie
    })
    return thread.data.viewer.discussion.thread.edges.map(
      ({node}: {node: {id: string; replies: {id: string}[]}}) => ({
        id: node.id,
        replies: node.replies.map(({id}) => id)
      })
    )
  }
  const lonelyId = await addComment('Lonely')
  const parentId = await addComment('Parent')
  const replyId = await addComment('Reply', parentId)
  expect(await threadNodes()).toEqual([
    {id: lonelyId, replies: []},
    {id: parentId, replies: [replyId]}
  ])

  await deleteComment(lonelyId)
  await deleteComment(replyId)

  expect(await threadNodes()).toEqual([{id: parentId, replies: []}])
})

test('updateCommentContent refuses markdown and keeps the comment as it was', async () => {
  const owner = await signUp()
  const {meetingId, discussionId} = await startStandup(owner)
  const added = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: paragraph('First words'), discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })
  const commentId = added.data.addComment.comment.id as string

  const res = await sendPublic({
    query: UPDATE_COMMENT_CONTENT,
    variables: {commentId, meetingId, content: MARKDOWN},
    cookie: owner.cookie
  })

  expectRefusal(res)
  const stored = await getKysely()
    .selectFrom('Comment')
    .select('plaintextContent')
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow()
  expect(stored.plaintextContent).toBe('First words')
})

test('updateCommentContent still takes TipTap JSON', async () => {
  const owner = await signUp()
  const {meetingId, discussionId} = await startStandup(owner)
  const added = await sendPublic({
    query: ADD_COMMENT,
    variables: {comment: {content: paragraph('First words'), discussionId, threadSortOrder: 0}},
    cookie: owner.cookie
  })
  const commentId = added.data.addComment.comment.id as string

  const res = await sendPublic({
    query: UPDATE_COMMENT_CONTENT,
    variables: {commentId, meetingId, content: paragraph('Second words')},
    cookie: owner.cookie
  })

  expect(res.errors).toBeUndefined()
  const stored = await getKysely()
    .selectFrom('Comment')
    .select('plaintextContent')
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow()
  expect(stored.plaintextContent).toBe('Second words')
})

test('createTask refuses markdown and stores nothing', async () => {
  const owner = await signUp()
  const before = await taskCount(owner.teamId)

  const res = await createTask(owner, MARKDOWN)

  expectRefusal(res)
  expect(await taskCount(owner.teamId)).toBe(before)
})

test('createTask refuses valid JSON that is not a TipTap document', async () => {
  const owner = await signUp()
  const before = await taskCount(owner.teamId)

  const res = await createTask(owner, DRAFT_JS)

  expectInvalidDocument(res)
  expect(await taskCount(owner.teamId)).toBe(before)
})

test('createTask takes TipTap JSON, and no content at all as an empty task', async () => {
  const owner = await signUp()

  const withContent = await createTask(owner, paragraph('Write the docs'))
  expect(withContent.errors).toBeUndefined()
  expect(withContent.data.createTask.task.plaintextContent).toBe('Write the docs')

  const withoutContent = await createTask(owner)
  expect(withoutContent.errors).toBeUndefined()
  const stored = await getKysely()
    .selectFrom('Task')
    .select('content')
    .where('id', '=', withoutContent.data.createTask.task.id)
    .executeTakeFirstOrThrow()
  expect(stored.content).toEqual(EMPTY_PARAGRAPH)
})

test('createTask still takes a paragraph nested in a paragraph, as deployed clients send for archived tasks', async () => {
  const owner = await signUp()
  const nested = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: 'Fix it'},
          {
            type: 'paragraph',
            content: [
              {type: 'taskTag', attrs: {id: 'archived', label: null, mentionSuggestionChar: '@'}}
            ]
          }
        ]
      }
    ]
  })

  const res = await createTask(owner, nested)

  expect(res.errors).toBeUndefined()
  expect(res.data.createTask.task.plaintextContent).toContain('Fix it')
})

test('updateTask refuses markdown and keeps the task as it was', async () => {
  const owner = await signUp()
  const created = await createTask(owner, paragraph('Original words'))
  const taskId = created.data.createTask.task.id as string

  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, content: MARKDOWN}},
    cookie: owner.cookie
  })

  expectRefusal(res)
  const stored = await getKysely()
    .selectFrom('Task')
    .select('plaintextContent')
    .where('id', '=', taskId)
    .executeTakeFirstOrThrow()
  expect(stored.plaintextContent).toBe('Original words')
})

test('updateTask still takes TipTap JSON', async () => {
  const owner = await signUp()
  const created = await createTask(owner, paragraph('Original words'))
  const taskId = created.data.createTask.task.id as string

  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, content: paragraph('Changed words')}},
    cookie: owner.cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data.updateTask.task.plaintextContent).toBe('Changed words')
})

test('createReflection and updateReflectionContent refuse markdown and keep the card as it was', async () => {
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

  const refusedCreate = await sendPublic({
    query: CREATE_REFLECTION,
    variables: {input: {content: MARKDOWN, meetingId, promptId: prompt.id, sortOrder: 0}},
    cookie: owner.cookie
  })
  expectRefusal(refusedCreate)
  const noReflections = await getKysely()
    .selectFrom('RetroReflection')
    .select('id')
    .where('meetingId', '=', meetingId)
    .execute()
  expect(noReflections).toHaveLength(0)

  const created = await sendPublic({
    query: CREATE_REFLECTION,
    variables: {
      input: {content: paragraph('Went well'), meetingId, promptId: prompt.id, sortOrder: 0}
    },
    cookie: owner.cookie
  })
  const reflectionId = created.data.createReflection.reflectionId as string
  const refusedUpdate = await sendPublic({
    query: UPDATE_REFLECTION_CONTENT,
    variables: {reflectionId, content: MARKDOWN},
    cookie: owner.cookie
  })
  expectRefusal(refusedUpdate)
  const stored = await getKysely()
    .selectFrom('RetroReflection')
    .select('plaintextContent')
    .where('id', '=', reflectionId)
    .executeTakeFirstOrThrow()
  expect(stored.plaintextContent).toBe('Went well')
})

test('upsertTeamPromptResponse names the format it expects when given markdown', async () => {
  const owner = await signUp()
  const {meetingId, promptId} = await startStandup(owner)

  const res = await sendPublic({
    query: UPSERT_RESPONSE,
    variables: {meetingId, promptId, content: MARKDOWN},
    cookie: owner.cookie
  })

  expectRefusal(res)
  const stored = await getKysely()
    .selectFrom('TeamPromptResponse')
    .select('id')
    .where('meetingId', '=', meetingId)
    .execute()
  expect(stored).toHaveLength(0)
})

test.each(Object.entries(INVALID_DOCUMENTS))(
  'upsertTeamPromptResponse refuses %s and stores nothing',
  async (_label, content) => {
    const owner = await signUp()
    const {meetingId, promptId} = await startStandup(owner)

    const res = await sendPublic({
      query: UPSERT_RESPONSE,
      variables: {meetingId, promptId, content},
      cookie: owner.cookie
    })

    expectInvalidDocument(res)
    const stored = await getKysely()
      .selectFrom('TeamPromptResponse')
      .select('id')
      .where('meetingId', '=', meetingId)
      .execute()
    expect(stored).toHaveLength(0)
  }
)

test('addComment refuses a doc with an unknown node and stores nothing', async () => {
  const owner = await signUp()
  const {discussionId} = await startStandup(owner)

  const res = await sendPublic({
    query: ADD_COMMENT,
    variables: {
      comment: {
        content: INVALID_DOCUMENTS['an unknown node type'],
        discussionId,
        threadSortOrder: 0
      }
    },
    cookie: owner.cookie
  })

  expectInvalidDocument(res)
  expect(await commentCount(discussionId)).toBe(0)
})
