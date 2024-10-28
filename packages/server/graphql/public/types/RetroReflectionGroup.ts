import {Selectable} from 'kysely'
import {RetroReflectionGroup as TRetroReflectionGroup} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {RetroReflectionGroupResolvers} from '../resolverTypes'

export interface RetroReflectionGroupSource extends Selectable<TRetroReflectionGroup> {}

const RetroReflectionGroup: RetroReflectionGroupResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const retroMeeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (retroMeeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return retroMeeting
  },
  prompt: ({promptId}, _args, {dataLoader}) => {
    return dataLoader.get('reflectPrompts').loadNonNull(promptId)
  },
  reflections: async ({id: reflectionGroupId, meetingId}, _args, {dataLoader}) => {
    // use meetingId so we only hit the DB once instead of once per group
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    const filteredReflections = reflections.filter(
      (reflection) => reflection.reflectionGroupId === reflectionGroupId
    )
    filteredReflections.sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
    return filteredReflections
  },
  team: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return dataLoader.get('teams').loadNonNull(meeting.teamId)
  },
  titleIsUserDefined: ({title, smartTitle}) => {
    return title ? title !== smartTitle : false
  },
  voteCount: ({voterIds}) => {
    return voterIds ? voterIds.length : 0
  },
  viewerVoteCount: ({voterIds}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return voterIds
      ? voterIds.reduce((sum, voterId) => (voterId === viewerId ? sum + 1 : sum), 0)
      : 0
  }
}

export default RetroReflectionGroup
