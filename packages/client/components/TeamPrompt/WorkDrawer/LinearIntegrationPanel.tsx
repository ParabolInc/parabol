import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LinearIntegrationPanel_meeting$key} from '../../../__generated__/LinearIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useMutationProps from '../../../hooks/useMutationProps'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import linearSVG from '../../../styles/theme/images/graphics/linear.svg'
import LinearClientManager from '../../../utils/LinearClientManager'
import {makeLinearWorkFilter} from '../../../utils/makeLinearWorkFilter'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import InspirationItemsPanel from './InspirationItemsPanel'
import LinearIntegrationResultsRoot from './LinearIntegrationResultsRoot'
import LinearProjectFilterBar from './LinearProjectFilterBar'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

interface Props {
  meetingRef: LinearIntegrationPanel_meeting$key
}

const LinearIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment LinearIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        teamId
        id
        linearInspirationItems: inspirationItems(service: linear) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              linear {
                auth {
                  isActive
                }
                cloudProvider {
                  id
                  clientId
                  serverBaseUrl
                }
              }
            }
            ...LinearProjectFilterBar_teamMember
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const linear = teamMember?.integrations?.linear
  const isActive = !!linear?.auth?.isActive
  const provider = linear?.cloudProvider

  const {dateRange, setDateRange, onResultCount, getHasResults} = useInspirationDrawer(
    'linear',
    meeting
  )

  const [selectedLinearIds, setSelectedLinearIds] = useSessionStorageState<string[]>(
    `Inspiration:linear:ids:${meeting.id}`,
    []
  )

  const filter = makeLinearWorkFilter(selectedLinearIds, dateRange)
  const searchQuery = JSON.stringify(filter)
  const hasResults = getHasResults(searchQuery)

  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authLinear = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    if (!provider) {
      return onError(new Error('Could not find Linear provider'))
    }
    LinearClientManager.openOAuth(atmosphere, teamMember.teamId, provider, mutationProps)

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'linear'
    })
  }

  return (
    <>
      {isActive && teamMember ? (
        <>
          <LinearProjectFilterBar
            teamMemberRef={teamMember}
            selectedLinearIds={selectedLinearIds}
            setSelectedLinearIds={(ids) => {
              SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
                teamId: meeting.teamId,
                meetingId: meeting.id,
                service: 'linear'
              })
              setSelectedLinearIds(ids)
            }}
          />
          <div className='mb-2 flex w-full px-2'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
            {hasResults && (
              <InspirationItemsPanel
                meetingId={meeting.id}
                service='linear'
                searchQuery={searchQuery}
                initialItems={meeting.linearInspirationItems}
              />
            )}
            <LinearIntegrationResultsRoot
              filter={filter}
              searchQuery={searchQuery}
              teamId={teamMember.teamId}
              onResultCount={onResultCount}
            />
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={linearSVG} />
          </div>
          <b>Connect to Linear</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to Linear to view your issues and PRs.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-md bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authLinear}
          >
            Connect
          </button>
          {error && <div className='text-fg-error'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default LinearIntegrationPanel
