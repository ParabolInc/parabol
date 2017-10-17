import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import archivedProjects from 'server/graphql/queries/archivedProjects';
import archivedProjectsCount from 'server/graphql/queries/archivedProjectsCount';
import githubRepos from 'server/graphql/queries/githubRepos';
import integrationProvider from 'server/graphql/queries/integrationProvider';
import invoiceDetails from 'server/graphql/queries/invoiceDetails';
import invoices from 'server/graphql/queries/invoices';
import isBillingLeader from 'server/graphql/queries/isBillingLeader';
import notifications from 'server/graphql/queries/notifications';
// import organization from 'server/graphql/queries/organization';
// import ownedOrganizations from 'server/graphql/queries/ownedOrganizations';
import providerMap from 'server/graphql/queries/providerMap';
import slackChannels from 'server/graphql/queries/slackChannels';
import AuthIdentityType from 'server/graphql/types/AuthIdentityType';
import BlockedUserType from 'server/graphql/types/BlockedUserType';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import UserOrg from 'server/graphql/types/UserOrg';
import {getUserId} from 'server/utils/authorization';

const User = new GraphQLObjectType({
  name: 'User',
  description: 'The user account profile',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The userId provided by auth0'
    },
    blockedFor: {
      type: new GraphQLList(BlockedUserType),
      description: 'Array of identifier + ip pairs'
    },
    cachedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp of the user was cached'
    },
    cacheExpiresAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp when the cached user expires'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the user was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The user email'
    },
    emailVerified: {
      type: GraphQLBoolean,
      description: 'true if email is verified, false otherwise'
    },
    identities: {
      type: new GraphQLList(AuthIdentityType),
      description: `An array of objects with information about the user's identities.
      More than one will exists in case accounts are linked`
    },
    loginsCount: {
      type: GraphQLInt,
      description: 'The number of logins for this user'
    },
    name: {
      type: GraphQLString,
      description: 'Name associated with the user'
    },
    nickname: {
      type: GraphQLString,
      description: 'Nickname associated with the user'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the user was last updated'
    },
    /* User Profile */
    broadcastFlags: {
      type: GraphQLInt,
      description: 'flag to determine which broadcasts to show'
    },
    lastSeenAt: {
      type: GraphQLISO8601Type,
      description: 'The last time the user connected via websocket'
    },
    inactive: {
      type: GraphQLBoolean,
      description: 'true if the user is not currently being billed for service. removed on every websocket handshake'
    },
    isBillingLeader,
    preferredName: {
      type: GraphQLString,
      description: 'The application-specific name, defaults to nickname'
    },
    tms: {
      type: new GraphQLList(GraphQLID),
      description: 'all the teams the user is a part of',
      resolve: (source, args, {authToken}) => {
        const userId = getUserId(authToken);
        return (userId === source.id) ? source.tms : undefined;
      }
    },
    userOrgs: {
      type: new GraphQLList(UserOrg),
      description: 'the orgs and roles for this user on each'
    },
    welcomeSentAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that we sent them a welcome email'
    },
    /* GraphQL Sugar */
    // memberships: {
    //  type: new GraphQLList(TeamMember),
    //  description: 'The memberships to different teams that the user has',
    //  resolve({id}) {
    //    const r = getRethink();
    //    return r.table('TeamMember')
    //      .getAll(id, {index: 'userId'})
    //      .run();
    //  }
    // },
    archivedProjects,
    archivedProjectsCount,
    githubRepos,
    integrationProvider,
    invoices,
    invoiceDetails,
    notifications,
    providerMap,
    slackChannels,
    organization: require('../queries/organization').default,
    ownedOrganizations: require('../queries/ownedOrganizations').default,
    team: require('../queries/team').default,
    // hack until we can move to ES6 immutable bindings
    orgMembers: require('../queries/orgMembers').default,
    jwt: {
      type: GraphQLID,
      description: 'a refreshed JWT'
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: User
});

export const UserConnection = connectionType;
export const UserEdge = edgeType;
export default User;
