import {GraphQLEnumType} from 'graphql'

export const REFLECTION_GRID = 'REFLECTION_GRID'
export const REFLECTION_GROUP = 'REFLECTION_GROUP'

const DragReflectionDropTargetTypeEnum = new GraphQLEnumType({
  name: 'DragReflectionDropTargetTypeEnum',
  description: 'The possible places a reflection can be dropped',
  values: {
    [REFLECTION_GROUP]: {},
    [REFLECTION_GRID]: {}
  }
})

export default DragReflectionDropTargetTypeEnum
