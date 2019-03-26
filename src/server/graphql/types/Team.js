import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks'
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum'
import AgendaItem from 'server/graphql/types/AgendaItem'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import MeetingGreeting from 'server/graphql/types/MeetingGreeting'
import Organization from 'server/graphql/types/Organization'
import {TaskConnection} from 'server/graphql/types/Task'
import TeamMember from 'server/graphql/types/TeamMember'
import TierEnum from 'server/graphql/types/TierEnum'
import {resolveOrganization} from 'server/graphql/resolvers'
import SoftTeamMember from 'server/graphql/types/SoftTeamMember'
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem'
import NewMeeting from 'server/graphql/types/NewMeeting'
import TeamMeetingSettings from 'server/graphql/types/TeamMeetingSettings'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import TeamInvitation from 'server/graphql/types/TeamInvitation'
import standardError from 'server/utils/standardError'
import AtlassianProject from 'server/graphql/types/AtlassianProject'
import AtlassianAuth from 'server/graphql/types/AtlassianAuth'

const Team = new GraphQLObjectType({
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
    isPaid: {
      type: GraphQLBoolean,
      description:
        'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
    },
    meetingNumber: {
      type: GraphQLInt,
      description:
        'The current or most recent meeting number (also the number of meetings the team has had'
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
    /* Ephemeral meeting state */
    checkInGreeting: {
      type: MeetingGreeting,
      description: 'The checkIn greeting (fun language)'
    },
    checkInQuestion: {
      type: GraphQLString,
      description: 'The checkIn question of the week'
    },
    customPhaseItems: {
      type: new GraphQLList(CustomPhaseItem),
      resolve: ({id: teamId}, args, {dataLoader}) => {
        // not useful for retros since there is no templateId filter
        return dataLoader.get('customPhaseItemsByTeamId').load(teamId)
      }
    },
    meetingId: {
      type: GraphQLID,
      description: 'The unique Id of the active meeting'
    },
    activeFacilitator: {
      type: GraphQLID,
      description: 'The current facilitator teamMemberId for this meeting'
    },
    facilitatorPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The phase of the facilitator'
    },
    facilitatorPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the facilitator, 1-indexed'
    },
    teamInvitations: {
      type: new GraphQLList(new GraphQLNonNull(TeamInvitation)),
      description: 'The outstanding invitations to join the team',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        return dataLoader.get('teamInvitationsByTeamId').load(teamId)
      }
    },
    isLead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is the team lead, else false',
      resolve: async ({id: teamId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
        return !!teamMember.isLead
      }
    },
    meetingPhase: {
      type: ActionMeetingPhaseEnum,
      description:
        'The phase of the meeting, usually matches the facilitator phase, be could be further along'
    },
    meetingPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the meeting, 1-indexed'
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
    newMeeting: {
      type: NewMeeting,
      description: 'The new meeting in progress, if any',
      resolve: ({meetingId, activeFacilitator}, args, {dataLoader}) => {
        if (meetingId && !activeFacilitator) {
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
      async resolve ({id: teamId}, args, {dataLoader}) {
        const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
        agendaItems.sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
        return agendaItems
      }
    },
    tasks: {
      type: TaskConnection,
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the tasks for this team',
      async resolve ({id: teamId}, args, {authToken, dataLoader}) {
        if (!isTeamMember(authToken, teamId)) {
          standardError(new Error('Team not found'))
          return null
        }
        const tasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return connectionFromTasks(tasks)
      }
    },
    softTeamMembers: {
      type: new GraphQLList(SoftTeamMember),
      description: 'All the soft team members actively associated with the team',
      async resolve ({id: teamId}, args, {dataLoader}) {
        const softTeamMembers = await dataLoader.get('softTeamMembersByTeamId').load(teamId)
        softTeamMembers.sort((a, b) => (a.preferredName > b.preferredName ? 1 : -1))
        return softTeamMembers
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
    },
    atlassianAuth: {
      type: AtlassianAuth,
      description: 'The auth for the viewer',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const auths = dataLoader.get('atlassianAuthByUserId').load(viewerId)
        return auths.filter((auth) => auth.teamId === teamId)
      }
    },
    atlassianProjects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AtlassianProject))),
      description: 'A list of projects integrated with the team',
      resolve: ({id: teamId}, args, {dataLoader}) => {
        return dataLoader.get('atlassianProjectsByTeamId').load(teamId)
      }
    }
  })
})

export default Team
