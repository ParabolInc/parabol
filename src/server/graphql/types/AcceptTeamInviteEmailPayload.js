import {GraphQLID, GraphQLObjectType} from 'graphql'
import AcceptTeamInvitePayload, {
  acceptTeamInviteFields
} from 'server/graphql/types/AcceptTeamInvitePayload'

const AcceptTeamInviteEmailPayload = new GraphQLObjectType({
  name: 'AcceptTeamInviteEmailPayload',
  interfaces: [AcceptTeamInvitePayload],
  fields: () => ({
    ...acceptTeamInviteFields,
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    }
  })
})

export default AcceptTeamInviteEmailPayload
