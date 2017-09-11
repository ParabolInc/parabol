import {GraphQLEnumType, GraphQLObjectType, GraphQLString} from 'graphql';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, SUCCESS, REACTIVATED} from 'universal/utils/constants';

const InvitationResultEnum = new GraphQLEnumType({
  name: 'InvitationResultEnum',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  values: {
    [ALREADY_ON_TEAM]: {},
    [PENDING_APPROVAL]: {},
    [REACTIVATED]: {},
    [SUCCESS]: {}
  }
});

const InvitationResult = new GraphQLObjectType({
  name: 'InvitationResult',
  fields: () => ({
    email: {
      type: GraphQLString,
      description: 'The email address requested to join the team'
    },
    //inviterName: {
    //  type: GraphQLString,
    //  description: 'The name of the person that triggered the invitation (only populated for reactivations)'
    //},
    //preferredName: {
    //  type: GraphQLString,
    //  description: 'The name of the user being invited (only populated for reactivations)'
    //},
    result: {
      type: InvitationResultEnum,
      description: 'The outcome of trying to invite an email address'
    }

  })
});

export default InvitationResult;
