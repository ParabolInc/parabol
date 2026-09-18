import type {IntegrationSearchFilter} from '../platform/IntegrationSearchFilter'

const searchFilterKeyByTypename: Record<string, string> = {
  _xLinearProject: 'project',
  _xLinearTeam: 'team'
}

const toLinearSearchFilters = (itemIds: readonly string[]) =>
  itemIds.flatMap<IntegrationSearchFilter>((itemId) => {
    const [typeName, value] = itemId.split(':')
    const key = typeName ? searchFilterKeyByTypename[typeName] : undefined
    return key && value ? [{key, value}] : []
  })

export default toLinearSearchFilters
