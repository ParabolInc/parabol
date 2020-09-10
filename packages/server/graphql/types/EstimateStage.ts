import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import Task from './Task'

const EstimateStage = new GraphQLObjectType<any, GQLContext, any>({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    taskId: {
      type: GraphQLNonNull(GraphQLID)
    },
    task: {
      type: GraphQLNonNull(Task),
      description: 'the task that is being assigned story points',
      resolve: ({taskId}, _args, {dataLoader}) => {
        return dataLoader.get('tasks').load(taskId)
      }
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for reprioritizing discussion topics'
    }
  })
})

export default EstimateStage
