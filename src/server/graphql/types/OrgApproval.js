import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import OrgApprovalStatusEnum from 'server/graphql/types/OrgApprovalStatusEnum'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import PossibleTeamMember from 'server/graphql/types/PossibleTeamMember'
// import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser'
import {getUserId} from 'server/utils/authorization'
import {REQUEST_NEW_USER} from 'universal/utils/constants'
import getRethink from 'server/database/rethinkDriver'

const OrgApproval = new GraphQLObjectType({
  name: 'OrgApproval',
  description: 'The state of approving an email address to join a team and org',
  interfaces: () => [PossibleTeamMember],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique approval ID'
    },
    approvedBy: {
      type: GraphQLID,
      description: 'The userId of the billing leader that approved the invitee'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    deniedBy: {
      type: GraphQLID,
      description: 'The userId of the billing leader that denied the invitee'
    },
    email: {
      type: GraphQLEmailType,
      description: '*The email seeking approval'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true if it applies to a user that was not removed from the org, else false'
    },
    notification: {
      type: require('./NotifyRequestNewUser').default,
      description: 'The notification sent to the viewer / billing leader(s) requesting approval',
      resolve: async ({id, email}, args, {authToken, dataLoader}) => {
        const r = getRethink()
        const viewerId = getUserId(authToken)
        const viewerNotification = await r
          .table('Notification')
          .getAll(viewerId, {index: 'userIds'})
          .filter({
            inviteeEmail: email,
            type: REQUEST_NEW_USER
          })
          .nth(0)
          .default(null)
        return viewerNotification
      }
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId the email want to join'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team seeking approval. Used to populate in the team settings page'
    },
    status: {
      type: OrgApprovalStatusEnum
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the approval was last updated'
    }
  })
})

export default OrgApproval
