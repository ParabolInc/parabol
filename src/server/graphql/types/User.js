import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import archivedTasksCount from 'server/graphql/queries/archivedTasksCount';
import githubRepos from 'server/graphql/queries/githubRepos';
import integrationProvider from 'server/graphql/queries/integrationProvider';
import invoiceDetails from 'server/graphql/queries/invoiceDetails';
import invoices from 'server/graphql/queries/invoices';
import isBillingLeader from 'server/graphql/queries/isBillingLeader';
import providerMap from 'server/graphql/queries/providerMap';
import slackChannels from 'server/graphql/queries/slackChannels';
import AuthIdentityType from 'server/graphql/types/AuthIdentityType';
import BlockedUserType from 'server/graphql/types/BlockedUserType';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import Meeting from 'server/graphql/types/Meeting';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import UserOrg from 'server/graphql/types/UserOrg';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import organization from 'server/graphql/queries/organization';
import tasks from 'server/graphql/queries/tasks';
import archivedTasks from 'server/graphql/queries/archivedTasks';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors';
import MeetingMember from 'server/graphql/types/MeetingMember';
import NewMeeting from 'server/graphql/types/NewMeeting';

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
    connectedSockets: {
      type: new GraphQLList(GraphQLID),
      description: 'The socketIds that the user is currently connected with'
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
    isRetroEnabled: {
      type: GraphQLBoolean,
      description: 'true if the user can view retros, else false'
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is currently online',
      resolve: (source) => {
        const {connectedSockets} = source;
        return Array.isArray(connectedSockets) && connectedSockets.length > 0;
      }
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
    userOrgs: {
      type: new GraphQLList(UserOrg),
      description: 'the orgs and roles for this user on each',
      resolve: (source, args, {authToken}) => {
        const userId = getUserId(authToken);
        return (userId === source.id) ? source.userOrgs : undefined;
      }
    },
    welcomeSentAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that we sent them a welcome email'
    },
    archivedTasks,
    archivedTasksCount,
    githubRepos,
    integrationProvider,
    invoices,
    invoiceDetails,
    meeting: {
      type: Meeting,
      description: 'A previous meeting that the user was in (present or absent)',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The meeting ID'
        }
      },
      async resolve(source, {meetingId}, {authToken, dataLoader}) {
        const meeting = await dataLoader.get('meetings').load(meetingId);
        if (!meeting) {
          return sendMeetingNotFoundError(authToken, meetingId);
        }
        if (!isTeamMember(authToken, meeting.teamId)) return sendTeamAccessError(authToken, meeting.teamId, null);
        return meeting;
      }
    },
    meetingMember: {
      type: MeetingMember,
      description: 'The meeting member associated with this user, if a meeting is currently in progress',
      args: {
        meetingId: {
          type: GraphQLID,
          description: 'The specific meeting ID'
        },
        teamId: {
          type: GraphQLID,
          description: 'The teamId of the meeting currently in progress'
        }
      },
      resolve: async (source, args, {authToken, dataLoader}) => {
        if (!args.teamId && !args.meetingId) return null;
        const viewerId = getUserId(authToken);
        let meetingId = args.meetingId;
        if (!meetingId) {
          const team = await dataLoader.get('teams').load(args.teamId);
          meetingId = team.meetingId;
        }
        const meetingMemberId = toTeamMemberId(meetingId, viewerId);
        return meetingId ? dataLoader.get('meetingMembers').load(meetingMemberId) : undefined;
      }
    },
    newMeeting: {
      type: new GraphQLNonNull(NewMeeting),
      description: 'A previous meeting that the user was in (present or absent)',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The meeting ID'
        }
      },
      async resolve(source, {meetingId}, {authToken, dataLoader}) {
        const meeting = await dataLoader.get('newMeetings').load(meetingId);
        if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
        const {teamId} = meeting;
        if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId, null);
        return meeting;
      }
    },
    notifications: require('../queries/notifications').default,
    providerMap,
    slackChannels,
    organization,
    organizations: require('../queries/organizations').default,
    tasks,
    team: require('../queries/team').default,
    teams: {
      type: new GraphQLList(Team),
      description: 'all the teams the user is on that the viewer can see.',
      resolve: async ({id: userId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        let teamIds;
        if (viewerId === userId) {
          teamIds = authToken.tms;
        } else {
          const user = await dataLoader.get('users').load(userId);
          teamIds = user.tms.filter((teamId) => authToken.tms.includes(teamId));
        }
        const teams = await dataLoader.get('teams').loadMany(teamIds);
        teams.sort((a, b) => a.name > b.name ? 1 : -1);
        return teams;
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
      resolve: (source, {teamId}, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId, null);
        const teamMemberId = toTeamMemberId(teamId, viewerId);
        return dataLoader.get('teamMembers').load(teamMemberId);
      }
    },
    tms: {
      type: new GraphQLList(GraphQLID),
      description: 'all the teams the user is a part of that the viewer can see',
      resolve: (source, args, {authToken}) => {
        const viewerId = getUserId(authToken);
        return (viewerId === source.id) ? source.tms : source.tms.filter((teamId) => authToken.tms.includes(teamId));
      }
    }
  })
});

export default User;
