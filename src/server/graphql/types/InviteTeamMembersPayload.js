import {GraphQLEnumType, GraphQLObjectType, GraphQLString} from 'graphql';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, SUCCESS, REACTIVATED} from 'universal/utils/constants';

const InvitationResultEnum = new GraphQLEnumType({
  name: 'InvitationResultEnum',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  values: {
    [ALREADY_ON_TEAM]: {},
    [PENDING_APPROVAL]: {},
    [REACTIVATED]: {},
    [SUCCESS]: {},
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
      type: InvitationResultEnum,
      description: 'The outcome of trying to invite an email address'
    }

  })
});

export default InviteTeamMembersPayload;
