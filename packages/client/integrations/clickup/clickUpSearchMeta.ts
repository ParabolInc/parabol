import {searchFiltersByKey, toSearchFilters} from '../platform/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const clickUpSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {listIds} = parseSavedMetaObject(meta)
    return {isAdvancedQuery: false, filters: toSearchFilters('listIds', listIds)}
  },
  serializeMeta: (state) => JSON.stringify({listIds: searchFiltersByKey(state.filters, 'listIds')})
}

export default clickUpSearchMeta
