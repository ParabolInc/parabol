import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import MeetingTemplate, {meetingTemplateFields} from './MeetingTemplate'
import TemplateDimension from './TemplateDimension'

const PokerTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerTemplate',
  description: 'The team-specific templates for sprint poker meeting',
  interfaces: () => [MeetingTemplate],
  isTypeOf: ({type}) => (type as MeetingTypeEnum) === 'poker',
  fields: () => ({
    ...meetingTemplateFields(),
    dimensions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateDimension))),
      description: 'The dimensions that are part of this template',
      resolve: async ({id: templateId}, _args: unknown, {dataLoader}) => {
        const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
        return dimensions.filter(({removedAt}) => !removedAt)
      }
    },
    dimension: {
      type: new GraphQLNonNull(TemplateDimension),
      description: 'A query for the dimension',
      args: {
        dimensionId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The dimension ID for the desired dimension'
        }
      },
      async resolve({id: templateId}, {dimensionId}, {authToken, dataLoader}: GQLContext) {
        const viewerId = getUserId(authToken)
        const template = await dataLoader.get('meetingTemplates').load(templateId)
        const {teamId} = template
        if (!isTeamMember(authToken, teamId)) {
          return standardError(new Error('Team not found'), {userId: viewerId})
        }
        const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)
        const dimension = dimensions.filter(({id}: {id: string}) => id === dimensionId)
        if (!dimension) {
          return standardError(new Error('Dimension not found'), {userId: viewerId})
        }
        return dimension
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: PokerTemplate.name,
  nodeType: PokerTemplate
})

export const PokerTemplateConnection = connectionType
export const PokerTemplateEdge = edgeType
export default PokerTemplate
