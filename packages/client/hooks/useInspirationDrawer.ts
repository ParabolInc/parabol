import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useCallback, useState} from 'react'
import {useFragment} from 'react-relay'
import type {useInspirationDrawer_meeting$key} from '../__generated__/useInspirationDrawer_meeting.graphql'
import {type WorkDrawerDateRange} from '../components/TeamPrompt/WorkDrawer/WorkDrawerDateFilter'
import useAtmosphere from './useAtmosphere'
import useSessionStorageState from './useSessionStorageState'

// Shared state for the "Your Work" inspiration drawer panels (GitHub, Jira, Linear). Each panel
// builds its own service-specific searchQuery and renders its own results, but they all need the
// same date-range filter, the viewer's response, and the results-count -> hasResults handshake.
const useInspirationDrawer = (service: string, meetingRef: useInspirationDrawer_meeting$key) => {
  const meeting = useFragment(
    graphql`
      fragment useInspirationDrawer_meeting on TeamPromptMeeting {
        id
        prevMeeting {
          createdAt
        }
        responses {
          id
          userId
          content
          plaintextContent
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const [dateRange, setDateRange] = useSessionStorageState<WorkDrawerDateRange | undefined>(
    `Inspiration:${service}:dateRange:${meeting.id}`,
    () => ({
      startAt: meeting.prevMeeting?.createdAt ?? dayjs().subtract(24, 'hour').toISOString(),
      endAt: dayjs().endOf('day').toISOString()
    })
  )

  const viewerResponse = meeting.responses.find((response) => response.userId === viewerId) ?? null

  // The results list lives in a separate Suspense subtree, so it reports its count back up here.
  // We pair the count with the query it came from to avoid showing the draft UI against a stale
  // result set while a new search is loading.
  const [searchResult, setSearchResult] = useState<{query: string; count: number}>()
  const onResultCount = useCallback((query: string, count: number) => {
    setSearchResult({query, count})
  }, [])
  const getHasResults = (searchQuery: string) =>
    searchResult?.query === searchQuery && searchResult.count > 0

  return {dateRange, setDateRange, viewerResponse, onResultCount, getHasResults} as const
}

export default useInspirationDrawer
