import {GraphQLID, GraphQLInterfaceType} from 'graphql'
import NotificationEnum from './NotificationEnum'
import NotifyKickedOut from './NotifyKickedOut'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import NotifyTeamArchived from './NotifyTeamArchived'
import NotificationTeamInvitation from './NotificationTeamInvitation'

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
    }

    return resolveTypeLookup[type]
  }
})

export default TeamNotification
