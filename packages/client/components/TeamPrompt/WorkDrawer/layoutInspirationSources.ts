import rankServicesByOrgUse from '../../../utils/rankServicesByOrgUse'
import {
  INSPIRATION_SOURCE_CATEGORIES,
  type InspirationSourceService,
  type InspirationSourceSettings
} from './inspirationSources'
import type {InspirationSourceAvailability} from './listInspirationSources'

const ROW_SLOTS = 5

export interface InspirationSourceLayout {
  row: InspirationSourceAvailability[]
  more: InspirationSourceAvailability[]
}

const layoutInspirationSources = (
  sources: readonly InspirationSourceAvailability[],
  kinds: InspirationSourceSettings['kinds'],
  orgServices: readonly string[]
): InspirationSourceLayout => {
  const isIncluded = ({service, isConnected}: InspirationSourceAvailability) =>
    isConnected && kinds[service].length > 0
  const parabol = sources.filter(({service}) => service === 'PARABOL')
  const integrations = sources.flatMap((source) =>
    source.service === 'PARABOL' ? [] : [{...source, service: source.service}]
  )
  const {connected, unconnected} = rankServicesByOrgUse(
    integrations,
    orgServices,
    ({service}) => service
  )
  const isUsedByOrg = (service: InspirationSourceService) => orgServices.includes(service)
  const coveredCategories = new Set(
    integrations
      .filter(({service, isConnected}) => isConnected || isUsedByOrg(service))
      .map(({service}) => INSPIRATION_SOURCE_CATEGORIES[service])
  )
  const suggestions = unconnected.filter(({service}) => {
    if (isUsedByOrg(service)) return true
    const category = INSPIRATION_SOURCE_CATEGORIES[service]
    if (coveredCategories.has(category)) return false
    coveredCategories.add(category)
    return true
  })
  const substitutes = unconnected.filter((source) => !suggestions.includes(source))
  const ranked = [
    ...parabol,
    ...connected.filter(isIncluded),
    ...connected.filter((source) => !isIncluded(source)),
    ...suggestions,
    ...substitutes
  ]
  const lastIncludedIdx = ranked.findLastIndex(isIncluded)
  const rowSize = Math.max(ROW_SLOTS - 1, lastIncludedIdx + 1)
  if (ranked.length - rowSize <= 1) return {row: ranked, more: []}
  return {row: ranked.slice(0, rowSize), more: ranked.slice(rowSize)}
}

export default layoutInspirationSources
