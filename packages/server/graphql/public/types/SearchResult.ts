import type {SearchResultResolvers} from '../resolverTypes'

const SearchResult: SearchResultResolvers = {
  team: async (parent: any, _: any, context: any) => {
    if (!parent.teamId) return null
    return context.dataLoader.get('teams').load(parent.teamId)
  }
}

export default SearchResult
