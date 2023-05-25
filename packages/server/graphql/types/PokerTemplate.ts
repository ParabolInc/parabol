// Can remove this file when there are no more references to PokerTemplate
import {GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'

const PokerTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerTemplate',
  fields: {}
})

const {connectionType} = connectionDefinitions({
  name: PokerTemplate.name,
  nodeType: PokerTemplate
})

export const PokerTemplateConnection = connectionType
export default PokerTemplate
