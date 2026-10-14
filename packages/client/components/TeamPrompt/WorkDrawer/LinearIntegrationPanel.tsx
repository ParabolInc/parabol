import graphql from 'babel-plugin-relay/macro'
import {useFragment, usePreloadedQuery} from 'react-relay'
import type {LinearIntegrationPanel_meeting$key} from '../../../__generated__/LinearIntegrationPanel_meeting.graphql'
import type {LinearIntegrationPanelQuery} from '../../../__generated__/LinearIntegrationPanelQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import {makeLinearWorkFilter} from '../../../utils/makeLinearWorkFilter'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import InspirationItemsPanel from './InspirationItemsPanel'
import LinearIntegrationResultsRoot from './LinearIntegrationResultsRoot'
import LinearProjectFilterBar from './LinearProjectFilterBar'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const query = graphql`
  query LinearIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...LinearIntegrationPanel_meeting
      }
    }
  }
`

const LinearIntegrationPanel = (props: WorkDrawerQueryPanelProps<LinearIntegrationPanelQuery>) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<LinearIntegrationPanelQuery>(query, queryRef)
  const meeting = useFragment<LinearIntegrationPanel_meeting$key>(
    graphql`
      fragment LinearIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        linearInspirationItems: inspirationItems(service: linear) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            ...LinearProjectFilterBar_teamMember
          }
        }
      }
    `,
    viewer.meeting
  )

  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember

  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'linear',
    meeting
  )

  const [selectedLinearIds, setSelectedLinearIds] = useSessionStorageState<string[]>(
    `Inspiration:linear:ids:${meetingId}`,
    []
  )

  const filter = makeLinearWorkFilter(selectedLinearIds, dateRange)
  const searchQuery = JSON.stringify(filter)

  const filterBar = teamMember ? (
    <>
      <LinearProjectFilterBar
        teamMemberRef={teamMember}
        selectedLinearIds={selectedLinearIds}
        setSelectedLinearIds={(ids) => {
          SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
            teamId,
            meetingId,
            service: 'linear'
          })
          setSelectedLinearIds(ids)
        }}
      />
      <div className='mb-2 flex w-full px-2'>
        <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>
    </>
  ) : null

  return (
    <>
      {filterBar}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <InspirationItemsPanel
          meetingId={meetingId}
          service='linear'
          searchQuery={searchQuery}
          initialItems={meeting.linearInspirationItems}
          hideDraftPanel={!getResultCount(searchQuery)}
        >
          <LinearIntegrationResultsRoot
            filter={filter}
            searchQuery={searchQuery}
            teamId={teamId}
            onResultCount={onResultCount}
          />
        </InspirationItemsPanel>
      </div>
    </>
  )
}

export default LinearIntegrationPanel
