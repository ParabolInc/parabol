import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery} from 'react-relay'
import type {ClickUpIntegrationPanelQuery} from '../../../__generated__/ClickUpIntegrationPanelQuery.graphql'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import ClickUpIntegrationResultsRoot from './ClickUpIntegrationResultsRoot'
import ClickUpListFilterBar from './ClickUpListFilterBar'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const query = graphql`
  query ClickUpIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...useInspirationDrawer_meeting
        clickupInspirationItems: inspirationItems(service: clickup) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            ...ClickUpListFilterBar_teamMember
          }
        }
      }
    }
  }
`

const ClickUpIntegrationPanel = (
  props: WorkDrawerQueryPanelProps<ClickUpIntegrationPanelQuery>
) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<ClickUpIntegrationPanelQuery>(query, queryRef)
  const {meeting} = viewer
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'clickup',
    meeting
  )
  const [selectedListIds, setSelectedListIds] = useSessionStorageState<string[]>(
    `Inspiration:clickup:listIds:${meetingId}`,
    []
  )

  if (!teamMember) return null

  const {startAt, endAt} = dateRange ?? {}
  const searchQuery = JSON.stringify({startAt, endAt, listIds: selectedListIds})

  return (
    <>
      <div className='px-4 pt-4 pb-2'>
        <ClickUpListFilterBar
          teamMemberRef={teamMember}
          selectedListIds={selectedListIds}
          setSelectedListIds={setSelectedListIds}
        />
      </div>
      <div className='mb-2 flex w-full px-2'>
        <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <InspirationItemsPanel
          meetingId={meetingId}
          service='clickup'
          searchQuery={searchQuery}
          initialItems={meeting.clickupInspirationItems}
          hideDraftPanel={!getResultCount(searchQuery)}
        >
          <ClickUpIntegrationResultsRoot
            teamId={teamId}
            listIds={selectedListIds}
            updatedAfter={startAt ?? null}
            updatedBefore={endAt ?? null}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </InspirationItemsPanel>
      </div>
    </>
  )
}

export default ClickUpIntegrationPanel
