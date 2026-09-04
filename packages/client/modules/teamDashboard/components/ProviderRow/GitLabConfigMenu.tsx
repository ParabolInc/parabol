import useAtmosphere from '../../../../hooks/useAtmosphere'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../../../../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../../../../types/constEnums'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
}

const GitLabConfigMenu = (props: Props) => {
  const {mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeGitLabAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {service: 'gitlab', teamId},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <MenuContent>
      <MenuItem onClick={removeGitLabAuth}>Remove GitLab</MenuItem>
    </MenuContent>
  )
}

export default GitLabConfigMenu
