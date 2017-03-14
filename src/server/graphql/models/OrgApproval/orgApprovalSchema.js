import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GraphQLEmailType} from 'server/graphql/types';

const OrgApproval = new GraphQLObjectType({
  name: 'OrgApproval',
  description: 'The state of approving an email address to join a team and org',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique approval ID'},
    // approvedBy: {
    //   type: GraphQLID,
    //   description: 'The billingLeader that approved the email. If empty, it is still pending'
    // },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: '*The email seeking approval'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId the email want to join'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team seeking approval. Used to populate in the team settings page'
    },
    // updatedAt: {
    //   type: GraphQLISO8601Type,
    //   description: 'The datetime the approval was last updated'
    // },
  })
});

export default OrgApproval;
