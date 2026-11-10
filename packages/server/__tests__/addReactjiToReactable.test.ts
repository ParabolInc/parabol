import {sql} from 'kysely'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

type ReactableType = 'COMMENT' | 'REFLECTION' | 'RESPONSE'
type Reactable = {meetingId: string; reactableId: string}

const DOC = JSON.stringify({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text: 'hello'}]}]
})

const startStandup = async (cookie: string, teamId: string) => {
  const started = await sendPublic({
    query: `
      mutation StartTeamPrompt($teamId: ID!) {
        startTeamPrompt(teamId: $teamId) {
          ... on StartTeamPromptSuccess {
            meeting {
              id
              prompts {
                id
              }
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  const {id: meetingId, prompts} = started.data.startTeamPrompt.meeting
  await sendPublic({
    query: `
      mutation JoinMeeting($meetingId: ID!) {
        joinMeeting(meetingId: $meetingId) {
          ... on JoinMeetingSuccess {
            meetingId
          }
        }
      }
    `,
    variables: {meetingId},
    cookie
  })
  return {meetingId: meetingId as string, promptId: prompts[0].id as string}
}

const shareResponse = async (cookie: string, meetingId: string, promptId: string) => {
  const upserted = await sendPublic({
    query: `
      mutation UpsertTeamPromptResponse($meetingId: ID!, $promptId: ID!, $content: String!) {
        upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
          teamPromptResponse {
            id
          }
        }
      }
    `,
    variables: {meetingId, promptId, content: DOC},
    cookie
  })
  await sendPublic({
    query: `
      mutation ShareTeamPromptResponses($meetingId: ID!) {
        shareTeamPromptResponses(meetingId: $meetingId) {
          responses {
            id
          }
        }
      }
    `,
    variables: {meetingId},
    cookie
  })
  return upserted.data.upsertTeamPromptResponse.teamPromptResponse.id as string
}

const addComment = async (cookie: string, meetingId: string) => {
  const {id: discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .executeTakeFirstOrThrow()
  const added = await sendPublic({
    query: `
      mutation AddComment($comment: AddCommentInput!) {
        addComment(comment: $comment) {
          ... on AddCommentSuccess {
            comment {
              id
            }
          }
        }
      }
    `,
    variables: {comment: {content: DOC, discussionId, threadSortOrder: 0}},
    cookie
  })
  return added.data.addComment.comment.id as string
}

const createReflection = async (cookie: string, teamId: string) => {
  const started = await sendPublic({
    query: `
      mutation StartRetrospective($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on StartRetrospectiveSuccess {
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
      }
    `,
    variables: {teamId},
    cookie
  })
  const {id: meetingId, phases} = started.data.startRetrospective.meeting
  const [prompt] = phases.flatMap(
    ({reflectPrompts}: {reflectPrompts?: {id: string}[]}) => reflectPrompts ?? []
  )
  const created = await sendPublic({
    query: `
      mutation CreateReflection($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          ... on CreateReflectionPayload {
            reflectionId
          }
        }
      }
    `,
    variables: {input: {content: DOC, meetingId, promptId: prompt.id, sortOrder: 0}},
    cookie
  })
  return {meetingId: meetingId as string, reactableId: created.data.createReflection.reflectionId}
}

const react = (cookie: string, meetingId: string, reactableId: string, reactableType: string) =>
  sendPublic({
    query: `
      mutation AddReactji($meetingId: ID!, $reactableId: ID!, $reactableType: ReactableEnum!) {
        addReactjiToReactable(
          meetingId: $meetingId
          reactableId: $reactableId
          reactableType: $reactableType
          reactji: "heart"
        ) {
          ... on AddReactjiToReactableSuccess {
            reactable {
              id
            }
          }
        }
      }
    `,
    variables: {meetingId, reactableId, reactableType},
    cookie
  })

const getReactjiCount = async (reactableId: string, reactableType: ReactableType) => {
  const pg = getKysely()
  const count = sql<number>`cardinality("reactjis")`.as('count')
  const row =
    reactableType === 'RESPONSE'
      ? await pg
          .selectFrom('TeamPromptResponse')
          .select(count)
          .where('id', '=', TeamPromptResponseId.split(reactableId))
          .executeTakeFirstOrThrow()
      : await pg
          .selectFrom(reactableType === 'COMMENT' ? 'Comment' : 'RetroReflection')
          .select(count)
          .where('id', '=', reactableId)
          .executeTakeFirstOrThrow()
  return row.count
}

let owner: Awaited<ReturnType<typeof signUp>>
let outsider: Awaited<ReturnType<typeof signUp>>
let outsiderMeetingId: string
const reactables = {} as Record<ReactableType, Reactable>

beforeAll(async () => {
  ;[owner, outsider] = await Promise.all([signUp(), signUp()])
  const standup = await startStandup(owner.cookie, owner.teamId)
  reactables.RESPONSE = {
    meetingId: standup.meetingId,
    reactableId: await shareResponse(owner.cookie, standup.meetingId, standup.promptId)
  }
  reactables.COMMENT = {
    meetingId: standup.meetingId,
    reactableId: await addComment(owner.cookie, standup.meetingId)
  }
  reactables.REFLECTION = await createReflection(owner.cookie, owner.teamId)
  ;({meetingId: outsiderMeetingId} = await startStandup(outsider.cookie, outsider.teamId))
})

test.each(['COMMENT', 'REFLECTION', 'RESPONSE'] as const)(
  'a %s can only be reacted to through its own meeting',
  async (reactableType) => {
    const {meetingId, reactableId} = reactables[reactableType]

    const denied = await react(outsider.cookie, outsiderMeetingId, reactableId, reactableType)
    expect(denied.errors?.[0]?.message).toBe('Item does not exist')
    expect(await getReactjiCount(reactableId, reactableType)).toBe(0)

    const allowed = await react(owner.cookie, meetingId, reactableId, reactableType)
    expect(allowed.errors).toBeUndefined()
    expect(allowed.data.addReactjiToReactable.reactable.id).toBe(reactableId)
    expect(await getReactjiCount(reactableId, reactableType)).toBe(1)
  }
)
