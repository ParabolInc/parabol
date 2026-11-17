import {sendPublic, signUp} from './common'

const START_RETROSPECTIVE = `
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
`

const ADD_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!) {
    addPromptTemplate(teamId: $teamId, type: retrospective) {
      template {
        prompts {
          id
        }
      }
    }
  }
`

const SET_PHASE_FOCUS = `
  mutation SetPhaseFocus($meetingId: ID!, $focusedPromptId: ID) {
    setPhaseFocus(meetingId: $meetingId, focusedPromptId: $focusedPromptId) {
      error {
        message
      }
      reflectPhase {
        focusedPrompt {
          id
        }
      }
    }
  }
`

type ReflectPrompts = {reflectPrompts?: {id: string}[]}

const startRetrospective = async (teamId: string, cookie: string) => {
  const res = await sendPublic({query: START_RETROSPECTIVE, variables: {teamId}, cookie})
  const {id: meetingId, phases} = res.data.startRetrospective.meeting
  const reflectPhase = (phases as ReflectPrompts[]).find((phase) => phase.reflectPrompts)!
  return {meetingId: meetingId as string, promptIds: reflectPhase.reflectPrompts!.map(({id}) => id)}
}

const setPhaseFocus = (meetingId: string, focusedPromptId: string | null, cookie: string) =>
  sendPublic({query: SET_PHASE_FOCUS, variables: {meetingId, focusedPromptId}, cookie})

test('a facilitator cannot focus a prompt from another team’s template', async () => {
  const [facilitator, owner] = await Promise.all([signUp(), signUp()])
  const [{meetingId}, ownerTemplate] = await Promise.all([
    startRetrospective(facilitator.teamId, facilitator.cookie),
    sendPublic({
      query: ADD_PROMPT_TEMPLATE,
      variables: {teamId: owner.teamId},
      cookie: owner.cookie
    })
  ])
  const foreignPromptId = ownerTemplate.data.addPromptTemplate.template.prompts[0].id

  const res = await setPhaseFocus(meetingId, foreignPromptId, facilitator.cookie)

  expect(res).toEqual({
    data: {setPhaseFocus: null},
    errors: [
      expect.objectContaining({extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})})
    ]
  })
})

test('a facilitator focuses and unfocuses one of the meeting’s own prompts', async () => {
  const facilitator = await signUp()
  const {meetingId, promptIds} = await startRetrospective(facilitator.teamId, facilitator.cookie)
  const promptId = promptIds[0]!

  const focused = await setPhaseFocus(meetingId, promptId, facilitator.cookie)
  expect(focused).toEqual({
    data: {setPhaseFocus: {error: null, reflectPhase: {focusedPrompt: {id: promptId}}}}
  })

  const unfocused = await setPhaseFocus(meetingId, null, facilitator.cookie)
  expect(unfocused).toEqual({
    data: {setPhaseFocus: {error: null, reflectPhase: {focusedPrompt: null}}}
  })
})
