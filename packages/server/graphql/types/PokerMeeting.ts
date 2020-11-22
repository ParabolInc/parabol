import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import EstimatePhase from '../../database/types/EstimatePhase'
import {getUserId} from '../../utils/authorization'
import getJiraCloudIdAndKey from '../../../client/utils/getJiraCloudIdAndKey'
import {GQLContext} from '../graphql'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import PokerMeetingMember from './PokerMeetingMember'
import PokerMeetingSettings from './PokerMeetingSettings'
import Story from './Story'

const PokerMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeeting',
  interfaces: () => [NewMeeting],
  description: 'A Poker meeting',
  fields: () => ({
    ...newMeetingFields(),
    commentCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: ({commentCount}) => commentCount || 0
    },
    meetingMembers: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(PokerMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    storyCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of stories scored during a meeting',
      resolve: ({storyCount}) => storyCount || 0
    },
    settings: {
      type: GraphQLNonNull(PokerMeetingSettings),
      description: 'The settings that govern the Poker meeting',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        return dataLoader
          .get('meetingSettingsByType')
          .load({teamId, meetingType: MeetingTypeEnum.poker})
      }
    },
    story: {
      type: Story,
      description: 'A single story created in a Sprint Poker meeting',
      args: {
        storyId: {
          type: GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async ({phases, teamId}, {storyId: serviceTaskId}, {dataLoader}) => {
        const estimatePhase = phases.find(
          (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
        ) as EstimatePhase
        const {stages} = estimatePhase
        const stage = stages.find((stage) => stage.serviceTaskId === serviceTaskId)
        if (!stage) return null
        const {creatorUserId, service} = stage
        if (service === 'jira') {
          const [cloudId, issueKey] = getJiraCloudIdAndKey(serviceTaskId)
          const res = await dataLoader
            .get('jiraIssue')
            .load({teamId, userId: creatorUserId, cloudId, issueKey})
          return res
        } else {
          return dataLoader.get('tasks').load(serviceTaskId)
        }
      }
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    },
    templateId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the template used for the meeting'
    },
    viewerMeetingMember: {
      type: GraphQLNonNull(PokerMeetingMember),
      description: 'The Poker meeting member of the viewer',
      resolve: ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return dataLoader.get('meetingMembers').load(meetingMemberId)
      }
    }
  })
})

export default PokerMeeting
