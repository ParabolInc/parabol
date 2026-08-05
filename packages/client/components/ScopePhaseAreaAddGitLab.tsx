import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import type {ScopePhaseAreaAddGitLab_meeting$key} from '../__generated__/ScopePhaseAreaAddGitLab_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import GitLabSVG from './GitLabSVG'
import RaisedButton from './RaisedButton'

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddGitLab_meeting$key
}

const ScopePhaseAreaAddGitLab = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddGitLab_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              gitlab {
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
  const {teamId, viewerMeetingMember} = meeting
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const {gitlab} = integrations
  const {cloudProvider} = gitlab
  if (!cloudProvider) return null
  const {id: providerId, clientId, serverBaseUrl} = cloudProvider

  const authGitLab = () => {
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <RaisedButton className='gap-2 whitespace-pre-wrap' onClick={authGitLab} size={'medium'}>
        <GitLabSVG />
        Import issues from GitLab
      </RaisedButton>
      <span
        className='cursor-pointer pt-6 text-accent outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaAddGitLab
