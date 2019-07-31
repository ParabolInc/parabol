import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const RenameReflectTemplatePayload = new GraphQLObjectType({
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
