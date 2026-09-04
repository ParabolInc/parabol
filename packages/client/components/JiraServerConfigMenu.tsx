import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import JiraServerClientManager from '../utils/JiraServerClientManager'

interface Props {
  mutationProps: MenuMutationProps
  providerId: string
  teamId: string
}

const JiraServerConfigMenu = (props: Props) => {
  const {mutationProps, teamId, providerId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    JiraServerClientManager.openOAuth(atmosphere, providerId, teamId, mutationProps)
  }

  const removeJiraServer = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {teamId, service: 'jiraServer'},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <MenuContent>
      <MenuItem onClick={openOAuth}>Refresh token</MenuItem>
      <MenuItem onClick={removeJiraServer}>Remove Jira Data Center</MenuItem>
    </MenuContent>
  )
}

export default JiraServerConfigMenu
