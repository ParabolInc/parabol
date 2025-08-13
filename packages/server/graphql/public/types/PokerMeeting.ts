import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type {PokerMeetingMember} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import {PokerMeetingResolvers} from '../resolverTypes'

const PokerMeeting: PokerMeetingResolvers = {
  commentCount: ({commentCount}) => commentCount || 0,
  meetingMembers: async ({id: meetingId}, _args, {dataLoader}) => {
    return (await dataLoader
      .get('meetingMembersByMeetingId')
      .load(meetingId)) as PokerMeetingMember[]
  },
  storyCount: ({storyCount}) => storyCount || 0,
  story: async ({id: meetingId}, {storyId: taskId}, {dataLoader}) => {
    const task = await dataLoader.get('tasks').loadNonNull(taskId)
    if (task.meetingId !== meetingId) {
      Logger.log('naughty storyId supplied to PokerMeeting')
      return null
    }
    return task
  },

  viewerMeetingMember: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = (await dataLoader
      .get('meetingMembers')
      .loadNonNull(meetingMemberId)) as PokerMeetingMember
    return meetingMember as typeof meetingMember
  }
}

export default PokerMeeting
