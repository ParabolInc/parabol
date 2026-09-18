import {searchFiltersByKey, toSearchFilters} from '../platform/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const gitLabSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {projectIds} = parseSavedMetaObject(meta)
    return {isAdvancedQuery: false, filters: toSearchFilters('project', projectIds)}
  },
  serializeMeta: (state) =>
    JSON.stringify({projectIds: searchFiltersByKey(state.filters, 'project')})
}

export default gitLabSearchMeta
