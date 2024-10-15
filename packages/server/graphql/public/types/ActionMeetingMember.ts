import {sql} from 'kysely'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {selectTasks} from '../../../postgres/select'
import {ActionMeetingMemberResolvers} from '../resolverTypes'

const ActionMeetingMember: ActionMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'action',
  doneTasks: async ({meetingId, userId}) => {
    const res = await selectTasks()
      .where('userId', '=', userId)
      .where('doneMeetingId', '=', meetingId)
      .where(sql<boolean>`'private' != ALL(tags)`)
      .execute()
    return res
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
