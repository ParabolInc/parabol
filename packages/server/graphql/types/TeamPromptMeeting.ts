import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getTeamPromptResponsesByMeetingId} from '../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {getUserId} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import {GQLContext} from '../graphql'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import TeamPromptMeetingMember from './TeamPromptMeetingMember'
import TeamPromptMeetingSettings from './TeamPromptMeetingSettings'
import TeamPromptResponse from './TeamPromptResponse'

const TeamPromptMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptMeeting',
  interfaces: () => [NewMeeting],
  description: 'A team prompt meeting',
  fields: () => ({
    ...newMeetingFields(),
    meetingPrompt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the meeting'
    },
    settings: {
      type: new GraphQLNonNull(TeamPromptMeetingSettings),
      description: 'The settings that govern the team prompt meeting',
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
      }
    },
    responses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamPromptResponse))),
      description: 'The responses created in the meeting',
      resolve: ({id: meetingId}: {id: string}, _args: unknown, {}) => {
        return getTeamPromptResponsesByMeetingId(meetingId)
      }
    },
    viewerMeetingMember: {
      type: TeamPromptMeetingMember,
      description: 'The team prompt meeting member of the viewer',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember || null
      }
    },
    taskCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of tasks generated in the meeting',
      resolve: async ({id: meetingId}, _args: unknown, {dataLoader}: GQLContext) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        if (meeting.meetingType !== 'teamPrompt') {
          return 0
        }
        const {phases} = meeting
        const discussPhase = getPhase(phases, 'RESPONSES')
        const {stages} = discussPhase
        const discussionIds = stages.map((stage) => stage.discussionId)
        const r = await getRethink()
        return r
          .table('Task')
          .getAll(r.args(discussionIds), {index: 'discussionId'})
          .count()
          .default(0)
          .run()
      }
    },
    commentCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: async ({id: meetingId}, _args: unknown, {dataLoader}: GQLContext) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        if (meeting.meetingType !== 'teamPrompt') {
          return 0
        }
        const {phases} = meeting
        const discussPhase = getPhase(phases, 'RESPONSES')
        const {stages} = discussPhase
        const discussionIds = stages.map((stage) => stage.discussionId)
        const r = await getRethink()
        return r
          .table('Comment')
          .getAll(r.args(discussionIds), {index: 'discussionId'})
          .filter({isActive: true})
          .count()
          .default(0)
          .run()
      }
    }
  })
})

export default TeamPromptMeeting
