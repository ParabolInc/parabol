import type {PokerMeetingMember} from '../../../postgres/types/Meeting'
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
  }
}

export default PokerMeeting
