import type {IntegrationSearchFilter} from '../shared/integrations/IntegrationSearchFilter'

const searchFilterKeyByTypename: Record<string, string> = {
  _xLinearProject: 'project',
  _xLinearTeam: 'team'
}

export const getLinearSelectorItemId = (item: {__typename?: string | null; id: string}) =>
  `${item.__typename ?? 'UnknownType'}:${item.id}`

export const toLinearSearchFilters = (itemIds: readonly string[]) =>
  itemIds.flatMap<IntegrationSearchFilter>((itemId) => {
    const [typeName, value] = itemId.split(':')
    const key = typeName ? searchFilterKeyByTypename[typeName] : undefined
    return key && value ? [{key, value}] : []
  })
