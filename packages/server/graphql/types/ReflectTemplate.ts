import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import MeetingTemplate, {meetingTemplateFields} from './MeetingTemplate'
import ReflectPrompt from './ReflectPrompt'

const ReflectTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectTemplate',
  description: 'The team-specific templates for the reflection prompts',
  interfaces: () => [MeetingTemplate],
  isTypeOf: ({type}) => (type as MeetingTypeEnum) === 'retrospective',
  fields: () => ({
    ...meetingTemplateFields(),
    prompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts that are part of this template',
      resolve: async ({id: templateId}, _args: unknown, {dataLoader}) => {
        const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
        return prompts
          .filter((prompt: RetrospectivePrompt) => !prompt.removedAt)
          .sort((a: RetrospectivePrompt, b: RetrospectivePrompt) =>
            a.sortOrder < b.sortOrder ? -1 : 1
          )
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: ReflectTemplate.name,
  nodeType: ReflectTemplate
})

export const ReflectTemplateConnection = connectionType
export const ReflectTemplateEdge = edgeType
export default ReflectTemplate
