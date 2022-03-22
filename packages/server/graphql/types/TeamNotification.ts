import {GraphQLID, GraphQLInterfaceType} from 'graphql'
import NotificationEnum from './NotificationEnum'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import NotifyKickedOut from './NotifyKickedOut'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import NotifyTeamArchived from './NotifyTeamArchived'

const TeamNotification: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'TeamNotification',
  fields: {
    id: {
      type: GraphQLID
    },
    type: {
      type: NotificationEnum
    }
  },
  resolveType({type}) {
    const resolveTypeLookup = {
      KICKED_OUT: NotifyKickedOut,
      TASK_INVOLVES: NotifyTaskInvolves,
      TEAM_INVITATION: NotificationTeamInvitation,
      TEAM_ARCHIVED: NotifyTeamArchived
    } as const

    return resolveTypeLookup[type as keyof typeof resolveTypeLookup]
  }
})

export default TeamNotification
