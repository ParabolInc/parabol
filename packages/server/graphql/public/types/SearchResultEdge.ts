import {GraphQLError} from 'graphql'
import type {EmbeddingTypeEnum, SearchMatchScore} from '../resolverTypes'
import type {ReqResolvers} from './ReqResolvers'

export type SearchResultEdgeSource = {
  nodeTypeName: EmbeddingTypeEnum
  nodeId: string | number
  score: SearchMatchScore
  snippets: string[]
}

const SearchResultEdge: ReqResolvers<'SearchResultEdge'> = {
  node: async ({nodeTypeName, nodeId}, _args, {dataLoader}) => {
    if (nodeTypeName === 'page') {
      const pageData = await dataLoader.get('pages').loadNonNull(nodeId as number)
      return {
        ...pageData,
        __typename: 'Page'
      }
    }

    if (nodeTypeName === 'retrospectiveDiscussionTopic') {
      // Assuming 'Discussion' is the name of the type in your schema/generated types
      const discussionData = await dataLoader.get('discussions').loadNonNull(nodeId as string)
      return {
        ...discussionData,
        __typename: 'Discussion'
      }
    }

    if (nodeTypeName === 'meetingTemplate') {
      const templateData = await dataLoader.get('meetingTemplates').loadNonNull(nodeId as string)
      const {type} = templateData
      const meetingTypeToTemplateType = {
        action: 'FixedActivity',
        poker: 'PokerTemplate',
        retrospective: 'ReflectTemplate',
        teamPrompt: 'FixedActivity'
      } as const
      return {
        ...templateData,
        __typename: meetingTypeToTemplateType[type]
      }
    }

    throw new GraphQLError(`Invalid nodeTypeName: ${nodeTypeName}`)
  }
}

export default SearchResultEdge
