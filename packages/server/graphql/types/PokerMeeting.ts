import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {Logger} from '../../utils/Logger'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'
import PokerMeetingMember from './PokerMeetingMember'
import Task from './Task'

const PokerMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeeting',
  interfaces: () => [NewMeeting],
  description: 'A Poker meeting',
  fields: () => ({
    commentCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: ({commentCount}) => commentCount || 0
    },
    meetingMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PokerMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    storyCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of stories scored during a meeting',
      resolve: ({storyCount}) => storyCount || 0
    },
    story: {
      type: Task,
      description: 'A single story created in a Sprint Poker meeting',
      args: {
        storyId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async ({id: meetingId}, {storyId: taskId}, {dataLoader}) => {
        const task = await dataLoader.get('tasks').loadNonNull(taskId)
        if (task.meetingId !== meetingId) {
          Logger.log('naughty storyId supplied to PokerMeeting')
          return null
        }
        return task
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      deprecationReason: 'The underlying template could be mutated. Use templateRefId',
      description:
        'The ID of the template used for the meeting. Note the underlying template could have changed!'
    },
    templateRefId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the immutable templateRef used for the meeting'
    },
    viewerMeetingMember: {
      type: PokerMeetingMember,
      description: 'The Poker meeting member of the viewer',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember || null
      }
    }
  })
})

export default PokerMeeting
