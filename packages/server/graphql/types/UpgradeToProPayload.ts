import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization, resolveTeams} from '../resolvers'
import NewMeeting from './NewMeeting'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const UpgradeToProPayload = new GraphQLObjectType<any, GQLContext>({
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
      type: new GraphQLList(new GraphQLNonNull(Team)),
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
      resolve: ({meetingIds}, _args: unknown, {dataLoader}) => {
        return meetingIds ? dataLoader.get('newMeetings').loadMany(meetingIds) : null
      }
    }
  })
})

export default UpgradeToProPayload
