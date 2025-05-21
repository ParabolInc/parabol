import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import LinearClientManager from '~/utils/LinearClientManager'
import {ScopePhaseAreaAddLinear_meeting$key} from '../__generated__/ScopePhaseAreaAddLinear_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import LinearSVG from './LinearSVG'

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddLinear_meeting$key
}

const ScopePhaseAreaAddLinear = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddLinear_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              linear {
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
  const {linear} = integrations
  const provider = linear?.cloudProvider
  if (!provider) return null

  const authLinear = () => {
    LinearClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <button
        onClick={authLinear}
        className='text-gray-900 flex items-center justify-center rounded bg-white px-4 py-2 whitespace-pre-wrap shadow transition-shadow duration-100 hover:shadow-md'
      >
        <LinearSVG />
        Import issues from Linear
      </button>
      <span
        onClick={gotoParabol}
        className='cursor-pointer pt-6 text-sky-500 outline-0 hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaAddLinear
