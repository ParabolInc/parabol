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
import {Team} from 'server/graphql/models/Team/teamSchema';
import archivedProjects from 'server/graphql/queries/archivedProjects';
import archivedProjectsCount from 'server/graphql/queries/archivedProjectsCount';
import githubRepos from 'server/graphql/queries/githubRepos';
import integrationProvider from 'server/graphql/queries/integrationProvider';
import invoiceDetails from 'server/graphql/queries/invoiceDetails';
import invoices from 'server/graphql/queries/invoices';
import isBillingLeader from 'server/graphql/queries/isBillingLeader';
// import notifications from 'server/graphql/queries/notifications';
// import organization from 'server/graphql/queries/organization';
import providerMap from 'server/graphql/queries/providerMap';
import slackChannels from 'server/graphql/queries/slackChannels';
import AuthIdentityType from 'server/graphql/types/AuthIdentityType';
import BlockedUserType from 'server/graphql/types/BlockedUserType';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import TeamMember from 'server/graphql/types/TeamMember';
import UserOrg from 'server/graphql/types/UserOrg';
import {getUserId} from 'server/utils/authorization';
// import organizations from 'server/graphql/queries/organizations';

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
    // presence: {
    //  type: Presence,
    //  description: 'An object with details about the online presence of a user',
    // resolve: ({id: userId}, args) => {
    // }
    // }
    tms: {
      type: new GraphQLList(GraphQLID),
      description: 'all the teams the user is a part of',
      resolve: (source, args, {authToken}) => {
        const userId = getUserId(authToken);
        return (userId === source.id) ? source.tms : undefined;
      }
    },
    teams: {
      type: new GraphQLList(Team),
      description: 'all the teams the user is on',
      resolve: (source, args, {authToken, getDataLoader}) => {
        return getDataLoader().teams.loadMany(authToken.tms);
      }
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member associated with this user',
      args: {
        teamId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The team the user is on'
        }
      },
      resolve: (source, {teamId}, {authToken, getDataLoader}) => {
        const userId = getUserId(authToken);
        if (!authToken.tms.includes(teamId)) {
          throw new Error('User is not a part of that team');
        }
        const teamMemberId = `${userId}::${teamId}`;
        return getDataLoader().teamMembers.load(teamMemberId);
      }
    },
    userOrgs: {
      type: new GraphQLList(UserOrg),
      description: 'the orgs and roles for this user on each',
      resolve: (source, args, {authToken}) => {
        const userId = getUserId(authToken);
        return (userId === source.id) ? source.tms : undefined;
      }
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
    notifications: require('../queries/notifications').default,
    providerMap,
    slackChannels,
    organization: require('../queries/organization').default,
    organizations: require('../queries/organizations').default,
    projects: require('../queries/projects').default,
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
