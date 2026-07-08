import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useCallback, useState} from 'react'
import {useFragment} from 'react-relay'
import type {useInspirationDrawer_meeting$key} from '../__generated__/useInspirationDrawer_meeting.graphql'
import {type WorkDrawerDateRange} from '../components/TeamPrompt/WorkDrawer/WorkDrawerDateFilter'
import useSessionStorageState from './useSessionStorageState'

// Shared state for the "Your Work" inspiration drawer panels (GitHub, Jira, Linear, …). Each panel
// builds its own service-specific searchQuery and renders its own results, but they all need the
// same date-range filter and the results-count -> hasResults handshake. Works for both team prompt
// and retrospective meetings (the NewMeeting interface).
const useInspirationDrawer = (service: string, meetingRef: useInspirationDrawer_meeting$key) => {
  const meeting = useFragment(
    graphql`
      fragment useInspirationDrawer_meeting on NewMeeting {
        id
        createdAt
        meetingType
        ... on TeamPromptMeeting {
          prevMeeting {
            createdAt
          }
        }
        ... on RetrospectiveMeeting {
          prevMeeting {
            createdAt
          }
        }
      }
    `,
    meetingRef
  )

  // Both standup and retro default the window to the previous meeting in the series. When there
  // isn't one, retro falls back to the last two weeks; standup (and any other type) uses the
  // meeting's own start time, then finally the last 24 hours.
  const prevMeetingCreatedAt = 'prevMeeting' in meeting ? meeting.prevMeeting?.createdAt : undefined
  const retroFallback = dayjs().subtract(2, 'week').toISOString()
  const defaultStartAt =
    meeting.meetingType === 'retrospective'
      ? (prevMeetingCreatedAt ?? retroFallback)
      : (prevMeetingCreatedAt ?? meeting.createdAt ?? dayjs().subtract(24, 'hour').toISOString())
  const [dateRange, setDateRange] = useSessionStorageState<WorkDrawerDateRange | undefined>(
    `Inspiration:${service}:dateRange:${meeting.id}`,
    () => ({
      startAt: defaultStartAt,
      endAt: dayjs().endOf('day').toISOString()
    })
  )

  // The results list lives in a separate Suspense subtree, so it reports its count back up here.
  // We pair the count with the query it came from to avoid showing the draft UI against a stale
  // result set while a new search is loading.
  const [searchResult, setSearchResult] = useState<{query: string; count: number}>()
  const onResultCount = useCallback((query: string, count: number) => {
    setSearchResult({query, count})
  }, [])
  const getHasResults = (searchQuery: string) =>
    searchResult?.query === searchQuery && searchResult.count > 0

  return {dateRange, setDateRange, onResultCount, getHasResults} as const
}

export default useInspirationDrawer
