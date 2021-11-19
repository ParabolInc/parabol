import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import ChangeSourceEnum from './ChangeSourceEnum'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const TaskEstimate = new GraphQLObjectType<any, GQLContext>({
  name: 'TaskEstimate',
  description: 'An estimate for a Task that was voted on and scored in a poker meeting',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the estimate'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the estimate was created'
    },
    changeSource: {
      type: new GraphQLNonNull(ChangeSourceEnum),
      description: 'The source that a change came in through'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the estimate dimension'
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The human-readable label for the estimate',
      resolve: ({label}) => label || ''
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The taskId that the estimate refers to'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId that added the estimate'
    },
    meetingId: {
      type: GraphQLID,
      description: '*The meetingId that the estimate occured in, if any'
    },
    stageId: {
      type: GraphQLID,
      description: 'The meeting stageId the estimate occurred in, if any'
    },
    discussionId: {
      type: GraphQLID,
      description: 'The discussionId where the estimated was discussed'
    },
    jiraFieldId: {
      type: GraphQLID,
      description: 'If the task comes from jira, this is the jira field that the estimate refers to'
    }
  })
})
export default TaskEstimate
