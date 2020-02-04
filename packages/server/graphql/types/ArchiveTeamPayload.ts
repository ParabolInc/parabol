import {GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNotificationForViewer, resolveTeam} from '../resolvers'
import NotifyTeamArchived from './NotifyTeamArchived'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const ArchiveTeamPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ArchiveTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    notification: {
      type: NotifyTeamArchived,
      description: 'A notification explaining that the team was archived and removed from view',
      resolve: resolveNotificationForViewer
    },
    removedSuggestedActionIds: {
      type: new GraphQLList(GraphQLID),
      description: 'all the suggested actions that never happened'
    }
  })
})

export default ArchiveTeamPayload
