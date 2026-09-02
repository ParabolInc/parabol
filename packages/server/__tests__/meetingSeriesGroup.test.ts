import {randomUUIDv7} from 'crypto'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import AuthToken from '../database/types/AuthToken'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

// The JWT freezes the viewer's team ids at login, so a membership these tests add by SQL is
// invisible to isTeamMember until the token is reissued. Mint one from the current rows.
const authTokenFor = async (userId: string) => {
  const teamMembers = await getKysely()
    .selectFrom('TeamMember')
    .select('teamId')
    .where('userId', '=', userId)
    .where('isNotRemoved', '=', true)
    .execute()
  return encodeAuthToken(new AuthToken({sub: userId, tms: teamMembers.map(({teamId}) => teamId)}))
}

const UPDATE_MEETING_SERIES = `
  mutation UpdateMeetingSeries($meetingSeriesId: ID!, $name: String, $rrule: RRule) {
    updateMeetingSeries(meetingSeriesId: $meetingSeriesId, name: $name, rrule: $rrule) {
      ... on ErrorPayload {
        error { message }
      }
      ... on UpdateMeetingSeriesSuccess {
        meetingSeriesId
      }
    }
  }
`

const RRULE = `DTSTART;TZID=America/Toronto:20260520T070000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`

const NEW_RRULE = `DTSTART;TZID=America/Toronto:20260520T160000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`

// Adds a second team in the viewer's org so a series group can span more than one of them
const addTeam = async (orgId: string, userId: string, isLead: boolean) => {
  const pg = getKysely()
  const teamId = randomUUIDv7()
  await pg
    .insertInto('Team')
    .values({id: teamId, name: `Team ${teamId}`, orgId})
    .execute()
  await pg
    .insertInto('TeamMember')
    .values({id: TeamMemberId.join(teamId, userId), teamId, userId, isLead})
    .execute()
  return teamId
}

const createGroupedSeries = async (
  teamIds: string[],
  facilitatorId: string,
  ownerUserId: string
) => {
  const pg = getKysely()
  const groupId = randomUUIDv7()
  const rows = await pg
    .insertInto('MeetingSeries')
    .values(
      teamIds.map((teamId) => ({
        meetingType: 'teamHealth' as const,
        title: 'Weekly Health',
        recurrenceRule: RRULE,
        duration: 24 * 60,
        teamId,
        facilitatorId,
        groupId,
        ownerUserId
      }))
    )
    .returning(['id', 'teamId'])
    .execute()
  return {groupId, rows}
}

test('renaming one series of a group renames every sibling', async () => {
  const pg = getKysely()
  const {userId, teamId, orgId} = await signUp()
  const secondTeamId = await addTeam(orgId, userId, true)
  const {rows} = await createGroupedSeries([teamId, secondTeamId], userId, userId)

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: MeetingSeriesId.join(rows[0]!.id),
      name: 'Renamed Health',
      rrule: NEW_RRULE
    },
    bearerToken: await authTokenFor(userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select(['id', 'title', 'recurrenceRule'])
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()

  // the sibling was never named in the request, but it is the same schedule
  expect(after).toHaveLength(2)
  for (const series of after) {
    expect(series.title).toBe('Renamed Health')
    expect(series.recurrenceRule).toMatch(/T160000/)
  }
})

test('cancelling a series group cancels every team on it', async () => {
  const pg = getKysely()
  const {userId, teamId, orgId} = await signUp()
  const secondTeamId = await addTeam(orgId, userId, true)
  const {rows} = await createGroupedSeries([teamId, secondTeamId], userId, userId)

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(rows[0]!.id), rrule: null},
    bearerToken: await authTokenFor(userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select(['id', 'cancelledAt'])
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()

  expect(after).toHaveLength(2)
  for (const series of after) {
    expect(series.cancelledAt).not.toBeNull()
  }
})

test('a team member who does not own the series cannot change it', async () => {
  const pg = getKysely()
  const owner = await signUp()
  // a second member of the owner's team: on the team, but not the owner of the series
  const participant = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, participant.userId),
      teamId: owner.teamId,
      userId: participant.userId,
      isLead: false
    })
    .execute()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(rows[0]!.id), name: 'Hijacked'},
    bearerToken: await authTokenFor(participant.userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeTruthy()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select('title')
    .where('id', '=', rows[0]!.id)
    .executeTakeFirstOrThrow()
  expect(after.title).toBe('Weekly Health')
})

test('a series with no owner is still administered by anyone on its team', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const participant = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, participant.userId),
      teamId: owner.teamId,
      userId: participant.userId,
      isLead: false
    })
    .execute()
  const meetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Standup',
      recurrenceRule: RRULE,
      duration: 24 * 60,
      teamId: owner.teamId,
      facilitatorId: owner.userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: MeetingSeriesId.join(meetingSeries.id),
      name: 'Renamed Standup',
      rrule: NEW_RRULE
    },
    bearerToken: await authTokenFor(participant.userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select('title')
    .where('id', '=', meetingSeries.id)
    .executeTakeFirstOrThrow()
  expect(after.title).toBe('Renamed Standup')
})

const VIEWER_MEETING_SERIES = `
  query ViewerMeetingSeries($meetingSeriesId: ID!) {
    viewer {
      meetingSeries(meetingSeriesId: $meetingSeriesId) {
        id
        title
      }
    }
  }
`

// Reading is deliberately wider than administering: an owner-run series is still visible to the
// teams it recurs for. Substituting canAdminMeetingSeries here would hide it from them.
test('a team member can read an owner-run series for their team', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const participant = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, participant.userId),
      teamId: owner.teamId,
      userId: participant.userId,
      isLead: false
    })
    .execute()
  // single team, so no groupId: the org-leader-schedules-for-a-team-they-are-not-on case
  const meetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamHealth',
      title: 'Owner Run Health',
      recurrenceRule: RRULE,
      duration: 24 * 60,
      teamId: owner.teamId,
      facilitatorId: owner.userId,
      ownerUserId: owner.userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const res = await sendPublic({
    query: VIEWER_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(meetingSeries.id)},
    bearerToken: await authTokenFor(participant.userId)
  })
  expect(res.data.viewer.meetingSeries).toMatchObject({title: 'Owner Run Health'})
})

test('a user on no team of the group cannot read the series', async () => {
  const owner = await signUp()
  const outsider = await signUp()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)

  const res = await sendPublic({
    query: VIEWER_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(rows[0]!.id)},
    bearerToken: await authTokenFor(outsider.userId)
  })
  expect(res.data.viewer.meetingSeries).toBeNull()
})

// Sharing a groupId is not an access grant. A sibling series has its own team, its own meetings,
// and its own mostRecentMeeting, so reading it has to be earned on that team.
test('a member of one team in a group cannot read a sibling team series', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const secondTeamMember = await signUp()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(secondTeamId, secondTeamMember.userId),
      teamId: secondTeamId,
      userId: secondTeamMember.userId,
      isLead: false
    })
    .execute()
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)
  const firstTeamSeries = rows.find(({teamId}) => teamId === owner.teamId)!
  const ownTeamSeries = rows.find(({teamId}) => teamId === secondTeamId)!

  const foreign = await sendPublic({
    query: VIEWER_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(firstTeamSeries.id)},
    bearerToken: await authTokenFor(secondTeamMember.userId)
  })
  expect(foreign.data.viewer.meetingSeries).toBeNull()

  // their own team's series in the same group stays readable
  const own = await sendPublic({
    query: VIEWER_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(ownTeamSeries.id)},
    bearerToken: await authTokenFor(secondTeamMember.userId)
  })
  expect(own.data.viewer.meetingSeries).toMatchObject({title: 'Weekly Health'})
})

const addOrgUser = async (orgId: string, userId: string, role: 'BILLING_LEADER' | null) => {
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId, userId, role})
    .execute()
}

const departFromOrg = async (orgId: string, userId: string) => {
  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', orgId)
    .where('userId', '=', userId)
    .execute()
}

const REMOVE_ORG_USERS = `
  mutation RemoveOrgUsers($userIds: [ID!]!, $orgId: ID!) {
    removeOrgUsers(userIds: $userIds, orgId: $orgId) {
      ... on ErrorPayload {
        error { message }
      }
      ... on RemoveOrgUsersSuccess {
        removedUserIds
      }
    }
  }
`

// The owner is a person, and people leave. Handing the series to the org on the way out keeps the
// owner rung filled, so a later hard delete cannot null it & make the series look unowned.
test('leaving the org hands an owned series to a billing leader', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const successor = await signUp()
  await addOrgUser(owner.orgId, successor.userId, 'BILLING_LEADER')
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)

  const res = await sendPublic({
    query: REMOVE_ORG_USERS,
    variables: {userIds: [owner.userId], orgId: owner.orgId},
    bearerToken: await authTokenFor(owner.userId)
  })
  expect(res.data.removeOrgUsers.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select(['id', 'ownerUserId'])
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()

  // every sibling moves together, so no team of the group is left with a stale owner
  expect(after).toHaveLength(2)
  for (const series of after) {
    expect(series.ownerUserId).toBe(successor.userId)
  }
})

// Authority must never be pinned to one person: an owner who leaves the company would otherwise
// take the whole group with them, since the writes fan out over every sibling series.
test('a departed owner does not strand the group, a billing leader can still manage it', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const successor = await signUp()
  await addOrgUser(owner.orgId, successor.userId, 'BILLING_LEADER')
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)

  await departFromOrg(owner.orgId, owner.userId)

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: MeetingSeriesId.join(rows[0]!.id),
      name: 'Renamed by successor',
      rrule: NEW_RRULE
    },
    bearerToken: await authTokenFor(successor.userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select('title')
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()
  expect(after).toHaveLength(2)
  for (const series of after) {
    expect(series.title).toBe('Renamed by successor')
  }
})

test('a departed owner does not hand the group to a member of one of its teams', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const teamMember = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, teamMember.userId),
      teamId: owner.teamId,
      userId: teamMember.userId,
      isLead: false
    })
    .execute()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)

  await departFromOrg(owner.orgId, owner.userId)

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(rows[0]!.id), name: 'Hijacked'},
    bearerToken: await authTokenFor(teamMember.userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeTruthy()
})

// A hard-deleted owner nulls ownerUserId via ON DELETE SET NULL. Team membership must still not
// grant authority over the group, or one team could rename or cancel every other team's series.
test('an ownerless group is not administered by a member of one of its teams', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const teamMember = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, teamMember.userId),
      teamId: owner.teamId,
      userId: teamMember.userId,
      isLead: false
    })
    .execute()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)
  // as ON DELETE SET NULL would leave it
  await pg
    .updateTable('MeetingSeries')
    .set({ownerUserId: null})
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()

  const res = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(rows[0]!.id), name: 'Hijacked'},
    bearerToken: await authTokenFor(teamMember.userId)
  })
  expect(res.data.updateMeetingSeries.error).toBeTruthy()
})

// A series scheduled as a group stays a group for life. Handing the last survivor back to its
// team would mean a hard-deleted owner quietly widens who may administer it.
test('the last live series of a group is administered by the org, not its team', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const teamMember = await signUp()
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(owner.teamId, teamMember.userId),
      teamId: owner.teamId,
      userId: teamMember.userId,
      isLead: false
    })
    .execute()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)
  const ownTeamSeries = rows.find(({teamId}) => teamId === owner.teamId)!
  const siblingSeries = rows.find(({teamId}) => teamId === secondTeamId)!

  // the owner deleted their account & the sibling team was archived, so only this team is left
  await pg
    .updateTable('MeetingSeries')
    .set({ownerUserId: null})
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()
  await pg
    .updateTable('MeetingSeries')
    .set({cancelledAt: new Date()})
    .where('id', '=', siblingSeries.id)
    .execute()

  const memberRes = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {meetingSeriesId: MeetingSeriesId.join(ownTeamSeries.id), name: 'Ours Now'},
    bearerToken: await authTokenFor(teamMember.userId)
  })
  expect(memberRes.data.updateMeetingSeries.error).toBeTruthy()

  // the org's billing leader still administers it, so it is never stranded
  const leaderRes = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: MeetingSeriesId.join(ownTeamSeries.id),
      name: 'Org Ran It',
      rrule: NEW_RRULE
    },
    bearerToken: await authTokenFor(owner.userId)
  })
  expect(leaderRes.data.updateMeetingSeries.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select('title')
    .where('id', '=', ownTeamSeries.id)
    .executeTakeFirstOrThrow()
  expect(after.title).toBe('Org Ran It')
})

const UPDATE_RECURRENCE_SETTINGS = `
  mutation UpdateRecurrenceSettings($meetingId: ID!, $name: String, $rrule: RRule) {
    updateRecurrenceSettings(meetingId: $meetingId, name: $name, rrule: $rrule) {
      ... on ErrorPayload {
        error { message }
      }
      ... on UpdateRecurrenceSettingsSuccess {
        meeting { id }
      }
    }
  }
`

// Both mutations resolve to one applySeriesRecurrence, so addressing the group by meeting has to
// fan out over the siblings exactly as addressing it by series id does.
test('updateRecurrenceSettings fans out over the group like updateMeetingSeries', async () => {
  const pg = getKysely()
  const {userId, teamId, orgId} = await signUp()
  const secondTeamId = await addTeam(orgId, userId, true)
  const {rows} = await createGroupedSeries([teamId, secondTeamId], userId, userId)
  const ownTeamSeries = rows.find((row) => row.teamId === teamId)!

  const meetingId = randomUUIDv7()
  const phase = new TeamPromptResponsesPhase([TeamMemberId.join(teamId, userId)])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      name: 'Weekly Health #1',
      meetingType: 'teamHealth',
      facilitatorStageId: phase.stages[0]?.id,
      meetingSeriesId: ownTeamSeries.id
    })
    .execute()

  const res = await sendPublic({
    query: UPDATE_RECURRENCE_SETTINGS,
    variables: {meetingId, name: 'Renamed By Meeting', rrule: NEW_RRULE},
    bearerToken: await authTokenFor(userId)
  })
  expect(res.data.updateRecurrenceSettings.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select(['title', 'recurrenceRule'])
    .where(
      'id',
      'in',
      rows.map(({id}) => id)
    )
    .execute()
  expect(after).toHaveLength(2)
  for (const series of after) {
    expect(series.title).toBe('Renamed By Meeting')
    expect(series.recurrenceRule).toMatch(/T160000/)
  }
})

const VIEWER_SERIES_WITH_MEETINGS = `
  query ViewerSeriesWithMeetings($meetingSeriesId: ID!) {
    viewer {
      meetingSeries(meetingSeriesId: $meetingSeriesId) {
        id
        title
        urlSlug
        activeMeetings {
          id
          teamId
        }
      }
    }
  }
`

// Each team gets its own calendar invite naming its own series, so an invitee who is only on the
// second team follows a link to the second team's series & everything resolves for them.
test('an invitee on only the second team resolves that team series link', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const invitee = await signUp()
  const secondTeamId = await addTeam(owner.orgId, owner.userId, true)
  await pg
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(secondTeamId, invitee.userId),
      teamId: secondTeamId,
      userId: invitee.userId,
      isLead: false
    })
    .execute()
  const {rows} = await createGroupedSeries([owner.teamId, secondTeamId], owner.userId, owner.userId)
  const secondTeamSeries = rows.find((row) => row.teamId === secondTeamId)!
  const firstTeamSeries = rows.find((row) => row.teamId === owner.teamId)!

  const meetingId = randomUUIDv7()
  const phase = new TeamPromptResponsesPhase([TeamMemberId.join(secondTeamId, invitee.userId)])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId: secondTeamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: invitee.userId,
      name: 'Weekly Health #1',
      meetingType: 'teamHealth',
      facilitatorStageId: phase.stages[0]?.id,
      meetingSeriesId: secondTeamSeries.id
    })
    .execute()

  const res = await sendPublic({
    query: VIEWER_SERIES_WITH_MEETINGS,
    variables: {meetingSeriesId: MeetingSeriesId.join(secondTeamSeries.id)},
    bearerToken: await authTokenFor(invitee.userId)
  })
  expect(res.errors).toBeUndefined()
  const series = res.data.viewer.meetingSeries
  expect(series).toMatchObject({title: 'Weekly Health'})
  expect(series.urlSlug).toEqual(expect.any(String))
  // only their own team's meeting comes back, never the sibling team's
  expect(series.activeMeetings).toEqual([{id: meetingId, teamId: secondTeamId}])

  // and the first team's series stays out of reach, so the link has to be the per-team one
  const foreign = await sendPublic({
    query: VIEWER_SERIES_WITH_MEETINGS,
    variables: {meetingSeriesId: MeetingSeriesId.join(firstTeamSeries.id)},
    bearerToken: await authTokenFor(invitee.userId)
  })
  expect(foreign.data.viewer.meetingSeries).toBeNull()
})
