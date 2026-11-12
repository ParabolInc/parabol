import {sendPublic, signUp} from './common'

const START_RETROSPECTIVE = `
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

const ADD_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!) {
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

const UPDATE_MEETING_TEMPLATE = `
  mutation UpdateMeetingTemplate($meetingId: ID!, $templateId: ID!) {
    updateMeetingTemplate(meetingId: $meetingId, templateId: $templateId) {
      meeting {
        ... on RetrospectiveMeeting {
          templateId
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

const MEETING_TEMPLATE = `
  query MeetingTemplate($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on RetrospectiveMeeting {
          templateId
        }
      }
    }
  }
`

type Viewer = {teamId: string; cookie: string}

const startRetrospective = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({query: START_RETROSPECTIVE, variables: {teamId}, cookie})
  return res.data.startRetrospective.meeting.id as string
}

const addPromptTemplate = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({query: ADD_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  const {id, prompts} = res.data.addPromptTemplate.template
  return {templateId: id as string, promptIds: (prompts as {id: string}[]).map(({id}) => id)}
}

const updateMeetingTemplate = (meetingId: string, templateId: string, cookie: string) =>
  sendPublic({query: UPDATE_MEETING_TEMPLATE, variables: {meetingId, templateId}, cookie})

const unavailableTemplateError = expect.objectContaining({
  message: 'That template is not available to this team',
  extensions: expect.objectContaining({code: 'NOT_FOUND'})
})

const getMeetingTemplateId = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: MEETING_TEMPLATE, variables: {meetingId}, cookie})
  return res.data.viewer.meeting.templateId as string
}

test('a meeting cannot switch to another organization’s template', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const [meetingId, {templateId}] = await Promise.all([
    startRetrospective(outsider),
    addPromptTemplate(owner)
  ])
  const templateIdBefore = await getMeetingTemplateId(meetingId, outsider.cookie)

  const res = await updateMeetingTemplate(meetingId, templateId, outsider.cookie)

  expect(res.errors).toEqual([unavailableTemplateError])
  expect(await getMeetingTemplateId(meetingId, outsider.cookie)).toBe(templateIdBefore)
})

test('a meeting cannot switch to a template of another meeting type', async () => {
  const viewer = await signUp()
  const meetingId = await startRetrospective(viewer)

  const res = await updateMeetingTemplate(meetingId, 'estimatedEffortTemplate', viewer.cookie)

  expect(res.errors).toEqual([unavailableTemplateError])
})

test('a meeting switches to a public template and to the team’s own template', async () => {
  const viewer = await signUp()
  const {templateId, promptIds} = await addPromptTemplate(viewer)
  const meetingId = await startRetrospective(viewer)

  const toPublic = await updateMeetingTemplate(
    meetingId,
    '360ReviewFeedbackOnDevelopmentTemplate',
    viewer.cookie
  )
  expect(toPublic.errors).toBeUndefined()
  expect(toPublic.data.updateMeetingTemplate.meeting.templateId).toBe(
    '360ReviewFeedbackOnDevelopmentTemplate'
  )

  const toOwn = await updateMeetingTemplate(meetingId, templateId, viewer.cookie)
  expect(toOwn.errors).toBeUndefined()
  const {meeting} = toOwn.data.updateMeetingTemplate
  expect(meeting.templateId).toBe(templateId)
  const reflectPhase = (meeting.phases as {reflectPrompts?: {id: string}[]}[]).find(
    (phase) => phase.reflectPrompts
  )!
  expect(reflectPhase.reflectPrompts).toEqual(promptIds.map((id) => ({id})))
})
