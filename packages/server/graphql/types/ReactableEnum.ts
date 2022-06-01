import {GraphQLEnumType} from 'graphql'

const ReactableEnum = new GraphQLEnumType({
  name: 'ReactableEnum',
  description: 'The type of reactable',
  values: {
    COMMENT: {},
    REFLECTION: {},
    RESPONSE: {}
  }
})

export type ReactableEnumType = 'COMMENT' | 'REFLECTION' | 'RESPONSE'

export default ReactableEnum
