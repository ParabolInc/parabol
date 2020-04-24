import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import ReflectTemplate from './ReflectTemplate'
import {GQLContext} from '../graphql'

const RenameReflectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenameReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: ReflectTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    }
  })
})

export default RenameReflectTemplatePayload
