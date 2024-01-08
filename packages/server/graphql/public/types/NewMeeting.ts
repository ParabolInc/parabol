import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {getUserId} from '../../../utils/authorization'
import isMeetingLocked from '../../types/helpers/isMeetingLocked'
import {NewMeetingResolvers} from '../resolverTypes'

const NewMeeting: NewMeetingResolvers = {
  __resolveType: ({meetingType}) => {
    const resolveTypeLookup = {
      retrospective: 'RetrospectiveMeeting',
      action: 'ActionMeeting',
      poker: 'PokerMeeting',
      teamPrompt: 'TeamPromptMeeting'
    } as const
    return resolveTypeLookup[meetingType as keyof typeof resolveTypeLookup]
  },
  createdByUser: ({createdBy}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(createdBy)
  },
  facilitator: ({facilitatorUserId, teamId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, facilitatorUserId)
    return dataLoader.get('teamMembers').load(teamMemberId)
  },
  locked: async ({endedAt, teamId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return isMeetingLocked(viewerId, teamId, endedAt, dataLoader)
  },

  meetingMembers: ({id: meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  },
  organization: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader.get('organizations').load(orgId)
  },
  phases: async ({phases, id: meetingId, teamId, endedAt}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const locked = await isMeetingLocked(viewerId, teamId, endedAt, dataLoader)

    const resolvedPhases = phases.map((phase: any) => ({
      ...phase,
      meetingId,
      teamId
    }))

    if (locked) {
      // make all stages non-navigable so even if the user removes the overlay they cannot see all meeting data
      return resolvedPhases.map((phase: any) => ({
        ...phase,
        stages: phase.stages.map((stage: any) => ({
          ...stage,
          isNavigable: false,
          isNavigableByFacilitator: false
        }))
      }))
    }
    return resolvedPhases
  },
  showConversionModal: ({showConversionModal}) => !!showConversionModal,
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  viewerMeetingMember: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    return meetingMember || null
  }
}

export default NewMeeting
