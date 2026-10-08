export interface IntegrationSearchFilter {
  key: string
  value: string
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

export const normalizeSearchFilters = (filters: readonly IntegrationSearchFilter[]) => {
  const seen = new Set<string>()
  return [...filters]
    .sort((a, b) => (a.key === b.key ? compare(a.value, b.value) : compare(a.key, b.key)))
    .filter(({key, value}) => {
      const id = `${key}:${value}`
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
}

export const searchFiltersByKey = (filters: readonly IntegrationSearchFilter[], key: string) =>
  filters.filter((filter) => filter.key === key).map(({value}) => value)

export const toSearchFilters = (key: string, values: unknown): IntegrationSearchFilter[] =>
  Array.isArray(values)
    ? values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => ({key, value}))
    : []

export const toggleSearchFilter = (
  filters: readonly IntegrationSearchFilter[],
  key: string,
  value: string
) => {
  const isSelected = filters.some((filter) => filter.key === key && filter.value === value)
  return isSelected
    ? filters.filter((filter) => filter.key !== key || filter.value !== value)
    : [...filters, {key, value}]
}
