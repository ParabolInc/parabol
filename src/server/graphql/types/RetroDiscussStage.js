import {GraphQLID, GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import {makeResolve} from 'server/graphql/resolvers'

const RetroDiscussStage = new GraphQLObjectType({
  name: 'RetroDiscussStage',
  description: 'The stage where the team discusses a single theme',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    reflectionGroupId: {
      type: GraphQLID,
      description: 'foreign key. use reflectionGroup'
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      description: 'the group that is the focal point of the discussion',
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    }
  })
})

export default RetroDiscussStage
