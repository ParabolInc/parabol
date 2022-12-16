import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {MeetingTypeEnum as MeetingTypeEnumType} from '../../postgres/types/Meeting'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import ActionMeeting from './ActionMeeting'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import isMeetingLocked from './helpers/isMeetingLocked'
import MeetingMember from './MeetingMember'
import MeetingTypeEnum from './MeetingTypeEnum'
import NewMeetingPhase from './NewMeetingPhase'
import Organization from './Organization'
import PokerMeeting from './PokerMeeting'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'
import TeamMember from './TeamMember'
import TeamPromptMeeting from './TeamPromptMeeting'

export const newMeetingFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The unique meeting id. shortid.'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the meeting was created'
  },
  createdBy: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The id of the user that created the meeting'
  },
  createdByUser: {
    type: new GraphQLNonNull(require('./User').default),
    description: 'The user that created the meeting',
    resolve: ({createdBy}: {createdBy: string}, _args: any, {dataLoader}: GQLContext) => {
      return dataLoader.get('users').load(createdBy)
    }
  },
  endedAt: {
    type: GraphQLISO8601Type,
    description: 'The timestamp the meeting officially ended'
  },
  meetingSeriesId: {
    type: GraphQLID,
    description: 'The id of the meeting series this meeting belongs to'
  },
  scheduledEndTime: {
    type: GraphQLISO8601Type,
    description: 'If meeting has a meeting series associated, this is the time the meeting will end'
  },
  facilitatorStageId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The location of the facilitator in the meeting'
  },
  facilitatorUserId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The userId (or anonymousId) of the most recent facilitator'
  },
  facilitator: {
    type: new GraphQLNonNull(TeamMember),
    description: 'The facilitator team member',
    resolve: (
      {facilitatorUserId, teamId}: {facilitatorUserId: string; teamId: string},
      _args: any,
      {dataLoader}: GQLContext
    ) => {
      const teamMemberId = toTeamMemberId(teamId, facilitatorUserId)
      return dataLoader.get('teamMembers').load(teamMemberId)
    }
  },
  meetingMembers: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MeetingMember))),
    description: 'The team members that were active during the time of the meeting',
    resolve: ({id: meetingId}: {id: string}, _args: any, {dataLoader}: GQLContext) => {
      return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    }
  },
  meetingNumber: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'The auto-incrementing meeting number for the team'
  },
  meetingType: {
    type: new GraphQLNonNull(MeetingTypeEnum)
  },
  name: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The name of the meeting'
  },
  organization: {
    type: new GraphQLNonNull(Organization),
    description: 'The organization this meeting belongs to',
    resolve: async ({teamId}: {teamId: string}, _args: any, {dataLoader}: GQLContext) => {
      const team = await dataLoader.get('teams').loadNonNull(teamId)
      const {orgId} = team
      return dataLoader.get('organizations').load(orgId)
    }
  },
  phases: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingPhase))),
    description: 'The phases the meeting will go through, including all phase-specific state',
    resolve: async (
      {
        phases,
        id: meetingId,
        teamId,
        endedAt
      }: {
        phases: any
        id: string
        teamId: string
        endedAt?: Date | null
      },
      _args: unknown,
      {authToken, dataLoader}: GQLContext
    ) => {
      const viewerId = getUserId(authToken)
      const locked = await isMeetingLocked(viewerId, teamId, endedAt, dataLoader)

      const resolvedPhases = phases.map((phase: any) => ({
        ...phase,
        meetingId,
        teamId
      }))

      if (locked) {
        // make all stages non-navigable so even if the user removes the overlay they cannot see all meeting data
        return resolvedPhases.map((phase: any) => ({
          ...phase,
          stages: phase.stages.map((stage: any) => ({
            ...stage,
            isNavigable: false,
            isNavigableByFacilitator: false
          }))
        }))
      }
      return resolvedPhases
    }
  },
  showConversionModal: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'true if should show the org the conversion modal, else false',
    resolve: ({showConversionModal}: {showConversionModal: boolean}) => !!showConversionModal
  },
  summary: {
    type: GraphQLString,
    description: `The GPT-3 generated summary of all the content in the meeting, such as reflections, tasks, and comments. Undefined if the user doesnt have access to the feature or it's unavailable in this meeting type`
  },
  summarySentAt: {
    type: GraphQLISO8601Type,
    description: 'The time the meeting summary was emailed to the team'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key for team'
  },
  team: {
    type: new GraphQLNonNull(Team),
    description: 'The team that ran the meeting',
    resolve: resolveTeam
  },
  updatedAt: {
    type: GraphQLISO8601Type,
    description: 'The last time a meeting was updated (stage completed, finished, etc)'
  },
  viewerMeetingMember: {
    type: MeetingMember,
    description: 'The meeting member of the viewer',
    resolve: async (
      {id: meetingId}: {id: string},
      _args: any,
      {authToken, dataLoader}: GQLContext
    ) => {
      const viewerId = getUserId(authToken)
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
      return meetingMember || null
    }
  },
  locked: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'Is this locked for personal plans?',
    resolve: async (
      {endedAt, teamId}: {endedAt?: Date | null; teamId: string},
      _args: any,
      {authToken, dataLoader}: GQLContext
    ) => {
      const viewerId = getUserId(authToken)
      return isMeetingLocked(viewerId, teamId, endedAt, dataLoader)
    }
  }
})

const NewMeeting: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: newMeetingFields,
  resolveType: ({meetingType}: {meetingType: MeetingTypeEnumType}) => {
    const resolveTypeLookup = {
      retrospective: RetrospectiveMeeting,
      action: ActionMeeting,
      poker: PokerMeeting,
      teamPrompt: TeamPromptMeeting
    } as const
    return resolveTypeLookup[meetingType as keyof typeof resolveTypeLookup]
  }
})

export default NewMeeting
