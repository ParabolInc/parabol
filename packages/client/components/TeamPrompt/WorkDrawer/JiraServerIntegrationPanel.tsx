import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {JiraServerIntegrationPanel_meeting$key} from '../../../__generated__/JiraServerIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import jiraServerSVG from '../../../styles/theme/images/graphics/jira-software-blue.svg'
import JiraServerClientManager from '../../../utils/JiraServerClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import JiraServerIntegrationResultsRoot from './JiraServerIntegrationResultsRoot'

interface Props {
  meetingRef: JiraServerIntegrationPanel_meeting$key
}

const JiraServerIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraServerIntegrationPanel_meeting on TeamPromptMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              jiraServer {
                auth {
                  id
                  isActive
                }
                sharedProviders {
                  id
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
  const integration = teamMember?.integrations.jiraServer
  const providerId = integration?.sharedProviders?.[0]?.id
  const isActive = !!integration?.auth?.isActive

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authJiraServer = () => {
    if (!teamMember || !providerId) {
      return onError(new Error('Could not find integration provider'))
    }
    JiraServerClientManager.openOAuth(atmosphere, providerId, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Your Work Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'jira server'
    })
  }
  if (!teamMember || !teamMember) {
    return null
  }

  return (
    <>
      {isActive ? (
        <JiraServerIntegrationResultsRoot teamId={teamMember.teamId} />
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={jiraServerSVG} />
          </div>
          <b>Connect to Jira Data Center</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to Jira Data Center to view your issues.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authJiraServer}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default JiraServerIntegrationPanel
