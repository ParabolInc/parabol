import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import AzureDevOpsClientManager from '~/utils/AzureDevOpsClientManager'
import type {ScopePhaseAreaAddAzureDevOps_meeting$key} from '../__generated__/ScopePhaseAreaAddAzureDevOps_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import RaisedButton from './RaisedButton'

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddAzureDevOps_meeting$key
}

const ScopePhaseAreaAddAzureDevOps = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddAzureDevOps_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              azureDevOps {
                cloudProvider {
                  id
                  tenantId
                  clientId
                }
                sharedProviders {
                  id
                  tenantId
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
  const {teamId, viewerMeetingMember} = meeting
  const provider =
    viewerMeetingMember?.teamMember.integrations.azureDevOps.sharedProviders[0] ??
    viewerMeetingMember?.teamMember.integrations.azureDevOps.cloudProvider
  if (!provider) {
    return null
  }
  const authAzureDevOps = () => {
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <RaisedButton className='gap-2 whitespace-pre-wrap' onClick={authAzureDevOps} size={'medium'}>
        <AzureDevOpsSVG />
        Import issues from Azure DevOps
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

export default ScopePhaseAreaAddAzureDevOps
