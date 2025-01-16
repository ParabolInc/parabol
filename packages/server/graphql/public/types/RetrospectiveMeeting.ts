import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {RetroMeetingMember} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import filterTasksByMeeting from '../../../utils/filterTasksByMeeting'
import getPhase from '../../../utils/getPhase'
import {resolveForSU} from '../../resolvers'
import {RetrospectiveMeetingResolvers} from '../resolverTypes'

const RetrospectiveMeeting: RetrospectiveMeetingResolvers = {
  autoGroupThreshold: resolveForSU('autoGroupThreshold'),
  commentCount: ({commentCount}) => commentCount || 0,
  disableAnonymity: ({disableAnonymity}) => disableAnonymity ?? false,
  meetingMembers: async ({id: meetingId}, _args, {dataLoader}) => {
    const res = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    return res as RetroMeetingMember[]
  },
  summary: ({summary}) => (summary === '<loading>' ? null : summary),
  isLoadingSummary: ({summary}) => summary === '<loading>',
  reflectionCount: ({reflectionCount}) => reflectionCount || 0,
  reflectionGroup: async ({id: meetingId}, {reflectionGroupId}, {dataLoader}) => {
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (reflectionGroup?.meetingId !== meetingId) return null
    return reflectionGroup
  },
  reflectionGroups: async ({id: meetingId}, {sortBy}, {dataLoader}) => {
    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    if (sortBy === 'voteCount') {
      reflectionGroups.sort((a, b) => (a.voterIds.length < b.voterIds.length ? 1 : -1))
      return reflectionGroups
    } else if (sortBy === 'stageOrder') {
      const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
      const {phases} = meeting
      const discussPhase = getPhase(phases, 'discuss')
      if (!discussPhase) return reflectionGroups
      const {stages} = discussPhase
      // for early terminations the stages may not exist
      const sortLookup = {} as {[reflectionGroupId: string]: number}
      reflectionGroups.forEach((group) => {
        const idx = stages.findIndex((stage) => stage.reflectionGroupId === group.id)
        sortLookup[group.id] = idx
      })
      reflectionGroups.sort((a, b) => {
        return sortLookup[a.id]! < sortLookup[b.id]! ? -1 : 1
      })
      return reflectionGroups
    }
    reflectionGroups.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
    return reflectionGroups
  },
  taskCount: ({taskCount}) => taskCount || 0,
  tasks: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {teamId} = meeting
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return filterTasksByMeeting(teamTasks, meetingId, viewerId)
  },
  topicCount: ({topicCount}) => topicCount || 0,
  votesRemaining: async ({id: meetingId}, _args, {dataLoader}) => {
    const meetingMembers = (await dataLoader
      .get('meetingMembersByMeetingId')
      .load(meetingId)) as RetroMeetingMember[]
    return meetingMembers.reduce((sum, member) => sum + member.votesRemaining, 0)
  },
  viewerMeetingMember: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = (await dataLoader
      .get('meetingMembers')
      .load(meetingMemberId)) as RetroMeetingMember
    return meetingMember || null
  }
}

export default RetrospectiveMeeting
