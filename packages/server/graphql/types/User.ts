import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {
  AUTO_GROUPING_THRESHOLD,
  MAX_REDUCTION_PERCENTAGE,
  MAX_RESULT_GROUP_SIZE
} from '../../../client/utils/constants'
import groupReflections from '../../../client/utils/smartGroup/groupReflections'
import getRethink from '../../database/rethinkDriver'
import MeetingMemberType from '../../database/types/MeetingMember'
import OrganizationType from '../../database/types/Organization'
import OrganizationUserType from '../../database/types/OrganizationUser'
import Reflection from '../../database/types/Reflection'
import SuggestedActionType from '../../database/types/SuggestedAction'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import getMonthlyStreak from '../../utils/getMonthlyStreak'
import getRedis from '../../utils/getRedis'
import standardError from '../../utils/standardError'
import errorFilter from '../errorFilter'
import {DataLoaderWorker, GQLContext} from '../graphql'
import isValid from '../isValid'
import invoiceDetails from '../queries/invoiceDetails'
import invoices from '../queries/invoices'
import organization from '../queries/organization'
import AuthIdentity from './AuthIdentity'
import Discussion from './Discussion'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import MeetingMember from './MeetingMember'
import NewFeatureBroadcast from './NewFeatureBroadcast'
import Organization from './Organization'
import OrganizationUser from './OrganizationUser'
import RetroReflectionGroup from './RetroReflectionGroup'
import SuggestedAction from './SuggestedAction'
import Team from './Team'
import TeamInvitationPayload from './TeamInvitationPayload'
import TeamMember from './TeamMember'
import TierEnum from './TierEnum'
import {TimelineEventConnection} from './TimelineEvent'

const User: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>({
  name: 'User',
  description: 'The user account profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId provided by us'
    },
    archivedTasks: require('../queries/archivedTasks').default,
    archivedTasksCount: require('../queries/archivedTasksCount').default,
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the user was created',
      resolve: ({createdAt}) => createdAt || new Date('2016-06-01')
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The user email'
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
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is a billing leader on any organization, else false',
      resolve: async ({id: userId}: {id: string}, _args: unknown, {dataLoader}: GQLContext) => {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        return organizationUsers.some(
          (organizationUser: OrganizationUserType) => organizationUser.role === 'BILLING_LEADER'
        )
      }
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is currently online',
      resolve: async ({id: userId}: {id: string}) => {
        const redis = getRedis()
        const connectedSocketsCount = await redis.llen(`presence:${userId}`)
        return connectedSocketsCount > 0
      }
    },
    isPatient0: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is the first to sign up from their domain, else false'
    },
    isPatientZero: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is the first to sign up from their domain, else false',
      deprecationReason: 'Use isPatient0 instead',
      resolve: ({isPatient0}) => isPatient0
    },
    reasonRemoved: {
      type: GraphQLString,
      description: 'the reason the user account was removed'
    },
    isRemoved: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user was removed from parabol, else false',
      resolve: ({isRemoved}: {isRemoved: boolean}) => !!isRemoved
    },
    isWatched: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if all user sessions are being recorded, else false',
      resolve: ({isWatched}: {isWatched: boolean}) => !!isWatched
    },
    lastMetAt: {
      type: GraphQLISO8601Type,
      description: 'the endedAt timestamp of the most recent meeting they were a member of',
      resolve: async ({id: userId}: {id: string}, _args: unknown, {dataLoader}: GQLContext) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const lastMetAt = Math.max(
          0,
          ...meetingMembers.map(({updatedAt}: MeetingMemberType) => updatedAt.getTime())
        )
        return lastMetAt ? new Date(lastMetAt) : null
      }
    },
    meetingCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of meetings the user has attended',
      resolve: async ({id: userId}: {id: string}, _args: unknown, {dataLoader}: GQLContext) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        return meetingMembers.length
      }
    },
    monthlyStreakMax: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The largest number of consecutive months the user has checked into a meeting',
      resolve: async ({id: userId}: {id: string}, _args: unknown, {dataLoader}: GQLContext) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const meetingDates = meetingMembers
          .map(({updatedAt}: MeetingMemberType) => updatedAt.getTime())
          .sort((a, b) => (a < b ? 1 : -1))

        return getMonthlyStreak(meetingDates)
      }
    },
    monthlyStreakCurrent: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The number of consecutive 30-day intervals that the user has checked into a meeting as of this moment',
      resolve: async ({id: userId}: {id: string}, _args: unknown, {dataLoader}: GQLContext) => {
        const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
        const meetingDates = meetingMembers
          .map(({updatedAt}: MeetingMemberType) => updatedAt.getTime())
          .sort((a, b) => (a < b ? 1 : -1))
        return getMonthlyStreak(meetingDates, true)
      }
    },
    suggestedActions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedAction))),
      description: 'the most important actions for the user to perform',
      resolve: async (
        {id: userId}: {id: string},
        _args: unknown,
        {dataLoader, authToken}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return []
        const suggestedActions = await dataLoader.get('suggestedActionsByUserId').load(userId)
        suggestedActions.sort((a: SuggestedActionType, b: SuggestedActionType) =>
          a.priority! < b.priority! ? -1 : 1
        )
        return suggestedActions
      }
    },
    payLaterClickCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of times the user clicked pay later',
      resolve: ({payLaterClickCount}: {payLaterClickCount: boolean}) => payLaterClickCount || 0
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
      resolve: async ({id}: {id: string}, {after, first}, {authToken}: GQLContext) => {
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
            // FIXME: the PageInfo type should be a GraphQLISO8601 type, but fixing that requires more work
            // because the type is shared all over so we'll have to verify that the change doesn't break anything
            endCursor: firstEdge ? new Date(edges[edges.length - 1]!.cursor).toJSON() : null,
            hasNextPage: events.length > edges.length
          }
        }
      }
    },
    discussion: {
      type: Discussion,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The ID of the discussion'
        }
      },
      description: 'the comments and tasks created from the discussion',
      resolve: async (_source: unknown, {id}, {authToken, dataLoader}: GQLContext) => {
        const discussion = await dataLoader.get('discussions').load(id)
        if (!discussion) return null
        const {teamId} = discussion
        if (!isTeamMember(authToken, teamId)) {
          return null
        }
        return discussion
      }
    },
    newFeatureId: {
      type: GraphQLID,
      description: 'the ID of the newest feature, null if the user has dismissed it'
    },
    newFeature: {
      type: NewFeatureBroadcast,
      description: 'The new feature released by Parabol. null if the user already hid it',
      resolve: (
        {newFeatureId}: {newFeatureId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
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
      resolve: ({preferredName, name}: {preferredName: string; name: string}) => {
        return preferredName || name
      }
    },
    rasterPicture: {
      type: new GraphQLNonNull(GraphQLURLType),
      description:
        'url of user’s raster profile picture (if user profile pic is an SVG, raster will be a PNG)',
      resolve: ({picture}: {picture: string}) => {
        return picture && picture.endsWith('.svg') ? picture.slice(0, -3) + 'png' : picture
      }
    },
    lastSeenAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The last day the user connected via websocket or navigated to a common area'
    },
    lastSeenAtURLs: {
      type: new GraphQLList(GraphQLString),
      description:
        'The paths that the user is currently visiting. This is null if the user is not currently online. A URL can also be null if the socket is not in a meeting, e.g. on the timeline.',
      resolve: async ({id: userId}: {id: string}) => {
        const redis = getRedis()
        const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
        if (!userPresence || userPresence.length === 0) return null
        return userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
      }
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
      resolve: async (
        {id: userId}: {id: string},
        {meetingId},
        {dataLoader}: {dataLoader: DataLoaderWorker}
      ) => {
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
      resolve: async ({id: userId}: {id: string}, {orgId}, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const [viewerOrganizationUser, userOrganizationUser] = await Promise.all([
          dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId}),
          dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
        ])
        if (viewerOrganizationUser || isSuperUser(authToken)) return userOrganizationUser
        return null
      }
    },
    organizationUsers: {
      description: 'A single user that is connected to a single organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(OrganizationUser))),
      resolve: async (
        {id: userId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        organizationUsers.sort((a: OrganizationUserType, b: OrganizationUserType) =>
          a.orgId > b.orgId ? 1 : -1
        )
        if (viewerId === userId || isSuperUser(authToken)) {
          return organizationUsers
        }
        const viewerOrganizationUsers = await dataLoader
          .get('organizationUsersByUserId')
          .load(viewerId)
        const viewerOrgIds = viewerOrganizationUsers.map(({orgId}: OrganizationUserType) => orgId)
        return organizationUsers.filter((organizationUser: OrganizationUserType) =>
          viewerOrgIds.includes(organizationUser.orgId)
        )
      }
    },
    organizations: {
      description: 'Get the list of all organizations a user belongs to',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Organization))),
      async resolve(
        {id: userId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        const orgIds = organizationUsers.map(({orgId}: OrganizationUserType) => orgId)
        const organizations = (await dataLoader.get('organizations').loadMany(orgIds)).filter(
          errorFilter
        )
        organizations.sort((a: OrganizationType, b: OrganizationType) => (a.name > b.name ? 1 : -1))
        const viewerId = getUserId(authToken)
        if (viewerId === userId || isSuperUser(authToken)) {
          return organizations
        }
        const viewerOrganizationUsers = await dataLoader
          .get('organizationUsersByUserId')
          .load(viewerId)
        const viewerOrgIds = viewerOrganizationUsers.map(({orgId}: OrganizationUserType) => orgId)
        return organizations.filter((organization: OrganizationType) =>
          viewerOrgIds.includes(organization.id)
        )
      }
    },
    overLimitCopy: {
      description:
        'a string with message stating that the user is over the free tier limit, else null',
      type: GraphQLString,
      resolve: async (
        {id: userId, overLimitCopy}: {id: string; overLimitCopy: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
        const isAnyMemberOfPaidOrg = organizationUsers.some(
          (organizationUser: OrganizationUserType) => organizationUser.tier !== 'starter'
        )
        if (isAnyMemberOfPaidOrg) return null
        return overLimitCopy
      }
    },
    sendSummaryEmail: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the user should receive a meeting summary email'
    },
    similarReflectionGroups: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflectionGroup))),
      description:
        'The reflection groups that are similar to the selected reflection in the Spotlight',
      args: {
        reflectionGroupId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the selected reflection group in the Spotlight'
        },
        searchQuery: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'Only return reflection groups that match the search query'
        }
      },
      resolve: async (
        {id: userId}: {id: string},
        {reflectionGroupId, searchQuery: rawSearchQuery},
        {dataLoader}: GQLContext
      ) => {
        const searchQuery = rawSearchQuery.toLowerCase().trim()
        const retroReflectionGroup = await dataLoader
          .get('retroReflectionGroups')
          .load(reflectionGroupId)
        if (!retroReflectionGroup) {
          return standardError(new Error('Invalid reflection id'), {userId})
        }
        const {meetingId} = retroReflectionGroup
        const meetingMemberId = MeetingMemberId.join(meetingId, userId)
        const [viewerMeetingMember, reflections] = await Promise.all([
          dataLoader.get('meetingMembers').load(meetingMemberId),
          dataLoader.get('retroReflectionsByMeetingId').load(meetingId) as Promise<Reflection[]>
        ])
        if (!viewerMeetingMember) {
          return standardError(new Error('Not on team'), {userId})
        }

        if (searchQuery !== '') {
          const matchedReflections = reflections.filter(({plaintextContent}) =>
            plaintextContent.toLowerCase().includes(searchQuery)
          )
          const relatedReflections = matchedReflections.filter(
            ({reflectionGroupId: groupId}: Reflection) => groupId !== reflectionGroupId
          )
          const relatedGroupIds = [
            ...new Set(relatedReflections.map(({reflectionGroupId}) => reflectionGroupId))
          ].slice(0, MAX_RESULT_GROUP_SIZE)
          return (await dataLoader.get('retroReflectionGroups').loadMany(relatedGroupIds)).filter(
            isValid
          )
        }

        const reflectionsCount = reflections.length
        const spotlightResultGroupSize = Math.min(reflectionsCount - 1, MAX_RESULT_GROUP_SIZE)
        let currentResultGroupIds = new Set<string>()
        let currentThresh: number | null = AUTO_GROUPING_THRESHOLD
        while (currentThresh) {
          const nextResultGroupIds = new Set<string>()
          const res = groupReflections(reflections, {
            groupingThreshold: currentThresh,
            maxGroupSize: reflectionsCount,
            maxReductionPercent: MAX_REDUCTION_PERCENTAGE
          })
          const {groupedReflectionsRes} = res
          const nextThresh = res.nextThresh as number | null
          const spotlightGroupedReflection = groupedReflectionsRes.find(
            (group) => group.oldReflectionGroupId === reflectionGroupId
          )
          if (!spotlightGroupedReflection) break
          for (const groupedReflectionRes of groupedReflectionsRes) {
            const {reflectionGroupId, oldReflectionGroupId} = groupedReflectionRes
            if (
              reflectionGroupId === spotlightGroupedReflection.reflectionGroupId &&
              oldReflectionGroupId !== spotlightGroupedReflection.oldReflectionGroupId
            ) {
              nextResultGroupIds.add(oldReflectionGroupId)
            }
            currentThresh = nextThresh
            if (nextResultGroupIds.size > spotlightResultGroupSize) {
              currentThresh = null
              break
            } else {
              currentResultGroupIds = nextResultGroupIds
              if (nextResultGroupIds.size === spotlightResultGroupSize) {
                currentThresh = null
                break
              }
            }
          }
        }
        return (
          await dataLoader.get('retroReflectionGroups').loadMany(Array.from(currentResultGroupIds))
        ).filter(isValid)
      }
    },
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
      resolve: async (
        {id: userId}: {id: string},
        {meetingId, teamId: inTeamId},
        {authToken, dataLoader}: GQLContext
      ) => {
        if (!meetingId && !inTeamId) return {}
        const viewerId = getUserId(authToken)
        if (viewerId !== userId && !isSuperUser(authToken)) return {}
        const user = (await dataLoader.get('users').load(userId))!
        const {email} = user
        let teamId = inTeamId
        if (!teamId && meetingId) {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          if (!meeting) return {meetingId}
          teamId = meeting.teamId
        }
        const teamInvitations = teamId
          ? await dataLoader.get('teamInvitationsByTeamId').load(teamId)
          : null
        if (!teamInvitations) return {teamId, meetingId}
        const teamInvitation = teamInvitations.find((invitation) => invitation.email === email)
        return {teamInvitation, teamId, meetingId}
      }
    },
    teams: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Team))),
      description: 'all the teams the user is on that the viewer can see.',
      resolve: async (
        {id: userId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const user = (await dataLoader.get('users').load(userId))!
        const teamIds =
          viewerId === userId || isSuperUser(authToken)
            ? user.tms
            : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))
        const teams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
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
        },
        userId: {
          type: GraphQLID,
          description:
            'If null, defaults to the team member for this user. Else, will grab the team member. Returns null if not on team.'
        }
      },
      resolve: ({id}: {id: string}, {teamId, userId}, {authToken, dataLoader}: GQLContext) => {
        if (!isTeamMember(authToken, teamId)) {
          const viewerId = getUserId(authToken)
          standardError(new Error('Not on team'), {userId: viewerId})
          return null
        }
        const teamMemberId = toTeamMemberId(teamId, userId || id)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    tier: {
      type: new GraphQLNonNull(TierEnum),
      description: 'The highest tier of any org the user belongs to'
    },
    tms: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'all the teams the user is a part of that the viewer can see',
      resolve: (
        {id: userId, tms}: {id: string; tms: string[]},
        _args: unknown,
        {authToken}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId
          ? tms
          : tms.filter((teamId: string) => authToken.tms.includes(teamId))
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
      resolve: async (_source: unknown, {userId}, {authToken, dataLoader}: GQLContext) => {
        const userOnTeam = await dataLoader.get('users').load(userId)
        if (!userOnTeam) {
          return standardError(new Error('Not on team'), {userId})
        }
        // const teams = new Set(userOnTeam)
        const {tms} = userOnTeam
        if (!authToken.tms.find((teamId) => tms.includes(teamId))) return null
        return userOnTeam
      }
    }
  })
})

export default User
