import { CHECKIN } from 'parabol-client/utils/constants'
import shortid from 'shortid'

export const makeCheckInStage = (teamMember, meetingId, isFirstStage) => ({
  id: shortid.generate(),
  meetingId,
  isComplete: false,
  // may not always be true in the future!
  isNavigable: true,
  isNavigableByFacilitator: true,
  phaseType: CHECKIN,
  startAt: isFirstStage ? new Date() : undefined,
  teamMemberId: teamMember.id,
  viewCount: 0
})

const makeCheckinStages = async (teamId, meetingId, dataLoader, phaseIdx) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  return teamMembers
    .sort((a, b) => (a.checkInOrder > b.checkInOrder ? 1 : -1))
    .map((teamMember, idx) => makeCheckInStage(teamMember, meetingId, phaseIdx === 0 && idx === 0))
}

export default makeCheckinStages
