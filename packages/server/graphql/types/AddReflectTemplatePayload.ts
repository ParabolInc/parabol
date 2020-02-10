import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import ReflectTemplate from './ReflectTemplate'
import {GQLContext} from '../graphql'

const AddReflectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReflectTemplatePayload',
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

export default AddReflectTemplatePayload
