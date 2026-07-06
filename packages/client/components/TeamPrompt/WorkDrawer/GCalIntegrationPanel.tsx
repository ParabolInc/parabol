import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useFragment} from 'react-relay'
import type {GCalIntegrationPanel_meeting$key} from '../../../__generated__/GCalIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useMutationProps from '../../../hooks/useMutationProps'
import gcalSVG from '../../../styles/theme/images/graphics/google-calendar.svg'
import GcalClientManager from '../../../utils/GcalClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GCalIntegrationResultsRoot from './GCalIntegrationResultsRoot'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const TODAY_MIDNIGHT = new Date().setHours(0, 0, 0, 0)

interface Props {
  meetingRef: GCalIntegrationPanel_meeting$key
}

const GCalPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GCalIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        id
        teamId
        gcalInspirationItems: inspirationItems(service: gcal) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              gcal {
                auth {
                  providerId
                }
                cloudProvider {
                  id
                  clientId
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const teamMember = meeting.viewerMeetingMember?.teamMember

  const {dateRange, setDateRange, onResultCount, getHasResults} = useInspirationDrawer(
    'gcal',
    meeting
  )

  // The events query requires a bounded window, so fall back to the past week when the filter is cleared.
  const startDate = dateRange?.startAt ?? new Date(TODAY_MIDNIGHT - ms('7d')).toJSON()
  const endDate = dateRange?.endAt ?? new Date(TODAY_MIDNIGHT + ms('1d')).toJSON()
  // Show past-only ranges most-recent-first; show chronologically once the window reaches into the future.
  const order = new Date(endDate).getTime() <= Date.now() ? 'DESC' : 'ASC'
  const searchQuery = JSON.stringify({startDate, endDate})

  const hasResults = getHasResults(searchQuery)

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const gcal = teamMember?.integrations.gcal

  const authGCal = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    if (!gcal?.cloudProvider) {
      return onError(new Error('Missing cloud provider for Google'))
    }
    const {clientId, id: providerId} = gcal.cloudProvider
    GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'gcal'
    })
  }

  return (
    <>
      {teamMember?.integrations.gcal?.auth?.providerId ? (
        <>
          <div className='mt-4 mb-2 flex w-full px-4'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
            {hasResults && (
              <InspirationItemsPanel
                meetingId={meeting.id}
                service='gcal'
                searchQuery={searchQuery}
                initialItems={meeting.gcalInspirationItems}
              />
            )}
            <GCalIntegrationResultsRoot
              teamId={teamMember.teamId}
              startDate={startDate}
              endDate={endDate}
              order={order}
              searchQuery={searchQuery}
              onResultCount={onResultCount}
            />
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={gcalSVG} />
          </div>
          <b>Connect to Google Calendar</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to Google Calendar to view your recent events.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authGCal}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>{error.message}</div>}
        </div>
      )}
    </>
  )
}

export default GCalPanel
