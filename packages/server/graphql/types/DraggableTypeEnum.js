import {GraphQLEnumType} from 'graphql'
import {REFLECTION_CARD} from '../../../client/utils/constants'

const DraggableTypeEnum = new GraphQLEnumType({
  name: 'DraggableTypeEnum',
  description: 'The type of entity that is being dragged',
  values: {
    [REFLECTION_CARD]: {}
  }
})

export default DraggableTypeEnum
