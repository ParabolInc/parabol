import {sql} from 'kysely'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

type Auth = {cookie: string}
type ReactableType = 'COMMENT' | 'REFLECTION' | 'RESPONSE'

const DOC = JSON.stringify({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text: 'Only for this meeting'}]}]
})

const startStandup = async ({cookie}: Auth, teamId: string) => {
  const started = await sendPublic({
    query: `
      mutation StartStandup($teamId: ID!) {
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
      mutation Join($meetingId: ID!) {
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
  return {meetingId, promptId: prompts[0].id as string}
}

const createResponse = async ({cookie}: Auth, meetingId: string, promptId: string) => {
  const upserted = await sendPublic({
    query: `
      mutation Upsert($meetingId: ID!, $promptId: ID!, $content: String!) {
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
      mutation Share($meetingId: ID!) {
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

const createComment = async ({cookie}: Auth, meetingId: string) => {
  const {discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id as discussionId')
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

const createReflection = async ({cookie}: Auth, teamId: string) => {
  const started = await sendPublic({
    query: `
      mutation StartRetro($teamId: ID!) {
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
  const {reflectPrompts} = phases.find((phase: any) => phase.reflectPrompts)
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
    variables: {input: {content: DOC, meetingId, promptId: reflectPrompts[0].id, sortOrder: 0}},
    cookie
  })
  return {meetingId: meetingId as string, reflectionId: created.data.createReflection.reflectionId}
}

const react = ({cookie}: Auth, meetingId: string, reactableId: string, type: ReactableType) =>
  sendPublic({
    query: `
      mutation React($meetingId: ID!, $reactableId: ID!, $reactableType: ReactableEnum!) {
        addReactjiToReactable(
          meetingId: $meetingId
          reactableId: $reactableId
          reactableType: $reactableType
          reactji: "heart"
        ) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on AddReactjiToReactableSuccess {
            reactable {
              id
            }
          }
        }
      }
    `,
    variables: {meetingId, reactableId, reactableType: type},
    cookie
  })

const getReactjiCount = async (reactableId: string, type: ReactableType) => {
  const pg = getKysely()
  const count = sql<number>`cardinality("reactjis")`.as('count')
  const row =
    type === 'RESPONSE'
      ? await pg
          .selectFrom('TeamPromptResponse')
          .select(count)
          .where('id', '=', TeamPromptResponseId.split(reactableId))
          .executeTakeFirstOrThrow()
      : await pg
          .selectFrom(type === 'COMMENT' ? 'Comment' : 'RetroReflection')
          .select(count)
          .where('id', '=', reactableId)
          .executeTakeFirstOrThrow()
  return row.count
}

const setUpReactables = async () => {
  const [owner, outsider] = await Promise.all([signUp(), signUp()])
  const standup = await startStandup(owner, owner.teamId)
  const outsiderStandup = await startStandup(outsider, outsider.teamId)
  const retro = await createReflection(owner, owner.teamId)
  const reactables: Record<ReactableType, {meetingId: string; reactableId: string}> = {
    RESPONSE: {
      meetingId: standup.meetingId,
      reactableId: await createResponse(owner, standup.meetingId, standup.promptId)
    },
    COMMENT: {
      meetingId: standup.meetingId,
      reactableId: await createComment(owner, standup.meetingId)
    },
    REFLECTION: {meetingId: retro.meetingId, reactableId: retro.reflectionId}
  }
  return {owner, outsider, outsiderMeetingId: outsiderStandup.meetingId, reactables}
}

const TYPES: ReactableType[] = ['COMMENT', 'REFLECTION', 'RESPONSE']

test.each(TYPES)('a member of the meeting can react to its %s', async (type) => {
  const {owner, reactables} = await setUpReactables()
  const {meetingId, reactableId} = reactables[type]

  const res = await react(owner, meetingId, reactableId, type)

  expect(res.errors).toBeUndefined()
  expect(res.data.addReactjiToReactable.error).toBeUndefined()
  expect(res.data.addReactjiToReactable.reactable.id).toBe(reactableId)
  expect(await getReactjiCount(reactableId, type)).toBe(1)
})

test.each(TYPES)('a %s cannot be reacted to through another meeting', async (type) => {
  const {outsider, outsiderMeetingId, reactables} = await setUpReactables()
  const {reactableId} = reactables[type]

  const res = await react(outsider, outsiderMeetingId, reactableId, type)

  expect(res.errors).toBeUndefined()
  expect(res.data.addReactjiToReactable.error.message).toBe('Item does not exist')
  expect(res.data.addReactjiToReactable.reactable).toBeUndefined()
  expect(await getReactjiCount(reactableId, type)).toBe(0)
})
