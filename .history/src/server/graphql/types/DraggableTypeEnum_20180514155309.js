import {GraphQLEnumType} from 'graphql'
import {MEETING, TEAM_DASH, USER_DASH} from 'universal/utils/constants'

const DraggableTypeEnum = new GraphQLEnumType({
  name: 'DraggableTypeEnum',
  description: 'The type of entity that is being dragged',
  values: {
    [REFLECTION_CARD]: {}
  }
})

export default DraggableTypeEnum
