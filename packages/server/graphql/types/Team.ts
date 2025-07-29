import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type ITeam from '../../database/types/Team'
import {getUserId, isSuperUser, isTeamMember, isUserBillingLeader} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import type {GQLContext} from './../graphql'
import isValid from '../isValid'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import AgendaItem from './AgendaItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import MeetingTypeEnum from './MeetingTypeEnum'
import NewMeeting from './NewMeeting'
import Organization from './Organization'
import {TaskConnection} from './Task'
import TeamInvitation from './TeamInvitation'
import TeamMeetingSettings from './TeamMeetingSettings'
import TeamMember from './TeamMember'
import TemplateScale from './TemplateScale'

const Team: GraphQLObjectType = new GraphQLObjectType<ITeam, GQLContext>({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A shortid for the team'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the team. Non-null at v2.22.0+'
    },
    isOnboardTeam: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the team was created when the account was created, else false',
      resolve: ({isOnboardTeam}) => !!isOnboardTeam
    },
    lastMeetingType: {
      type: new GraphQLNonNull(MeetingTypeEnum),
      description: 'The type of the last meeting run'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization to which the team belongs'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'Arbitrary tags that the team uses'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was last updated'
    },
    teamInvitations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamInvitation))),
      description: 'The outstanding invitations to join the team',
      resolve: async (
        {id: teamId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        if (!isTeamMember(authToken, teamId)) return []
        return dataLoader.get('teamInvitationsByTeamId').load(teamId)
      }
    },
    isViewerLead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is the team lead, else false',
      resolve: async (
        {id: teamId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        if (!isTeamMember(authToken, teamId)) return false
        const viewerId = getUserId(authToken)
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
        return !!teamMember.isLead
      }
    },
    meetingSettings: {
      type: new GraphQLNonNull(TeamMeetingSettings),
      args: {
        meetingType: {
          type: new GraphQLNonNull(MeetingTypeEnum),
          description: 'the type of meeting for the settings'
        }
      },
      description: 'The team-specific settings for running all available types of meetings',
      resolve: async (
        {id: teamId}: {id: string},
        {meetingType},
        {authToken, dataLoader}: GQLContext
      ) => {
        // the implicit business logic says client will never request settings for a foregin team
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
      }
    },
    scale: {
      type: TemplateScale,
      description: 'A query for the scale',
      args: {
        scaleId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The scale ID for the desired scale'
        }
      },
      resolve: async (
        {id: teamId}: {id: string},
        {scaleId},
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
        const scale = activeScales.find(({id}: {id: string}) => id === scaleId)
        if (!scale) {
          standardError(new Error('Scale not found'), {userId: viewerId})
          return null
        }
        return scale
      }
    },
    scales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The list of scales this team can use',
      resolve: async ({id: teamId}: {id: string}, _args, {dataLoader}: GQLContext) => {
        const availableScales = await dataLoader
          .get('scalesByTeamId')
          .loadMany([teamId, 'aGhostTeam'])
        return availableScales.filter(isValid).flat()
      }
    },
    qualAIMeetingsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The number of qualifying meetings that have an AI generated summary. Qualifying meetings are meetings with three or more meeting members and five or more reflections'
    },
    meeting: {
      type: NewMeeting,
      description: 'The new meeting in progress, if any',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The unique meetingId'
        }
      },
      resolve: async (
        {id: teamId}: {id: string},
        {meetingId},
        {authToken, dataLoader}: GQLContext
      ) => {
        if (!isTeamMember(authToken, teamId)) return null
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        if (meeting && meeting.teamId === teamId) return meeting
        return null
      }
    },
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: async (
        {id: teamId, orgId}: {id: string; orgId: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        const organization = await dataLoader.get('organizations').loadNonNull(orgId)
        // TODO this is bad, we should probably just put the perms on each field in the org
        if (!isTeamMember(authToken, teamId)) {
          return {
            id: orgId,
            name: organization.name,
            isPaid: organization.isPaid,
            unpaidMessageHTML: organization.unpaidMessageHTML
          }
        }
        return organization
      }
    },
    agendaItems: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItem))),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve(
        {id: teamId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) {
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('agendaItemsByTeamId').load(teamId)
      }
    },
    tasks: {
      type: new GraphQLNonNull(TaskConnection),
      args: {
        first: {
          type: GraphQLInt
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the tasks for this team',
      async resolve(
        {id: teamId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) {
        if (!isTeamMember(authToken, teamId)) {
          const err = new Error('Team not found')
          standardError(err, {tags: {teamId}})
          return connectionFromTasks([], 0, err)
        }
        const viewerId = getUserId(authToken)
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        const tasks = allTasks.filter((task) => {
          if (!task.userId || (isTaskPrivate(task.tags) && task.userId !== viewerId)) return false
          return true
        })
        return connectionFromTasks(tasks)
      }
    },
    teamMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamMember))),
      args: {
        sortBy: {
          type: GraphQLString,
          description: 'the field to sort the teamMembers by'
        }
      },
      description: 'All the team members actively associated with the team',
      async resolve({id: teamId, orgId}, args: any, {authToken, dataLoader}) {
        const viewerId = getUserId(authToken)
        const {sortBy = 'preferredName'} = args as {
          sortBy?: 'preferredName'
        }
        const isBillingLeader = await isUserBillingLeader(viewerId, orgId, dataLoader)
        const canViewAllMembers =
          isBillingLeader || isSuperUser(authToken) || isTeamMember(authToken, teamId)
        if (!canViewAllMembers) return []
        const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
        const teamMembersWithUserFields = await Promise.all(
          teamMembers.map(async (teamMember) => {
            const user = await dataLoader.get('users').loadNonNull(teamMember.userId)
            return {
              ...teamMember,
              preferredName: user.preferredName,
              email: user.email
            }
          })
        )
        teamMembersWithUserFields.sort((a, b) => {
          let [aProp, bProp] = [a[sortBy], b[sortBy]]
          aProp = aProp?.toLowerCase ? aProp.toLowerCase() : aProp
          bProp = bProp?.toLowerCase ? bProp.toLowerCase() : bProp
          return aProp > bProp ? 1 : -1
        })
        return teamMembersWithUserFields
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
})

export default Team
