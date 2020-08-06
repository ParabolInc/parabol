import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GITHUB} from 'parabol-client/utils/constants'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {OrgUserRole} from '../../../client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import getDomainFromEmail from '../../utils/getDomainFromEmail'
import getMonthlyStreak from '../../utils/getMonthlyStreak'
import isCompanyDomain from '../../utils/isCompanyDomain'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import invoiceDetails from '../queries/invoiceDetails'
import invoices from '../queries/invoices'
import organization from '../queries/organization'
import suggestedIntegrations from '../queries/suggestedIntegrations'
import AtlassianAuth from './AtlassianAuth'
import AuthIdentity from './AuthIdentity'
import Company from './Company'
import GitHubAuth from './GitHubAuth'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import MeetingMember from './MeetingMember'
import NewFeatureBroadcast from './NewFeatureBroadcast'
import Organization from './Organization'
import OrganizationUser from './OrganizationUser'
import SuggestedAction from './SuggestedAction'
import Team from './Team'
import TeamInvitationPayload from './TeamInvitationPayload'
import TeamMember from './TeamMember'
import TierEnum from './TierEnum'
import {TierEnum as TierEnumType} from 'parabol-client/types/graphql'
import {TimelineEventConnection} from './TimelineEvent'
import UserFeatureFlags from './UserFeatureFlags'

const User = new GraphQLObjectType<any, GQLContext, any>({
  name: 'User',
  description: 'The user account profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId provided by us'
    },
    allAvailableIntegrations: require('../queries/allAvailableIntegrations').default,
    archivedTasks: require('../queries/archivedTasks').default,
    archivedTasksCount: require('../queries/archivedTasksCount').default,
    atlassianAuth: {
      type: AtlassianAuth,
      description:
        'The auth for the user. access token is null if not viewer. Use isActive to check for presence',
      args: {
        teamId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The teamId for the atlassian auth token'
        }
      },
      resolve: async ({id: userId}, {teamId}, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const auths = await dataLoader.get('atlassianAuthByUserId').load(userId)
        return auths.find((auth) => auth.teamId === teamId)
      }
    },
    company: {
      type: Company,
      description: 'The assumed company this organizaiton belongs to',
      resolve: async ({email}, _args, {authToken}) => {
        const domain = getDomainFromEmail(email)
        if (!domain || !isCompanyDomain(domain) || !isSuperUser(authToken)) return null
        return {id: domain}
      }
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
    featureFlags: {
      type: new GraphQLNonNull(UserFeatureFlags),
      description: 'Any super power given to the user via a super user',
      resolve: (source: any) => {
        const featureFlags = source.featureFlags || []
        const flagObj = {}
        featureFlags.forEach((flag) => {
          flagObj[flag] = true
        })
        return flagObj
      }
    },
    githubAuth: {
      type: GitHubAuth,
      description:
        'The auth for the user. access token is null if not viewer. Use isActive to check for presence',
      args: {
        teamId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The teamId for the auth object'
        }
      },
      resolve: async ({id: userId}, {teamId}, {authToken}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const r = await getRethink()
        return r
          .table('Provider')
          .getAll(teamId, {index: 'teamId'})
          .filter({service: GITHUB, isActive: true, userId})
          .nth(0)
          .default(null)
          .run()
      }
    },
    identities: {
      type: new GraphQLList(AuthIdentity),
      description: `An array of objects with information about the user's identities.
      More than one will exists in case accounts are linked`
    },
    inactive: {
      type: GraphQLBoolean,
      description:
        'true if the user is not currently being billed for service. removed on every websocket handshake'
    },
    invoiceDetails,
    invoices,
    isAnyBillingLeader: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is a billing leader on any organization, else false',
      resolve: async ({id: userId}, _args, {dataLoader}) => {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        return organizationUsers.some(
          (organizationUser) => organizationUser.role === OrgUserRole.BILLING_LEADER
        )
      }
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is currently online',
      resolve: (source) => {
        const {connectedSockets} = source
        return Array.isArray(connectedSockets) && connectedSockets.length > 0
      }
    },
    isPatientZero: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is the first to sign up from their domain, else false',
      resolve: async ({id: userId, email}) => {
        const r = await getRethink()
        const domain = getDomainFromEmail(email)
        return r
          .table('User')
          .filter((row: any) => row('email').match(`${domain}$`))
          .orderBy('createdAt')
          .nth(0)('id')
          .eq(userId)
          .run()
      }
    },
    reasonRemoved: {
      type: GraphQLString,
      description: 'the reason the user account was removed'
    },
    isRemoved: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user was removed from parabol, else false',
      resolve: ({isRemoved}) => !!isRemoved
    },
    lastMetAt: {
      type: GraphQLISO8601Type,
      description: 'the endedAt timestamp of the most recent meeting they were a member of',
      resolve: async ({id: userId}, _args, {dataLoader}) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const checkedInMeetingMembers = meetingMembers.filter(
          (meetingMember) => meetingMember.isCheckedIn
        )
        const lastMetAt = Math.max(0, ...checkedInMeetingMembers.map(({updatedAt}) => updatedAt))
        return lastMetAt ? new Date(lastMetAt) : null
      }
    },
    monthlyStreakMax: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The largest number of consecutive months the user has checked into a meeting',
      resolve: async ({id: userId}, _args, {dataLoader}) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const meetingDates = meetingMembers
          .filter(({isCheckedIn}) => isCheckedIn)
          .map(({updatedAt}) => updatedAt.getTime())
          .sort((a, b) => (a < b ? 1 : -1))

        return getMonthlyStreak(meetingDates)
      }
    },
    monthlyStreakCurrent: {
      type: GraphQLNonNull(GraphQLInt),
      description:
        'The number of consecutive 30-day intervals that the user has checked into a meeting as of this moment',
      resolve: async ({id: userId}, _args, {dataLoader}) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const meetingDates = meetingMembers
          .filter(({isCheckedIn}) => isCheckedIn)
          .map(({updatedAt}) => updatedAt.getTime())
          .sort((a, b) => (a < b ? 1 : -1))
        return getMonthlyStreak(meetingDates, true)
      }
    },
    suggestedActions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedAction))),
      description: 'the most important actions for the user to perform',
      resolve: async ({id: userId}, _args, {dataLoader, authToken}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return []
        const suggestedActions = await dataLoader.get('suggestedActionsByUserId').load(userId)
        suggestedActions.sort((a, b) => (a.priority! < b.priority! ? -1 : 1))
        return suggestedActions
      }
    },
    payLaterClickCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the number of times the user clicked pay later',
      resolve: ({payLaterClickCount}) => payLaterClickCount || 0
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
      resolve: async ({id}, {after, first}, {authToken}) => {
        const r = await getRethink()
        const viewerId = getUserId(authToken)
        if (viewerId !== id && !isSuperUser(authToken)) return null
        const dbAfter = after ? new Date(after) : r.maxval
        const events = await r
          .table('TimelineEvent')
          .between([viewerId, r.minval], [viewerId, dbAfter], {
            index: 'userIdCreatedAt'
          })
          .filter({isActive: true})
          .orderBy(r.desc('createdAt'))
          .limit(first + 1)
          .coerceTo('array')
          .run()
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
    picture: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The application-specific name, defaults to email before the tld',
      resolve: ({preferredName, name}) => {
        return preferredName || name
      }
    },
    rasterPicture: {
      type: new GraphQLNonNull(GraphQLURLType),
      description:
        'url of user’s raster profile picture (if user profile pic is an SVG, raster will be a PNG)',
      resolve: ({picture}) => {
        return picture && picture.endsWith('.svg') ? picture.slice(0, -3) + 'png' : picture
      }
    },
    lastSeenAt: {
      type: GraphQLISO8601Type,
      description: 'The last time the user connected via websocket or navigated to a common area'
    },
    lastSeenAtURL: {
      type: GraphQLString,
      description: 'The path the user was last seen at (rough heuristic)'
    },
    meetingMember: {
      type: MeetingMember,
      description:
        'The meeting member associated with this user, if a meeting is currently in progress',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The specific meeting ID'
        }
      },
      resolve: async ({userId}, {meetingId}, {dataLoader}) => {
        const meetingMemberId = toTeamMemberId(meetingId, userId)
        return meetingId ? dataLoader.get('meetingMembers').load(meetingMemberId) : undefined
      }
    },
    meeting: require('../queries/newMeeting').default,
    newMeeting: require('../queries/newMeeting').default, // deprecated
    notifications: require('../queries/notifications').default,
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
      resolve: async ({id: userId}, _args, {authToken, dataLoader}) => {
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
      async resolve({id: userId}, _args, {authToken, dataLoader}) {
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
    overLimitCopy: {
      description:
        'a string with message stating that the user is over the free tier limit, else null',
      type: GraphQLString,
      resolve: async (source, _args, {dataLoader}) => {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(source.id)
        const isAnyMemberOfPaidOrg = organizationUsers.some(
          (organizationUser) => organizationUser.tier !== TierEnumType.personal
        )
        if (isAnyMemberOfPaidOrg) return null
        return source.overLimitCopy
      }
    },
    suggestedIntegrations,
    tasks: require('../queries/tasks').default,
    team: require('../queries/team').default,
    teamInvitation: {
      type: new GraphQLNonNull(TeamInvitationPayload),
      description: 'The invitation sent to the user, even if it was sent before they were a user',
      args: {
        meetingId: {
          type: GraphQLID,
          description:
            'The meetingId to check for the invitation, if teamId not available (e.g. on a meeting route)'
        },
        teamId: {
          type: GraphQLID,
          description: 'The teamId to check for the invitation'
        }
      },
      resolve: async ({id: userId}, {meetingId, teamId: inTeamId}, {authToken, dataLoader}) => {
        if (!meetingId && !inTeamId) return {}
        const viewerId = getUserId(authToken)
        if (viewerId !== userId && !isSuperUser(authToken)) return {}
        const user = await dataLoader.get('users').load(userId)
        const {email} = user
        let teamId = inTeamId
        if (!teamId) {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          if (!meeting) return {meetingId}
          teamId = meeting.teamId
        }
        const teamInvitations = await dataLoader.get('teamInvitationsByTeamId').load(teamId)
        const teamInvitation = teamInvitations.find((invitation) => invitation.email === email)
        return {teamInvitation, teamId, meetingId}
      }
    },
    teams: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Team))),
      description: 'all the teams the user is on that the viewer can see.',
      resolve: async ({id: userId}, _args, {authToken, dataLoader}) => {
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
      resolve: (_source, {teamId}, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        if (!isTeamMember(authToken, teamId)) {
          standardError(new Error('Team not found'), {userId: viewerId})
          return null
        }
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    tier: {
      type: GraphQLNonNull(TierEnum),
      description: 'The highest tier of any org the user belongs to'
    },
    tms: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'all the teams the user is a part of that the viewer can see',
      resolve: ({id: userId, tms}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? tms : tms.filter((teamId) => authToken.tms.includes(teamId))
      }
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the user was last updated'
    },
    userOnTeam: {
      type: User,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The other user'
        }
      },
      resolve: async (_source, {userId}, {authToken, dataLoader}) => {
        const userOnTeam = await dataLoader.get('users').load(userId)
        // const teams = new Set(userOnTeam)
        const {tms} = userOnTeam
        if (!authToken.tms.find((teamId) => tms.includes(teamId))) return null
        return userOnTeam
      }
    }
  })
})

export default User
