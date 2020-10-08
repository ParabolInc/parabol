import {GraphQLFloat, GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TaskServiceEnum from './TaskServiceEnum'
import EstimateUserScore from './EstimateUserScore'

export const estimateStageFields = () => ({
  ...newMeetingStageFields(),
  service: {
    type: TaskServiceEnum,
    description: 'The service the task is connected to. If null, it is parabol'
  },
  serviceTaskId: {
    type: GraphQLNonNull(GraphQLID),
    description: 'The stringified JSON used to fetch the task used by the service'
  },
  sortOrder: {
    type: new GraphQLNonNull(GraphQLFloat),
    description: 'The sort order for reprioritizing discussion topics'
  },
  dimensionId: {
    type: GraphQLID,
    description: 'the dimensionId that corresponds to this stage'
  },
  scores: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(EstimateUserScore))),
    resolve: ({id: stageId, scores}) => {
      return scores.map((score) => ({
        ...score,
        stageId
      }))
    }
  }
})

const EstimateStage = new GraphQLInterfaceType({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...estimateStageFields()
  })
})

export default EstimateStage
