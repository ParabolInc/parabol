import {
  searchFiltersByKey,
  toSearchFilters
} from '../../shared/integrations/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const gitHubSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {repos} = parseSavedMetaObject(meta)
    return {isAdvancedQuery: false, filters: toSearchFilters('repo', repos)}
  },
  serializeMeta: (state) => JSON.stringify({repos: searchFiltersByKey(state.filters, 'repo')})
}

export default gitHubSearchMeta
