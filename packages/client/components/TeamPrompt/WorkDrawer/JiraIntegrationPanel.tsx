import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useCallback, useState} from 'react'
import {useFragment} from 'react-relay'
import type {JiraIntegrationPanel_meeting$key} from '../../../__generated__/JiraIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import InspirationItemsPanel from './InspirationItemsPanel'
import JiraIntegrationResultsRoot from './JiraIntegrationResultsRoot'
import {WorkDrawerDateFilter, type WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  meetingRef: JiraIntegrationPanel_meeting$key
}

const JiraIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraIntegrationPanel_meeting on TeamPromptMeeting {
        id
        teamId
        prevMeeting {
          createdAt
        }
        jiraInspirationItems: inspirationItems(service: jira) {
          id
          title
          content
        }
        responses {
          id
          userId
          content
          plaintextContent
        }
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              atlassian {
                isActive
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const teamMember = meeting.viewerMeetingMember?.teamMember

  const [dateRange, setDateRange] = useSessionStorageState<WorkDrawerDateRange | undefined>(
    `Inspiration:jira:dateRange:${meeting.id}`,
    () => ({
      startAt: meeting.prevMeeting?.createdAt ?? dayjs().subtract(24, 'hour').toISOString(),
      endAt: dayjs().endOf('day').toISOString()
    })
  )

  // JQL search re-run server-side when drafting a response, so the query the user sees and the
  // query the server runs stay in sync by construction.
  const dateQueryString = dateRange
    ? `updated >= "${dayjs(dateRange.startAt).format('YYYY-MM-DD HH:mm')}" AND updated <= "${dayjs(dateRange.endAt).format('YYYY-MM-DD HH:mm')}"`
    : ''
  const conditions = ['assignee = currentUser()', dateQueryString].filter(Boolean).join(' AND ')
  const searchQuery = `${conditions} order by updated DESC`

  const viewerResponse = meeting.responses.find((response) => response.userId === viewerId) ?? null

  // The results list lives in a separate Suspense subtree, so it reports its count back up here.
  // We pair the count with the query it came from to avoid showing the draft UI against a stale
  // result set while a new search is loading.
  const [searchResult, setSearchResult] = useState<{query: string; count: number}>()
  const onResultCount = useCallback((query: string, count: number) => {
    setSearchResult({query, count})
  }, [])
  const hasResults = searchResult?.query === searchQuery && searchResult.count > 0

  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authJira = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    AtlassianClientManager.openOAuth(atmosphere, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'jira'
    })
  }

  return (
    <>
      {teamMember?.integrations.atlassian?.isActive ? (
        <>
          <div className='mb-2 flex w-full px-4'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          {hasResults && (
            <InspirationItemsPanel
              meetingId={meeting.id}
              service='jira'
              searchQuery={searchQuery}
              initialItems={meeting.jiraInspirationItems}
              viewerResponse={viewerResponse}
            />
          )}
          <JiraIntegrationResultsRoot
            teamId={teamMember.teamId}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>{/* <img className='h-10 w-10' src={gitHubSVG} /> */}</div>
          <b>Connect to Jira</b>
          <div className='w-1/2 text-center text-sm'>Connect to Jira to view your issues.</div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authJira}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default JiraIntegrationPanel
