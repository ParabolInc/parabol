import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useFragment, usePreloadedQuery} from 'react-relay'
import type {GCalIntegrationPanel_meeting$key} from '../../../__generated__/GCalIntegrationPanel_meeting.graphql'
import type {GCalIntegrationPanelQuery} from '../../../__generated__/GCalIntegrationPanelQuery.graphql'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import GCalIntegrationResultsRoot from './GCalIntegrationResultsRoot'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const TODAY_MIDNIGHT = new Date().setHours(0, 0, 0, 0)

const query = graphql`
  query GCalIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...GCalIntegrationPanel_meeting
      }
    }
  }
`

const GCalIntegrationPanel = (props: WorkDrawerQueryPanelProps<GCalIntegrationPanelQuery>) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<GCalIntegrationPanelQuery>(query, queryRef)
  const meeting = useFragment<GCalIntegrationPanel_meeting$key>(
    graphql`
      fragment GCalIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        gcalInspirationItems: inspirationItems(service: gcal) {
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
    'gcal',
    meeting
  )

  // The events query requires a bounded window, so fall back to the past week when the filter is cleared.
  const startDate = dateRange?.startAt ?? new Date(TODAY_MIDNIGHT - ms('7d')).toJSON()
  const endDate = dateRange?.endAt ?? new Date(TODAY_MIDNIGHT + ms('1d')).toJSON()
  // Show past-only ranges most-recent-first; show chronologically once the window reaches into the future.
  const order = new Date(endDate).getTime() <= Date.now() ? 'DESC' : 'ASC'
  const searchQuery = JSON.stringify({startDate, endDate})

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
          service='gcal'
          searchQuery={searchQuery}
          initialItems={meeting.gcalInspirationItems}
          hideDraftPanel={!getResultCount(searchQuery)}
        >
          <GCalIntegrationResultsRoot
            teamId={teamId}
            startDate={startDate}
            endDate={endDate}
            order={order}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </InspirationItemsPanel>
      </div>
    </>
  )
}

export default GCalIntegrationPanel
