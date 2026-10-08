import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AzureDevOpsIntegrationPanel_meeting$key} from '../../../__generated__/AzureDevOpsIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import {getAzureDevOpsSharedProjects} from '../../../integrations/azureDevOps/azureDevOpsSharedProjects'
import findIntegrationService from '../../../integrations/platform/findIntegrationService'
import buildAzureDevOpsWorkWiql from '../../../shared/integrations/buildAzureDevOpsWorkWiql'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import AzureDevOpsConnectPrompt from './AzureDevOpsConnectPrompt'
import AzureDevOpsIntegrationResultsRoot from './AzureDevOpsIntegrationResultsRoot'
import AzureDevOpsProjectFilterBar from './AzureDevOpsProjectFilterBar'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

interface Props {
  meetingRef: AzureDevOpsIntegrationPanel_meeting$key
}

const KINDS = ['assigned'] as const

const AzureDevOpsIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        teamId
        id
        azureDevOpsInspirationItems: inspirationItems(service: azureDevOps) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            teamId
            services {
              service
              isConnected
              ...connectAzureDevOps_service @relay(mask: false)
              ...azureDevOpsSharedProjects_service @relay(mask: false)
            }
            ...AzureDevOpsProjectFilterBar_teamMember
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {id: meetingId, teamId} = meeting
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const services = teamMember?.services ?? []
  const isConnected = !!findIntegrationService(services, 'azureDevOps')?.isConnected
  const {projects: sharedProjects, isListed} = getAzureDevOpsSharedProjects(services)
  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'azureDevOps',
    meeting
  )
  const [selectedProjectIds, setSelectedProjectIds] = useSessionStorageState<string[]>(
    `Inspiration:azureDevOps:projectIds:${meetingId}`,
    []
  )

  if (!isConnected || !teamMember) {
    return <AzureDevOpsConnectPrompt teamId={teamId} meetingId={meetingId} services={services} />
  }

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
