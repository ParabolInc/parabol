import dayjs from 'dayjs'
import {useState} from 'react'
import type {useInspirationSourceAvailability_teamMember$key} from '../../../__generated__/useInspirationSourceAvailability_teamMember.graphql'
import useLocalStorageState from '../../../hooks/useLocalStorageState'
import buildInspirationSearchQuery from './buildInspirationSearchQuery'
import {
  DEFAULT_INSPIRATION_SOURCE_SETTINGS,
  type InspirationSourceSettings,
  withInspirationSourceDefaults
} from './inspirationSources'
import useInspirationDraft from './useInspirationDraft'
import useInspirationSourceAvailability from './useInspirationSourceAvailability'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Options {
  meetingId: string
  teamMemberRef: useInspirationSourceAvailability_teamMember$key | null | undefined
  isOrgAIEnabled: boolean
  dateRange: WorkDrawerDateRange | undefined
  instructionsKey: string
  lifespanMs?: number
}

const useInspirationSourceDraft = (options: Options) => {
  const {meetingId, teamMemberRef, isOrgAIEnabled, dateRange, instructionsKey, lifespanMs} = options
  const availability = useInspirationSourceAvailability(teamMemberRef)
  const [storedSettings, setStoredSettings] = useLocalStorageState<
    Partial<InspirationSourceSettings>
  >('Inspiration:sources', DEFAULT_INSPIRATION_SOURCE_SETTINGS)
  const settings = withInspirationSourceDefaults(storedSettings)
  const setSettings = (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) =>
    setStoredSettings((prev) => update(withInspirationSourceDefaults(prev)))
  const [instructions, setInstructions] = useLocalStorageState(instructionsKey, '')
  const aiOffMessage = !window.__ACTION__.hasOpenAI
    ? 'AI drafting is turned off for this Parabol instance. Ask your org admin to turn it on.'
    : !isOrgAIEnabled
      ? 'AI drafting is turned off for your organization. Ask your org admin to turn it on.'
      : null
  const canDraft = !aiOffMessage

  // Whole days, so a reload builds the same searches and keeps the stored draft
  const [anyTimeRange] = useState(() => ({
    startAt: dayjs().subtract(2, 'week').startOf('day').toISOString(),
    endAt: dayjs().endOf('day').toISOString()
  }))
  const draftRange = dateRange ?? anyTimeRange
  const sources = availability
    .filter(({service, isConnected}) => isConnected && settings.kinds[service].length > 0)
    .map(({service}) => ({
      service,
      searchQuery: buildInspirationSearchQuery(service, settings, draftRange)
    }))
  const {draft, requestRedraft, drafting, error, hasOlder, loadOlder, loadingOlder, olderError} =
    useInspirationDraft({
      meetingId,
      isMeetingMember: !!teamMemberRef,
      sources,
      instructions: canDraft ? instructions : '',
      lifespanMs
    })
  const draftedIssues = draft?.issues ?? []
  const draftedQueries = new Map(
    (draft?.sources ?? []).map(({service, searchQuery}) => [service, searchQuery])
  )
  const countingServices = drafting
    ? sources.flatMap(({service, searchQuery}) =>
        draftedQueries.get(service) === searchQuery ? [] : [service]
      )
    : []
  const issueCounts = Object.fromEntries(
    (draft?.sources ?? []).map(({service}) => [
      service,
      draftedIssues.filter((issue) => issue.service === service).length
    ])
  )
  return {
    availability,
    settings,
    setSettings,
    instructions,
    setInstructions,
    aiOffMessage,
    canDraft,
    draftRange,
    draft,
    requestRedraft,
    drafting,
    error,
    hasOlder,
    loadOlder,
    loadingOlder,
    olderError,
    issueCounts,
    countingServices
  }
}

export default useInspirationSourceDraft
