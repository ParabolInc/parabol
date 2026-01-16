import {GraphQLError} from 'graphql'
import type {SearchMatchScore} from '../resolverTypes'
import type {ReqResolvers} from './ReqResolvers'

export type SearchResultEdgeSource = {
  nodeTypeName: 'Page' | 'Discussion' | 'MeetingTemplate'
  nodeId: string | number
  score: SearchMatchScore
  snippets: string[]
  cursor: string
}

const SearchResultEdge: ReqResolvers<'SearchResultEdge'> = {
  node: async ({nodeTypeName, nodeId}, _args, {dataLoader}) => {
    const dbNode = await (async () => {
      switch (nodeTypeName) {
        case 'Page':
          return dataLoader.get('pages').loadNonNull(nodeId as number)
        case 'Discussion':
          return dataLoader.get('discussions').loadNonNull(nodeId as string)
        case 'MeetingTemplate':
          return dataLoader.get('meetingTemplates').loadNonNull(nodeId as string)
        default:
          throw new GraphQLError(`Invalid nodeTypeName: ${nodeTypeName}`)
      }
    })()
    return {
      ...dbNode,
      __typename: nodeTypeName
    }
  }
}

export default SearchResultEdge
