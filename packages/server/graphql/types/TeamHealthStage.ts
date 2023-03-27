import {GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import TeamHealthStageDB from '../../database/types/TeamHealthStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {GQLContext} from '../graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TeamHealthUserScore from './TeamHealthUserScore'

const TeamHealthStage: GraphQLObjectType<TeamHealthStageDB, GQLContext> = new GraphQLObjectType<
  TeamHealthStageDB,
  GQLContext
>({
  name: 'TeamHealthStage',
  description: 'A stage that focuses on a single team health question',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'TEAM_HEALTH',
  fields: () =>
    ({
      ...newMeetingStageFields(),
      question: {
        type: new GraphQLNonNull(GraphQLString)
      },
      labels: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString)))
      },
      scores: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamHealthUserScore))),
        description: 'all the estimates, 1 per user',
        resolve: ({id: stageId, scores}: TeamHealthStageDB) => {
          return (
            scores?.map((score) => ({
              ...score,
              stageId
            })) ?? []
          )
        }
      }
    } as any)
})

export default TeamHealthStage
