import {
  searchFiltersByKey,
  toSearchFilters
} from '../../shared/integrations/IntegrationSearchFilter'
import parseSavedMetaObject from '../platform/parseSavedMetaObject'
import type {SearchMetaCodec} from '../platform/ScopingSearchState'

const azureDevOpsSearchMeta: SearchMetaCodec = {
  parseSavedMeta: (meta) => {
    const {isWIQL, projectNames} = parseSavedMetaObject(meta)
    return {isAdvancedQuery: isWIQL === true, filters: toSearchFilters('project', projectNames)}
  },
  serializeMeta: (state) =>
    JSON.stringify({
      isWIQL: state.isAdvancedQuery,
      projectNames: searchFiltersByKey(state.filters, 'project')
    })
}

export default azureDevOpsSearchMeta
