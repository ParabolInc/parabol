import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import {ActionMeetingMemberResolvers} from '../resolverTypes'

const ActionMeetingMember: ActionMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'action',
  doneTasks: async ({meetingId, userId}) => {
    const r = await getRethink()
    return r
      .table('Task')
      .getAll(userId, {index: 'userId'})
      .filter({doneMeetingId: meetingId})
      .filter((task: RDatum) => task('tags').contains('private').not())
      .run()
  },

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

export default ActionMeetingMember
