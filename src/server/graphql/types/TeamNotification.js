import {GraphQLID, GraphQLInterfaceType} from 'graphql'
import NotificationEnum from 'server/graphql/types/NotificationEnum'
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut'
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves'
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived'
import {KICKED_OUT, TASK_INVOLVES, TEAM_ARCHIVED, TEAM_INVITATION} from 'universal/utils/constants'
import NotificationTeamInvitation from 'server/graphql/types/NotificationTeamInvitation'

const TeamNotification = new GraphQLInterfaceType({
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
      [KICKED_OUT]: NotifyKickedOut,
      [TASK_INVOLVES]: NotifyTaskInvolves,
      [TEAM_INVITATION]: NotificationTeamInvitation,
      [TEAM_ARCHIVED]: NotifyTeamArchived
    }

    return resolveTypeLookup[type]
  }
})

export default TeamNotification
