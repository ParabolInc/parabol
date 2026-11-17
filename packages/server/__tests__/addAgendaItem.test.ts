import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {sendPublic, signUp} from './common'

const START_CHECK_IN = `
  mutation StartCheckIn($teamId: ID!) {
    startCheckIn(teamId: $teamId) {
      ... on StartCheckInSuccess {
        meeting {
          id
        }
      }
    }
  }
`

const ADD_AGENDA_ITEM = `
  mutation AddAgendaItem($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
      error {
        message
      }
      agendaItem {
        meetingId
        teamMember {
          userId
        }
      }
    }
  }
`

const MEETING_AGENDA_ITEMS = `
  query MeetingAgendaItems($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on ActionMeeting {
          agendaItems {
            content
          }
        }
      }
    }
  }
`

const startCheckIn = async (teamId: string, cookie: string) => {
  const res = await sendPublic({query: START_CHECK_IN, variables: {teamId}, cookie})
  return res.data.startCheckIn.meeting.id as string
}

const addAgendaItem = (
  viewer: {teamId: string; userId: string; cookie: string},
  overrides: {meetingId?: string; teamMemberId?: string}
) =>
  sendPublic({
    query: ADD_AGENDA_ITEM,
    variables: {
      newAgendaItem: {
        content: 'Hiring plan',
        pinned: false,
        teamId: viewer.teamId,
        teamMemberId: TeamMemberId.join(viewer.teamId, viewer.userId),
        ...overrides
      }
    },
    cookie: viewer.cookie
  })

const getAgendaItems = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: MEETING_AGENDA_ITEMS, variables: {meetingId}, cookie})
  return res.data.viewer.meeting.agendaItems
}

test('an agenda item cannot be attached to another team’s meeting', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const meetingId = await startCheckIn(owner.teamId, owner.cookie)

  const res = await addAgendaItem(outsider, {meetingId})

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})})
  ])
  expect(await getAgendaItems(meetingId, owner.cookie)).toEqual([])
})

test('an agenda item cannot be attributed to a member of another team', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])

  const res = await addAgendaItem(outsider, {
    teamMemberId: TeamMemberId.join(owner.teamId, owner.userId)
  })

  expect(res.errors).toEqual([
    expect.objectContaining({extensions: expect.objectContaining({code: 'BAD_USER_INPUT'})})
  ])
  expect(res.data.addAgendaItem).toBeNull()
})

test('a team member adds an agenda item to their own check-in', async () => {
  const owner = await signUp()
  const meetingId = await startCheckIn(owner.teamId, owner.cookie)

  const res = await addAgendaItem(owner, {meetingId})

  expect(res.errors).toBeUndefined()
  expect(res.data.addAgendaItem).toEqual({
    error: null,
    agendaItem: {meetingId, teamMember: {userId: owner.userId}}
  })
  expect(await getAgendaItems(meetingId, owner.cookie)).toEqual([{content: 'Hiring plan'}])
})

test('a team member queues an agenda item before any meeting starts', async () => {
  const owner = await signUp()

  const res = await addAgendaItem(owner, {})

  expect(res.errors).toBeUndefined()
  expect(res.data.addAgendaItem).toEqual({
    error: null,
    agendaItem: {meetingId: null, teamMember: {userId: owner.userId}}
  })
})
