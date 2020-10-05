import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import EstimateStage, {estimateStageFields} from './EstimateStage'
import NewMeetingStage from './NewMeetingStage'
import Task from './Task'

const EstimateStageParabol = new GraphQLObjectType<any, GQLContext>({
  name: 'EstimateStageParabol',
  description: 'The stage where the team estimates & discusses a single jira issue',
  interfaces: () => [NewMeetingStage, EstimateStage],
  isTypeOf: ({service}) => service === 'PARABOL',
  fields: () => ({
    ...estimateStageFields(),
    task: {
      type: GraphQLNonNull(Task),
      description: 'the Parabol task',
      resolve: async ({serviceTaskId}, _args, {dataLoader}) => {
        const task = await dataLoader.get('tasks').load(serviceTaskId)
        return task
      }
    }
  })
})

export default EstimateStageParabol
