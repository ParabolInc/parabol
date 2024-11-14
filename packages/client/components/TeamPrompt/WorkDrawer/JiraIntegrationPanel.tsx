import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {JiraIntegrationPanel_meeting$key} from '../../../__generated__/JiraIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import JiraIntegrationResultsRoot from './JiraIntegrationResultsRoot'

interface Props {
  meetingRef: JiraIntegrationPanel_meeting$key
}

const JiraIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraIntegrationPanel_meeting on TeamPromptMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              atlassian {
                isActive
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
  const {error, onError} = mutationProps

  const authJira = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    AtlassianClientManager.openOAuth(atmosphere, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Your Work Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'jira'
    })
  }

  return (
    <>
      {teamMember?.integrations.atlassian?.isActive ? (
        <JiraIntegrationResultsRoot teamId={teamMember.teamId} />
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
          <div className='h-10 w-10'>{/* <img className='h-10 w-10' src={gitHubSVG} /> */}</div>
          <b>Connect to Jira</b>
          <div className='w-1/2 text-center text-sm'>Connect to Jira to view your issues.</div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authJira}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default JiraIntegrationPanel
