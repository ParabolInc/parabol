import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GCalIntegrationPanel_meeting$key} from '../../../__generated__/GCalIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import GCalIntegrationResultsRoot from './GCalIntegrationResultsRoot'
import GcalClientManager from '../../../utils/GcalClientManager'
import gcalSVG from '../../../styles/theme/images/graphics/google-calendar.svg'

interface Props {
  meetingRef: GCalIntegrationPanel_meeting$key
}

const GCalPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GCalIntegrationPanel_meeting on TeamPromptMeeting {
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

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const gcal = teamMember?.integrations.gcal

  const authGCal = () => {
    if (!gcal?.cloudProvider || !teamMember) {
      return
    }
    const {clientId, id: providerId} = gcal.cloudProvider
    GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamMember.teamId, mutationProps)
  }

  return (
    <>
      {teamMember?.integrations.gcal?.auth?.providerId ? (
        <>
          <GCalIntegrationResultsRoot teamId={teamMember.teamId} />
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
        </div>
      )}
    </>
  )
}

export default GCalPanel
