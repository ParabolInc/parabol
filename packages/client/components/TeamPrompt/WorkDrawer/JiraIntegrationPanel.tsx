import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment, usePreloadedQuery} from 'react-relay'
import type {JiraIntegrationPanel_meeting$key} from '../../../__generated__/JiraIntegrationPanel_meeting.graphql'
import type {JiraIntegrationPanelQuery} from '../../../__generated__/JiraIntegrationPanelQuery.graphql'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import InspirationItemsPanel from './InspirationItemsPanel'
import JiraIntegrationResultsRoot from './JiraIntegrationResultsRoot'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const query = graphql`
  query JiraIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...JiraIntegrationPanel_meeting
      }
    }
  }
`

const JiraIntegrationPanel = (props: WorkDrawerQueryPanelProps<JiraIntegrationPanelQuery>) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<JiraIntegrationPanelQuery>(query, queryRef)
  const meeting = useFragment<JiraIntegrationPanel_meeting$key>(
    graphql`
      fragment JiraIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        jiraInspirationItems: inspirationItems(service: jira) {
          id
          title
          content
          promptId
        }
      }
    `,
    viewer.meeting
  )

  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'jira',
    meeting
  )

  // JQL search re-run server-side when drafting a response, so the query the user sees and the
  // query the server runs stay in sync by construction.
  const dateQueryString = dateRange
    ? `updated >= "${dayjs(dateRange.startAt).format('YYYY-MM-DD HH:mm')}" AND updated <= "${dayjs(dateRange.endAt).format('YYYY-MM-DD HH:mm')}"`
    : ''
  const conditions = ['assignee = currentUser()', dateQueryString].filter(Boolean).join(' AND ')
  const searchQuery = `${conditions} order by updated DESC`

  const filterBar = (
    <div className='mb-2 flex w-full px-2'>
      <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  )

  return (
    <>
      {filterBar}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <InspirationItemsPanel
          meetingId={meetingId}
          service='jira'
          searchQuery={searchQuery}
          initialItems={meeting.jiraInspirationItems}
          hideDraftPanel={!getResultCount(searchQuery)}
        >
          <JiraIntegrationResultsRoot
            teamId={teamId}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </InspirationItemsPanel>
      </div>
    </>
  )
}

export default JiraIntegrationPanel
