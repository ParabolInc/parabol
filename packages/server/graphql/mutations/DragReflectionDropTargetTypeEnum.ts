import {GraphQLEnumType} from 'graphql'

const DragReflectionDropTargetTypeEnum = new GraphQLEnumType({
  name: 'DragReflectionDropTargetTypeEnum',
  description: 'The possible places a reflection can be dropped',
  values: {
    REFLECTION_GROUP: {},
    REFLECTION_GRID: {}
  }
})

export default DragReflectionDropTargetTypeEnum
