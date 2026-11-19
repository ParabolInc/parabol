import inspirationSourceFilterQuery, {
  type InspirationSourceFilterQuery
} from '../../../__generated__/InspirationSourceFilterQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import InspirationSourceFilter from './InspirationSourceFilter'
import type {InspirationSourceService, InspirationSourceSettings} from './inspirationSources'

const INSPIRATION_FILTER_SERVICES = ['github', 'jira', 'linear', 'azureDevOps', 'clickup'] as const

export type InspirationFilterService = (typeof INSPIRATION_FILTER_SERVICES)[number]

export const isInspirationFilterService = (
  service: InspirationSourceService
): service is InspirationFilterService =>
  INSPIRATION_FILTER_SERVICES.some((filterService) => filterService === service)

interface Props {
  service: InspirationFilterService
  teamId: string
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
}

const InspirationSourceFilterRoot = (props: Props) => {
  const {service, teamId, settings, setSettings} = props
  const queryRef = useQueryLoaderNow<InspirationSourceFilterQuery>(inspirationSourceFilterQuery, {
    teamId,
    isGitHub: service === 'github',
    isJira: service === 'jira',
    isLinear: service === 'linear',
    isAzureDevOps: service === 'azureDevOps',
    isClickUp: service === 'clickup'
  })
  if (!queryRef) return null
  return (
    <InspirationSourceFilter
      service={service}
      settings={settings}
      setSettings={setSettings}
      queryRef={queryRef}
    />
  )
}

export default InspirationSourceFilterRoot
