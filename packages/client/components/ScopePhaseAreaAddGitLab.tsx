import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import type {ScopePhaseAreaAddGitLab_meeting$key} from '../__generated__/ScopePhaseAreaAddGitLab_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Button} from '../ui/Button/Button'
import GitLabSVG from './GitLabSVG'

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
      <Button
        variant='raised'
        size='md'
        className='gap-2 whitespace-pre-wrap bg-slate-200 text-slate-700'
        onClick={authGitLab}
      >
        <GitLabSVG />
        Import issues from GitLab
      </Button>
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
