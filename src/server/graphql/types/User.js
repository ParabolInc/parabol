import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import archivedTasksCount from 'server/graphql/queries/archivedTasksCount'
import githubRepos from 'server/graphql/queries/githubRepos'
import integrationProvider from 'server/graphql/queries/integrationProvider'
import invoiceDetails from 'server/graphql/queries/invoiceDetails'
import invoices from 'server/graphql/queries/invoices'
import providerMap from 'server/graphql/queries/providerMap'
import slackChannels from 'server/graphql/queries/slackChannels'
import AuthIdentityType from 'server/graphql/types/AuthIdentityType'
import BlockedUserType from 'server/graphql/types/BlockedUserType'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import GraphQLURLType from 'server/graphql/types/GraphQLURLType'
import Meeting from 'server/graphql/types/Meeting'
import Team from 'server/graphql/types/Team'
import TeamMember from 'server/graphql/types/TeamMember'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import organization from 'server/graphql/queries/organization'
import tasks from 'server/graphql/queries/tasks'
import archivedTasks from 'server/graphql/queries/archivedTasks'
import {
  getUserId,
  isPastOrPresentTeamMember,
  isSuperUser,
  isTeamMember
} from 'server/utils/authorization'
import MeetingMember from 'server/graphql/types/MeetingMember'
import UserFeatureFlags from 'server/graphql/types/UserFeatureFlags'
import Organization from 'server/graphql/types/Organization'
import {TimelineEventConnection} from 'server/graphql/types/TimelineEvent'
import getRethink from 'server/database/rethinkDriver'
import OrganizationUser from 'server/graphql/types/OrganizationUser'
import SuggestedAction from 'server/graphql/types/SuggestedAction'
import NewFeatureBroadcast from 'server/graphql/types/NewFeatureBroadcast'
import standardError from 'server/utils/standardError'
import TeamInvitation from 'server/graphql/types/TeamInvitation'
import newMeeting from 'server/graphql/queries/newMeeting'
import suggestedIntegrations from 'server/graphql/queries/suggestedIntegrations'

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
    featureFlags: {
      type: new GraphQLNonNull(UserFeatureFlags),
      description: 'Any super power given to the user via a super user',
      resolve: (source) => {
        const featureFlags = source.featureFlags || []
        const flagObj = {}
        featureFlags.forEach((flag) => {
          flagObj[flag] = true
        })
        return flagObj
      }
    },
    identities: {
      type: new GraphQLList(AuthIdentityType),
      description: `An array of objects with information about the user's identities.
      More than one will exists in case accounts are linked`
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is currently online',
      resolve: (source) => {
        const {connectedSockets} = source
        return Array.isArray(connectedSockets) && connectedSockets.length > 0
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
    suggestedActions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedAction))),
      description: 'the most important actions for the user to perform',
      resolve: async ({id: userId}, _args, {dataLoader, authToken}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return null
        const suggestedActions = await dataLoader.get('suggestedActionsByUserId').load(userId)
        suggestedActions.sort((a, b) => (a.priority < b.priority ? -1 : 1))
        return suggestedActions
      }
    },
    timeline: {
      type: new GraphQLNonNull(TimelineEventConnection),
      description: 'The timeline of important events for the viewer',
      args: {
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        },
        first: {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'the number of timeline events to return'
        }
      },
      resolve: async ({id}, {after, first}, {dataLoader, authToken}) => {
        const r = getRethink()
        const viewerId = getUserId(authToken)
        if (viewerId !== id && !isSuperUser(authToken)) return null
        const dbAfter = after ? new Date(after) : r.maxval
        const events = await r
          .table('TimelineEvent')
          .between([viewerId, r.minval], [viewerId, dbAfter], {
            index: 'userIdCreatedAt'
          })
          .orderBy(r.desc('createdAt'))
          .limit(first + 1)
          .coerceTo('array')
        const edges = events.slice(0, first).map((node) => ({
          cursor: node.createdAt,
          node
        }))
        const [firstEdge] = edges
        return {
          edges,
          pageInfo: {
            startCursor: firstEdge ? firstEdge.cursor : null,
            endCursor: firstEdge ? edges[edges.length - 1].cursor : null,
            hasNextPage: events.length > edges.length
          }
        }
      }
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
    newFeatureId: {
      type: GraphQLID,
      description: 'the ID of the newest feature, null if the user has dismissed it'
    },
    newFeature: {
      type: NewFeatureBroadcast,
      description: 'The new feature released by Parabol. null if the user already hid it',
      resolve: ({newFeatureId}, _args, {dataLoader}) => {
        return newFeatureId ? dataLoader.get('newFeatures').load(newFeatureId) : null
      }
    },
    lastSeenAt: {
      type: GraphQLISO8601Type,
      description: 'The last time the user connected via websocket'
    },
    inactive: {
      type: GraphQLBoolean,
      description:
        'true if the user is not currently being billed for service. removed on every websocket handshake'
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The application-specific name, defaults to nickname',
      resolve: ({preferredName, name}) => {
        return preferredName || name
      }
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
      async resolve (source, {meetingId}, {authToken, dataLoader}) {
        const meeting = await dataLoader.get('meetings').load(meetingId)
        const viewerId = getUserId(authToken)
        if (!meeting) {
          return standardError(new Error('Meeting not found'), {userId: viewerId})
        }
        const {teamId} = meeting
        if (!isTeamMember(authToken, teamId)) {
          if (!(await isPastOrPresentTeamMember(viewerId, teamId))) {
            standardError(new Error('Team not found'), {userId: viewerId})
            return null
          }
        }
        return meeting
      }
    },
    meetingMember: {
      type: MeetingMember,
      description:
        'The meeting member associated with this user, if a meeting is currently in progress',
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
        if (!args.teamId && !args.meetingId) return null
        const viewerId = getUserId(authToken)
        let meetingId = args.meetingId
        if (!meetingId) {
          const team = await dataLoader.get('teams').load(args.teamId)
          meetingId = team.meetingId
        }
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return meetingId ? dataLoader.get('meetingMembers').load(meetingMemberId) : undefined
      }
    },
    newMeeting,
    notifications: require('../queries/notifications').default,
    providerMap,
    slackChannels,
    organization,
    organizationUser: {
      description: 'The connection between a user and an organization',
      type: OrganizationUser,
      args: {
        orgId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'the orgId'
        }
      },
      resolve: async ({id: userId}, {orgId}, {authToken, dataLoader}) => {
        // AUTH
        const viewerId = getUserId(authToken)
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        const organizationUsersForOrgId = organizationUsers.find(
          (organizationUser) => organizationUser.orgId === orgId
        )
        if (viewerId === userId || isSuperUser(authToken)) {
          return organizationUsersForOrgId
        }
        const viewerOrganizationUsers = await dataLoader
          .get('organizationUsersByUserId')
          .load(viewerId)
        const viewerOrganizationUsersForOrgId = viewerOrganizationUsers.find(
          (organizationUser) => organizationUser.orgId === orgId
        )
        return viewerOrganizationUsersForOrgId ? organizationUsersForOrgId : null
      }
    },
    organizationUsers: {
      description: 'A single user that is connected to a single organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(OrganizationUser))),
      resolve: async ({id: userId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        organizationUsers.sort((a, b) => (a.orgId > b.orgId ? 1 : -1))
        if (viewerId === userId || isSuperUser(authToken)) {
          return organizationUsers
        }
        const viewerOrganizationUsers = await dataLoader
          .get('organizationUsersByUserId')
          .load(viewerId)
        const viewerOrgIds = viewerOrganizationUsers.map(({orgId}) => orgId)
        return organizationUsers.filter((organizationUser) =>
          viewerOrgIds.includes(organizationUser.orgId)
        )
      }
    },
    organizations: {
      description: 'Get the list of all organizations a user belongs to',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Organization))),
      async resolve ({id: userId}, args, {authToken, dataLoader}) {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        const orgIds = organizationUsers.map(({orgId}) => orgId)
        const organizations = await dataLoader.get('organizations').loadMany(orgIds)
        organizations.sort((a, b) => (a.name > b.name ? 1 : -1))
        const viewerId = getUserId(authToken)
        if (viewerId === userId || isSuperUser(authToken)) {
          return organizations
        }
        const viewerOrganizationUsers = await dataLoader
          .get('organizationUsersByUserId')
          .load(viewerId)
        const viewerOrgIds = viewerOrganizationUsers.map(({orgId}) => orgId)
        return organizations.filter((organization) => viewerOrgIds.includes(organization.id))
      }
    },
    suggestedIntegrations,
    tasks,
    team: require('../queries/team').default,
    teamInvitation: {
      type: TeamInvitation,
      description: 'The invitation sent to the user, even if it was sent before they were a user',
      args: {
        teamId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The teamId to check for the invitation'
        }
      },
      resolve: async ({id: userId}, {teamId}, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId && !isSuperUser(authToken)) return null
        const user = await dataLoader.get('users').load(userId)
        const {email} = user
        const teamInvitations = await dataLoader.get('teamInvitationsByTeamId').load(teamId)
        return teamInvitations.find((invitation) => invitation.email === email)
      }
    },
    teams: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Team))),
      description: 'all the teams the user is on that the viewer can see.',
      resolve: async ({id: userId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const user = await dataLoader.get('users').load(userId)
        const teamIds =
          viewerId === userId || isSuperUser(authToken)
            ? user.tms
            : user.tms.filter((teamId) => authToken.tms.includes(teamId))
        const teams = await dataLoader.get('teams').loadMany(teamIds)
        teams.sort((a, b) => (a.name > b.name ? 1 : -1))
        return teams
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
        const viewerId = getUserId(authToken)
        if (!isTeamMember(authToken, teamId)) {
          standardError(new Error('Team not found'), {userId: viewerId})
          return null
        }
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    tms: {
      type: new GraphQLList(GraphQLID),
      description: 'all the teams the user is a part of that the viewer can see',
      resolve: (source, args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === source.id
          ? source.tms
          : source.tms.filter((teamId) => authToken.tms.includes(teamId))
      }
    }
  })
})

export default User
