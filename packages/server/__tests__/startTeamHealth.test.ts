import {sendPublic, signUp} from './common'

const ADD_TEAM_HEALTH_TEMPLATE = `
  mutation AddTeamHealthTemplate($teamId: ID!, $parentTemplateId: ID) {
    addTeamHealthTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      teamHealthTemplate {
        id
      }
    }
  }
`

const START_TEAM_HEALTH = `
  mutation StartTeamHealth($teamIds: [ID!]!, $templateId: ID!) {
    startTeamHealth(teamIds: $teamIds, templateId: $templateId) {
      meetings {
        templateId
      }
    }
  }
`

const ACTIVE_MEETINGS = `
  query ActiveMeetings($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        activeMeetings {
          id
        }
      }
    }
  }
`

type Viewer = {teamId: string; cookie: string}

const cloneTeamHealthTemplate = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({
    query: ADD_TEAM_HEALTH_TEMPLATE,
    variables: {teamId, parentTemplateId: 'googleProjectAristotleTemplate'},
    cookie
  })
  return res.data.addTeamHealthTemplate.teamHealthTemplate.id as string
}

const startTeamHealth = ({teamId, cookie}: Viewer, templateId: string) =>
  sendPublic({query: START_TEAM_HEALTH, variables: {teamIds: [teamId], templateId}, cookie})

const getActiveMeetings = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({query: ACTIVE_MEETINGS, variables: {teamId}, cookie})
  return res.data.viewer.team.activeMeetings
}

test('a team health check cannot start from another organization’s template', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const templateId = await cloneTeamHealthTemplate(owner)

  const res = await startTeamHealth(outsider, templateId)

  expect(res.errors).toEqual([
    expect.objectContaining({
      message: 'Template is scoped to organization',
      extensions: expect.objectContaining({code: 'FORBIDDEN'})
    })
  ])
  expect(await getActiveMeetings(outsider)).toEqual([])
})

test('a team health check cannot start from a template of another meeting type', async () => {
  const viewer = await signUp()

  const res = await startTeamHealth(viewer, '360ReviewFeedbackOnDevelopmentTemplate')

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'NOT_FOUND'})})
  ])
  expect(await getActiveMeetings(viewer)).toEqual([])
})

test('a team health check starts from the team’s own template', async () => {
  const viewer = await signUp()
  const templateId = await cloneTeamHealthTemplate(viewer)

  const res = await startTeamHealth(viewer, templateId)

  expect(res).toEqual({data: {startTeamHealth: {meetings: [{templateId}]}}})
})
