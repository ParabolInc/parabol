import {randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const TEAM_BASICS = `
  query TeamBasics($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
        name
        tier
        isViewerOnTeam
        isViewerLead
        viewerTeamMember { id }
        teamLead { id }
        teamMembers { id }
      }
    }
  }
`

const TEAM_LAST_MEETING_TYPE = `
  query TeamLastMeetingType($teamId: ID!) {
    viewer {
      team(teamId: $teamId) { lastMeetingType }
    }
  }
`

const TEAM_MEETING_SETTINGS = `
  query TeamMeetingSettings($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        meetingSettings(meetingType: retrospective) { id }
      }
    }
  }
`

const addOrgUser = async (orgId: string, userId: string, role: 'BILLING_LEADER' | null) => {
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId, userId, role})
    .execute()
}

test('an org leader reads the basics of a team they are not on', async () => {
  const member = await signUp()
  const leader = await signUp()
  await addOrgUser(member.orgId, leader.userId, 'BILLING_LEADER')

  const res = await sendPublic({
    query: TEAM_BASICS,
    variables: {teamId: member.teamId},
    cookie: leader.cookie
  })
  expect(res.errors).toBeUndefined()
  const {team} = res.data.viewer
  expect(team.id).toBe(member.teamId)
  expect(team.name).toBeTruthy()
  expect(team.isViewerOnTeam).toBe(false)
  expect(team.isViewerLead).toBe(false)
  // the leader has no seat on the team, which is a null team member & not a lookup failure
  expect(team.viewerTeamMember).toBeNull()
  // administering the team means seeing who is on it
  expect(team.teamLead.id).toBeTruthy()
  expect(team.teamMembers).toHaveLength(1)
})

test.each([
  ['lastMeetingType', TEAM_LAST_MEETING_TYPE],
  ['meetingSettings', TEAM_MEETING_SETTINGS]
])('an org leader cannot read Team.%s of a team they are not on', async (_field, query) => {
  const member = await signUp()
  const leader = await signUp()
  await addOrgUser(member.orgId, leader.userId, 'BILLING_LEADER')

  const res = await sendPublic({
    query,
    variables: {teamId: member.teamId},
    cookie: leader.cookie
  })
  expect(res.errors).toBeTruthy()
  expect(res.data.viewer.team).toBeNull()
})

test.each([
  ['lastMeetingType', TEAM_LAST_MEETING_TYPE],
  ['meetingSettings', TEAM_MEETING_SETTINGS]
])('a team member still reads Team.%s', async (_field, query) => {
  const member = await signUp()

  const res = await sendPublic({
    query,
    variables: {teamId: member.teamId},
    cookie: member.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.team).toBeTruthy()
})
