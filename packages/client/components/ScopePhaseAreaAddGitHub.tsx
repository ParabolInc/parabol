import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaAddGitHub_meeting$key} from '../__generated__/ScopePhaseAreaAddGitHub_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Button} from '../ui/Button/Button'
import GitHubClientManager from '../utils/GitHubClientManager'
import GitHubSVG from './GitHubSVG'

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddGitHub_meeting$key
}

const ScopePhaseAreaAddGitHub = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddGitHub_meeting on PokerMeeting {
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting

  const authGitHub = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <Button
        variant='raised'
        size='md'
        className='gap-2 whitespace-pre-wrap bg-slate-200 text-slate-700'
        onClick={authGitHub}
      >
        <GitHubSVG />
        Import issues from GitHub
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

export default ScopePhaseAreaAddGitHub
