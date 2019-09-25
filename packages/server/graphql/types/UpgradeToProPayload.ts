import {GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLID} from 'graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import Organization from './Organization'
import Team from './Team'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'

const UpgradeToProPayload = new GraphQLObjectType({
  name: 'UpgradeToProPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The new Pro Org',
      resolve: resolveOrganization
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'The updated teams under the org',
      resolve: resolveTeams
    },
    meetingIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'the ids of the meetings that were showing conversion modals'
    },
    meetings: {
      type: new GraphQLList(new GraphQLNonNull(NewMeeting)),
      description: 'the meetings that were showing conversion modals',
      resolve: ({meetingIds}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('newMeetings').loadMany(meetingIds)
      }
    }
  })
})

export default UpgradeToProPayload
