import {GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import type {GQLContext} from '../graphql'

const ReflectTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectTemplate',
  fields: {}
})

const {connectionType} = connectionDefinitions({
  name: ReflectTemplate.name,
  nodeType: ReflectTemplate
})

export const ReflectTemplateConnection = connectionType
export default ReflectTemplate
