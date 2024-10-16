import isTaskPrivate from '../../../../client/utils/isTaskPrivate'
import {RetrospectiveMeetingMemberResolvers} from '../resolverTypes'

const RetrospectiveMeetingMember: RetrospectiveMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'retrospective',
  tasks: async ({meetingId, userId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {teamId} = meeting
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return teamTasks.filter((task) => {
      if (task.meetingId !== meetingId) return false
      if (task.userId !== userId) return false
      if (isTaskPrivate(task.tags)) return false
      return true
    })
  }
}

export default RetrospectiveMeetingMember
