import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import CreditCard from 'server/graphql/types/CreditCard';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import OrgUserCount from 'server/graphql/types/OrgUserCount';
import TierEnum from 'server/graphql/types/TierEnum';
import User, {UserConnection} from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import {BILLING_LEADER} from 'universal/utils/constants';


const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    creditCard: {
      type: CreditCard,
      description: 'The safe credit card details'
    },
    isBillingLeader: {
      type: GraphQLBoolean,
      description: 'true if the viewer is the billing leader for the org',
      resolve(source, args, {authToken}) {
        const userId = getUserId(authToken);
        const {orgUsers} = source;
        const myOrgUser = orgUsers.find((user) => user.id === userId);
        return myOrgUser && myOrgUser.role === BILLING_LEADER;
      }
    },
    mainBillingLeader: {
      type: User,
      description: 'The billing leader of the organization (or the first, if more than 1)',
      resolve: (source) => {
        const r = getRethink();
        const {orgUsers} = source;
        const firstBillingLeader = orgUsers.find((user) => user.role === BILLING_LEADER);
        if (firstBillingLeader) {
          return r.table('User').get(firstBillingLeader.id).run();
        }
        return undefined;
      }
    },
    name: {type: GraphQLString, description: 'The name of the organization'},
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    },
    tier: {
      type: TierEnum,
      description: 'The level of access to features on the parabol site'
    },
    periodEnd: {
      type: GraphQLISO8601Type,
      description: 'THe datetime the current billing cycle ends'
    },
    periodStart: {
      type: GraphQLISO8601Type,
      description: 'The datetime the current billing cycle starts'
    },

    stripeId: {
      type: GraphQLID,
      description: 'The customerId from stripe'
    },
    stripeSubscriptionId: {
      type: GraphQLID,
      description: 'The subscriptionId from stripe'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
    orgUsers: {
      args: {
        ...forwardConnectionArgs
      },
      type: UserConnection,
      async resolve({orgUsers}, {first}, {dataLoader}) {
        if (!Array.isArray(orgUsers)) return null;

        // RESOLUTION
        const limitedOrgUsers = orgUsers.slice(0, first);

        const userIds = limitedOrgUsers.map(({id}) => id);
        const nodes = await dataLoader.get('users').loadMany(userIds);
        nodes.sort((a, b) => a.preferredName.toLowerCase() > b.preferredName.toLowerCase() ? 1 : -1);
        const edges = nodes.map((node) => ({
          cursor: node.preferredName.toLowerCase(),
          node
        }));

        const firstEdge = edges[0];
        return {
          edges,
          pageInfo: {
            endCursor: firstEdge && edges[edges.length - 1].cursor,
            hasNextPage: false
          }
        };
      }
    },
    orgUserCount: {
      type: OrgUserCount,
      description: 'The count of active & inactive users',
      resolve: async (source) => {
        const {orgUsers} = source;
        if (!Array.isArray(orgUsers)) throw new Error('No orgUsers supplied!');
        const inactiveUserCount = orgUsers.filter((orgUser) => orgUser.inactive).length;
        return {
          inactiveUserCount,
          activeUserCount: orgUsers.length - inactiveUserCount
        };
      }
    },
    /* GraphQL Sugar */
    billingLeaders: {
      type: new GraphQLList(User),
      description: 'The leaders of the org',
      resolve: async ({id}) => {
        const r = getRethink();
        return r.table('User')
          .getAll(id, {index: 'userOrgs'})
          .filter((user) => user('userOrgs')
            .contains((userOrg) => userOrg('id').eq(id).and(userOrg('role').eq(BILLING_LEADER))))
          .run();
      }
    }
  })
});

export default Organization;
