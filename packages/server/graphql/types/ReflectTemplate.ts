import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import ReflectPrompt from './ReflectPrompt'

const ReflectTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectTemplate',
  description: 'The team-specific templates for the reflection prompts',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if template can be used, else false'
    },
    lastUsedAt: {
      type: GraphQLISO8601Type,
      description: 'The time of the meeting the template was last used'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the template'
    },
    prompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts that are part of this template',
      resolve: async ({id: promptTemplateId, templateId}, _args, {dataLoader}) => {
        if (templateId === promptTemplateId) {
          const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
          prompts.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
          return prompts
        }
        return []
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*Foreign key. The team this template belongs to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    }
  })
})

export default ReflectTemplate
