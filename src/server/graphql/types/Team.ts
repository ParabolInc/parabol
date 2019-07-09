import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import {GQLContext} from 'server/graphql/graphql'
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks'
import {resolveOrganization} from 'server/graphql/resolvers'
import AgendaItem from 'server/graphql/types/AgendaItem'
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import NewMeeting from 'server/graphql/types/NewMeeting'
import Organization from 'server/graphql/types/Organization'
import {TaskConnection} from 'server/graphql/types/Task'
import TeamInvitation from 'server/graphql/types/TeamInvitation'
import TeamMeetingSettings from 'server/graphql/types/TeamMeetingSettings'
import TeamMember from 'server/graphql/types/TeamMember'
import TierEnum from 'server/graphql/types/TierEnum'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import {ITeam} from 'universal/types/graphql'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {signMassInviteToken} from 'server/utils/massInviteToken'

const Team = new GraphQLObjectType<ITeam, GQLContext>({
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
    // isActive: {
    //   type: GraphQLBoolean,
    //   description: 'true if the team is active, false if it is in the archive'
    // },
    massInviteToken: {
      type: GraphQLID,
      description:
        'a user-specific token that allows anyone who uses it within 24 hours to join the team',
      resolve: ({id: teamId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return isTeamMember(authToken, teamId) ? signMassInviteToken(teamId, viewerId) : null
      }
    },
    isPaid: {
      type: GraphQLBoolean,
      description:
        'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
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
    customPhaseItems: {
      type: new GraphQLList(CustomPhaseItem),
      resolve: ({id: teamId}, _args, {dataLoader}) => {
        // not useful for retros since there is no templateId filter
        return dataLoader.get('customPhaseItemsByTeamId').load(teamId)
      }
    },
    meetingId: {
      type: GraphQLID,
      description: 'The unique Id of the active meeting'
    },
    teamInvitations: {
      type: new GraphQLList(new GraphQLNonNull(TeamInvitation)),
      description: 'The outstanding invitations to join the team',
      resolve: async ({id: teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teamInvitationsByTeamId').load(teamId)
      }
    },
    isLead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is the team lead, else false',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
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
      resolve: async ({id: teamId}, {meetingType}, {dataLoader}) => {
        const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId)
        return allSettings.find((settings) => settings.meetingType === meetingType)
      }
    },
    activeMeetings: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeeting))),
      description: 'a list of meetings that are currently in progress',
      resolve: ({id: teamId}, _args, {dataLoader}) => {
        return dataLoader.get('activeMeetingsByTeamId').load(teamId)
      }
    },
    newMeeting: {
      type: NewMeeting,
      description: 'The new meeting in progress, if any',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        if (meetingId) {
          return dataLoader.get('newMeetings').load(meetingId)
        }
        return null
      }
    },
    tier: {
      type: TierEnum,
      description: 'The level of access to features on the parabol site'
    },
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    agendaItems: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItem))),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve ({id: teamId}, _args, {dataLoader}) {
        return dataLoader.get('agendaItemsByTeamId').load(teamId)
      }
    },
    tasks: {
      type: new GraphQLNonNull(TaskConnection),
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the tasks for this team',
      async resolve ({id: teamId}, _args, {authToken, dataLoader}) {
        if (!isTeamMember(authToken, teamId)) {
          standardError(new Error('Team not found'))
          return []
        }
        const tasks = await dataLoader.get('tasksByTeamId').load(teamId)
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
      async resolve ({id: teamId}, {sortBy = 'preferredName'}, {dataLoader}) {
        const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
        teamMembers.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))
        return teamMembers
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
})

export default Team
