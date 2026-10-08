import {searchFiltersByKey, toSearchFilters} from '../platform/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const linearSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {projectIds, teamIds} = parseSavedMetaObject(meta)
    return {
      isAdvancedQuery: false,
      filters: [...toSearchFilters('project', projectIds), ...toSearchFilters('team', teamIds)]
    }
  },
  serializeMeta: (state) =>
    JSON.stringify({
      projectIds: searchFiltersByKey(state.filters, 'project'),
      teamIds: searchFiltersByKey(state.filters, 'team')
    })
}

export default linearSearchMeta
