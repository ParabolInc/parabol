import {GraphQLEnumType, GraphQLObjectType, GraphQLString} from 'graphql';


const InvitationResultType = new GraphQLEnumType({
  name: 'InvitationResultType',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  values: {
    [ADD_TO_TEAM]: {},
    [FACILITATOR_REQUEST]: {},
    [JOIN_TEAM]: {},
    [REJOIN_TEAM]: {}
  }
});

const InviteTeamMembersPayload = new GraphQLObjectType({
  name: 'InviteTeamMembersPayload',
  fields: () => ({
    email: {
      type: GraphQLString,
      description: 'The email address requested to join the team'
    },
    result: {
      type: InvitationResultType,
      description: 'The outcome of trying to invite an email address'
    }

  })
});

export default InviteTeamMembersPayload;
