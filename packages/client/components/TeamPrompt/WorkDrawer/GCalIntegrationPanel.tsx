import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {GCalIntegrationPanel_meeting$key} from '../../../__generated__/GCalIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import gcalSVG from '../../../styles/theme/images/graphics/google-calendar.svg'
import GcalClientManager from '../../../utils/GcalClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GCalIntegrationResultsRoot from './GCalIntegrationResultsRoot'

const GCAL_QUERY_TABS = [
  {
    key: 'past7d',
    label: 'Past 7 days'
  },
  {
    key: 'today',
    label: 'Today'
  },
  {
    key: 'upcoming',
    label: 'Upcoming'
  }
] as const

interface Props {
  meetingRef: GCalIntegrationPanel_meeting$key
}

const GCalPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GCalIntegrationPanel_meeting on TeamPromptMeeting {
        id
        teamId
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

  const [eventRangeKey, setEventRangeKey] = useState<'past7d' | 'today' | 'upcoming'>('past7d')

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

    SendClientSideEvent(atmosphere, 'Your Work Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'gcal'
    })
  }

  const trackTabNavigated = (label: string) => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Tag Navigated', {
      service: 'gcal',
      buttonLabel: label
    })
  }

  return (
    <>
      {teamMember?.integrations.gcal?.auth?.providerId ? (
        <>
          <div className='mt-4 flex w-full gap-2 px-4'>
            {GCAL_QUERY_TABS.map((tab) => (
              <div
                key={tab.key}
                className={clsx(
                  'w-1/2 cursor-pointer rounded-full px-3 py-3 text-center text-sm leading-3 text-slate-800',
                  tab.key === eventRangeKey
                    ? 'bg-grape-700 font-semibold text-white focus:text-white'
                    : 'border border-slate-300 bg-white'
                )}
                onClick={() => {
                  trackTabNavigated(tab.label)
                  setEventRangeKey(tab.key)
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <GCalIntegrationResultsRoot teamId={teamMember.teamId} eventRangeKey={eventRangeKey} />
        </>
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
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
