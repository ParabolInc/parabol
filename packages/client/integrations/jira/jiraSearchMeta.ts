import {searchFiltersByKey, toSearchFilters} from '../platform/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const jiraSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {isJQL, projectKeyFilters} = parseSavedMetaObject(meta)
    return {isAdvancedQuery: isJQL === true, filters: toSearchFilters('project', projectKeyFilters)}
  },
  serializeMeta: (state) =>
    JSON.stringify({
      isJQL: state.isAdvancedQuery,
      projectKeyFilters: searchFiltersByKey(state.filters, 'project')
    })
}

export default jiraSearchMeta
