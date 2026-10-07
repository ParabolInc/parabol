import graphql from 'babel-plugin-relay/macro'
import {useFragment, usePreloadedQuery} from 'react-relay'
import type {AzureDevOpsIntegrationPanel_meeting$key} from '../../../__generated__/AzureDevOpsIntegrationPanel_meeting.graphql'
import type {AzureDevOpsIntegrationPanelQuery} from '../../../__generated__/AzureDevOpsIntegrationPanelQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import {getAzureDevOpsSharedProjects} from '../../../integrations/azureDevOps/azureDevOpsSharedProjects'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import buildAzureDevOpsWorkWiql from '../../../shared/integrations/buildAzureDevOpsWorkWiql'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import AzureDevOpsIntegrationResultsRoot from './AzureDevOpsIntegrationResultsRoot'
import AzureDevOpsProjectFilterBar from './AzureDevOpsProjectFilterBar'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const query = graphql`
  query AzureDevOpsIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...AzureDevOpsIntegrationPanel_meeting
      }
    }
  }
`

const KINDS = ['assigned'] as const

const AzureDevOpsIntegrationPanel = (
  props: WorkDrawerQueryPanelProps<AzureDevOpsIntegrationPanelQuery>
) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<AzureDevOpsIntegrationPanelQuery>(query, queryRef)
  const meeting = useFragment<AzureDevOpsIntegrationPanel_meeting$key>(
    graphql`
      fragment AzureDevOpsIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        azureDevOpsInspirationItems: inspirationItems(service: azureDevOps) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            services {
              service
              ...azureDevOpsSharedProjects_service @relay(mask: false)
            }
            ...AzureDevOpsProjectFilterBar_teamMember
          }
        }
      }
    `,
    viewer.meeting
  )
  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const {projects: sharedProjects, isListed} = getAzureDevOpsSharedProjects(teamMember?.services)
  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'azureDevOps',
    meeting
  )
  const [selectedProjectIds, setSelectedProjectIds] = useSessionStorageState<string[]>(
    `Inspiration:azureDevOps:projectIds:${meetingId}`,
    []
  )

  if (!teamMember) return null

  const {startAt, endAt} = dateRange ?? {}
  // The same filter is listed here and re-run server-side when drafting, so the work the viewer
  // sees and the work the draft uses stay in sync by construction.
  const where = buildAzureDevOpsWorkWiql({kinds: KINDS, startAt, endAt})
  const searchQuery = JSON.stringify({startAt, endAt, kinds: KINDS, projectIds: selectedProjectIds})
  const sharedProjectsKey = sharedProjects.map(({integrationRepoId}) => integrationRepoId).join()
  const sharesNothing = isListed && sharedProjects.length === 0

  return (
    <>
      <div className='px-4 pt-4 pb-2'>
        <AzureDevOpsProjectFilterBar
          teamMemberRef={teamMember}
          selectedProjectIds={selectedProjectIds}
          setSelectedProjectIds={(projectIds) => {
            SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
              teamId,
              meetingId,
              service: 'azureDevOps'
            })
            setSelectedProjectIds(projectIds)
          }}
        />
      </div>
      {!sharesNothing && (
        <>
          <div className='mb-2 flex w-full px-2'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
            <InspirationItemsPanel
              meetingId={meetingId}
              service='azureDevOps'
              searchQuery={searchQuery}
              initialItems={meeting.azureDevOpsInspirationItems}
              hideDraftPanel={!getResultCount(searchQuery)}
            >
              <AzureDevOpsIntegrationResultsRoot
                key={sharedProjectsKey}
                teamId={teamId}
                where={where}
                projectIds={selectedProjectIds}
                searchQuery={searchQuery}
                onResultCount={onResultCount}
              />
            </InspirationItemsPanel>
          </div>
        </>
      )}
    </>
  )
}

export default AzureDevOpsIntegrationPanel
