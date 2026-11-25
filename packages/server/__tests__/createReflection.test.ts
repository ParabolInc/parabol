import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const startRetro = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!) {
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
    `,
    variables: {teamId},
    cookie
  })

  const meeting = res.data.startRetrospective.meeting
  const reflectPrompts = meeting.phases.find((p: any) => p.reflectPrompts).reflectPrompts

  return {
    meetingId: meeting.id,
    promptId: reflectPrompts[0].id as string,
    promptIds: reflectPrompts.map(({id}: {id: string}) => id) as string[]
  }
}

const CREATE_REFLECTION = `
  mutation CreateReflectionMutation($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      ... on CreateReflectionPayload {
        reflectionId
      }
    }
  }
`

const createReflection = (cookie: string, meetingId: string, promptId: string) =>
  sendPublic({
    query: CREATE_REFLECTION,
    variables: {input: {content: paragraph('Deploys are slow'), meetingId, promptId, sortOrder: 0}},
    cookie
  })

const expectNotThisMeetingsPrompt = (res: {
  errors?: {message: string; extensions: {code: string}}[]
}) => {
  expect(res).toEqual({
    data: null,
    errors: [
      expect.objectContaining({
        message: 'Prompt is not part of this meeting',
        extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})
      })
    ]
  })
}

const getStoredCards = async (meetingId: string) => {
  const [reflections, groups] = await Promise.all([
    getKysely()
      .selectFrom('RetroReflection')
      .select(['id', 'promptId'])
      .where('meetingId', '=', meetingId)
      .execute(),
    getKysely()
      .selectFrom('RetroReflectionGroup')
      .select(['id', 'promptId'])
      .where('meetingId', '=', meetingId)
      .execute()
  ])
  return {reflections, groups}
}

const ADD_RETRO_TEMPLATE = `
  mutation AddRetroTemplate($teamId: ID!) {
    addPromptTemplate(teamId: $teamId, type: retrospective) {
      template {
        id
        prompts {
          id
        }
      }
    }
  }
`

const ADD_TEMPLATE_PROMPT = `
  mutation AddTemplatePrompt($templateId: ID!) {
    addTemplatePrompt(templateId: $templateId) {
      prompt {
        id
      }
    }
  }
`

const REMOVE_TEMPLATE_PROMPT = `
  mutation RemoveTemplatePrompt($promptId: ID!) {
    removeTemplatePrompt(promptId: $promptId) {
      prompt {
        id
      }
    }
  }
`

const SELECT_TEMPLATE = `
  mutation SelectTemplate($selectedTemplateId: ID!, $teamId: ID!) {
    selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      meetingSettings {
        selectedTemplateId
      }
    }
  }
`

const UPDATE_MEETING_TEMPLATE = `
  mutation UpdateMeetingTemplate($meetingId: ID!, $templateId: ID!) {
    updateMeetingTemplate(meetingId: $meetingId, templateId: $templateId) {
      meeting {
        id
      }
    }
  }
`

const EDIT_REFLECTION = `
  mutation EditReflection($meetingId: ID!, $promptId: ID!, $isEditing: Boolean!) {
    editReflection(meetingId: $meetingId, promptId: $promptId, isEditing: $isEditing) {
      promptId
    }
  }
`

const editReflection = (cookie: string, meetingId: string, promptId: string) =>
  sendPublic({
    query: EDIT_REFLECTION,
    variables: {meetingId, promptId, isEditing: true},
    cookie
  })

const addRetroTemplate = async (teamId: string, cookie: string) => {
  const res = await sendPublic({query: ADD_RETRO_TEMPLATE, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.addPromptTemplate.template as {id: string; prompts: {id: string}[]}
}

const addTemplatePrompt = async (cookie: string, templateId: string) => {
  const res = await sendPublic({query: ADD_TEMPLATE_PROMPT, variables: {templateId}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.addTemplatePrompt.prompt.id as string
}

const getReflectionCount = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      query MeetingQuery($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              reflectionGroups {
                reflections {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {meetingId},
    cookie
  })

  const groups = res.data.viewer.meeting.reflectionGroups || []
  return groups.reduce((sum: number, group: any) => sum + group.reflections.length, 0)
}

test('createReflection blocks adding a reflection when viewer is not a member of the meeting', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])

  const {meetingId, promptId} = await startRetro(victim.teamId, victim.cookie)
  const beforeCount = await getReflectionCount(meetingId, victim.cookie)

  const createReflectionRes = await sendPublic({
    query: `
      mutation CreateReflectionMutation($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          ... on CreateReflectionPayload {
            reflectionId
          }
        }
      }
    `,
    variables: {
      input: {
        content: 'Unauthorized reflection attempt',
        meetingId,
        promptId,
        sortOrder: 0
      }
    },
    cookie: attacker.cookie
  })

  expect(createReflectionRes).toEqual({
    data: null,
    errors: [
      expect.objectContaining({
        message: expect.stringMatching('Viewer is not on team')
      })
    ]
  })

  const afterCount = await getReflectionCount(meetingId, victim.cookie)
  expect(afterCount).toBe(beforeCount)
})

test("createReflection files a card under one of the meeting's own prompts", async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId, promptIds} = await startRetro(teamId, cookie)
  expect(promptIds.length).toBeGreaterThan(1)

  for (const promptId of promptIds) {
    const res = await createReflection(cookie, meetingId, promptId)
    expect(res.errors).toBeUndefined()
  }

  const {reflections, groups} = await getStoredCards(meetingId)
  expect(reflections.map(({promptId}) => promptId).sort()).toEqual([...promptIds].sort())
  expect(groups.map(({promptId}) => promptId).sort()).toEqual([...promptIds].sort())
})

test("createReflection refuses another team's prompt and stores nothing", async () => {
  const [member, otherTeam] = await Promise.all([signUp(), signUp()])
  const {meetingId} = await startRetro(member.teamId, member.cookie)
  const foreignPromptId = await addRetroTemplate(otherTeam.teamId, otherTeam.cookie).then(
    ({prompts}) => prompts[0]!.id
  )

  const res = await createReflection(member.cookie, meetingId, foreignPromptId)

  expectNotThisMeetingsPrompt(res)
  const {reflections, groups} = await getStoredCards(meetingId)
  expect(reflections).toEqual([])
  expect(groups).toEqual([])
  expect(await getReflectionCount(meetingId, member.cookie)).toBe(0)
})

test("createReflection refuses a prompt from another template on the viewer's own team", async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId} = await startRetro(teamId, cookie)
  const {prompts} = await addRetroTemplate(teamId, cookie)

  const res = await createReflection(cookie, meetingId, prompts[0]!.id)

  expectNotThisMeetingsPrompt(res)
  const {reflections, groups} = await getStoredCards(meetingId)
  expect(reflections).toEqual([])
  expect(groups).toEqual([])
})

test('createReflection refuses a prompt id that does not exist', async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId} = await startRetro(teamId, cookie)

  const res = await createReflection(cookie, meetingId, 'noSuchPrompt')

  expectNotThisMeetingsPrompt(res)
  expect((await getStoredCards(meetingId)).reflections).toEqual([])
})

test('createReflection treats a prompt removed or added after the meeting started as the meeting does', async () => {
  const {teamId, cookie} = await signUp()
  const {id: templateId, prompts} = await addRetroTemplate(teamId, cookie)
  const [keptPromptId] = prompts.map(({id}) => id)
  const removedLaterPromptId = await addTemplatePrompt(cookie, templateId)
  const selected = await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {selectedTemplateId: templateId, teamId},
    cookie
  })
  expect(selected.errors).toBeUndefined()
  const {meetingId, promptIds} = await startRetro(teamId, cookie)
  expect(promptIds.sort()).toEqual([keptPromptId, removedLaterPromptId].sort())

  const removed = await sendPublic({
    query: REMOVE_TEMPLATE_PROMPT,
    variables: {promptId: removedLaterPromptId},
    cookie
  })
  expect(removed.errors).toBeUndefined()
  const addedLaterPromptId = await addTemplatePrompt(cookie, templateId)

  const intoRemoved = await createReflection(cookie, meetingId, removedLaterPromptId)
  expect(intoRemoved.errors).toBeUndefined()
  const intoAdded = await createReflection(cookie, meetingId, addedLaterPromptId)
  expectNotThisMeetingsPrompt(intoAdded)

  const {reflections} = await getStoredCards(meetingId)
  expect(reflections.map(({promptId}) => promptId)).toEqual([removedLaterPromptId])
})

test('createReflection follows a meeting switched to another template before any reflection', async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId, promptId: originalPromptId} = await startRetro(teamId, cookie)
  const {id: templateId, prompts} = await addRetroTemplate(teamId, cookie)
  const switchedPromptId = prompts[0]!.id

  const switched = await sendPublic({
    query: UPDATE_MEETING_TEMPLATE,
    variables: {meetingId, templateId},
    cookie
  })
  expect(switched.errors).toBeUndefined()

  const intoOriginal = await createReflection(cookie, meetingId, originalPromptId)
  expectNotThisMeetingsPrompt(intoOriginal)
  expect((await getStoredCards(meetingId)).reflections).toEqual([])

  const intoSwitched = await createReflection(cookie, meetingId, switchedPromptId)
  expect(intoSwitched.errors).toBeUndefined()
  const {reflections} = await getStoredCards(meetingId)
  expect(reflections.map(({promptId}) => promptId)).toEqual([switchedPromptId])
})

test("editReflection signals editing in one of the meeting's own prompts", async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId, promptId} = await startRetro(teamId, cookie)

  const res = await editReflection(cookie, meetingId, promptId)

  expect(res.errors).toBeUndefined()
  expect(res.data.editReflection.promptId).toBe(promptId)
})

test("editReflection refuses a prompt from another template on the viewer's own team", async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId} = await startRetro(teamId, cookie)
  const {prompts} = await addRetroTemplate(teamId, cookie)

  const res = await editReflection(cookie, meetingId, prompts[0]!.id)

  expectNotThisMeetingsPrompt(res)
})

test('editReflection refuses a prompt id that does not exist', async () => {
  const {teamId, cookie} = await signUp()
  const {meetingId} = await startRetro(teamId, cookie)

  const res = await editReflection(cookie, meetingId, 'noSuchPrompt')

  expectNotThisMeetingsPrompt(res)
})
