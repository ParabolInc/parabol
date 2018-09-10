import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import ReflectTemplate from './ReflectTemplate'

const AddReflectTemplatePayload = new GraphQLObjectType({
  name: 'AddReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: new GraphQLNonNull(ReflectTemplate),
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    }
  })
})

export default AddReflectTemplatePayload
