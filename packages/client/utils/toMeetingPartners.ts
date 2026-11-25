import type {DirectoryPartner} from './inviteeDirectory'

type PartnerMeeting = {
  teamId: string
  meetingType: DirectoryPartner['meetingType']
  createdAt: string
  meetingMembers: readonly {user: {id: string}}[]
}

type PartnerTeam = {
  id: string
  teamMembers: readonly {user: {id: string}}[]
}

const toMeetingPartners = (
  viewerId: string,
  teams: readonly PartnerTeam[],
  meetings: readonly PartnerMeeting[]
): DirectoryPartner[] => {
  const memberIdsByTeamId = new Map(
    teams.map(({id, teamMembers}) => [id, new Set(teamMembers.map(({user}) => user.id))])
  )
  const partnerById = new Map<string, DirectoryPartner>()
  meetings.forEach(({teamId, meetingType, createdAt, meetingMembers}) => {
    const teamMemberIds = memberIdsByTeamId.get(teamId)
    if (!teamMemberIds) return
    const attendeeIds = meetingMembers.map(({user}) => user.id)
    if (!attendeeIds.includes(viewerId)) return
    attendeeIds.forEach((userId) => {
      if (userId === viewerId || !teamMemberIds.has(userId)) return
      const known = partnerById.get(userId)
      if (known && new Date(known.lastMetAt) >= new Date(createdAt)) return
      partnerById.set(userId, {userId, lastMetAt: createdAt, meetingType})
    })
  })
  return [...partnerById.values()].sort(
    (a, b) => new Date(b.lastMetAt).getTime() - new Date(a.lastMetAt).getTime()
  )
}

export default toMeetingPartners
