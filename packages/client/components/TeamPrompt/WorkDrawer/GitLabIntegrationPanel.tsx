import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {GitLabIntegrationPanel_meeting$key} from '../../../__generated__/GitLabIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import GitLabClientManager from '../../../utils/GitLabClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GitLabSVG from '../../GitLabSVG'
import GitLabIntegrationResultsRoot from './GitLabIntegrationResultsRoot'

interface Props {
  meetingRef: GitLabIntegrationPanel_meeting$key
}

const GitLabIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabIntegrationPanel_meeting on NewMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              gitlab {
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
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const gitlab = teamMember?.integrations.gitlab
  const isActive = !!gitlab?.auth?.isActive
  const provider = gitlab?.cloudProvider

  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authGitLab = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    if (!provider) {
      return onError(new Error('Could not find GitLab provider'))
    }
    const {id: providerId, clientId, serverBaseUrl} = provider
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamMember.teamId,
      mutationProps
    )

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'gitlab'
    })
  }

  return (
    <>
      {isActive && teamMember ? (
        <GitLabIntegrationResultsRoot teamId={teamMember.teamId} />
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>
            <GitLabSVG className='h-10 w-10' />
          </div>
          <b>Connect to GitLab</b>
          <div className='w-1/2 text-center text-sm'>Connect to GitLab to view your issues.</div>
          <button
            className='mt-4 cursor-pointer rounded-md bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authGitLab}
          >
            Connect
          </button>
          {error && <div className='text-fg-error'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default GitLabIntegrationPanel
