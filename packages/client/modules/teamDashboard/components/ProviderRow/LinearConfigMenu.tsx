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

const LinearConfigMenu = (props: Props) => {
  const {mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeLinearAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {service: 'linear', teamId},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <MenuContent>
      <MenuItem onClick={removeLinearAuth}>Remove Linear</MenuItem>
    </MenuContent>
  )
}

export default LinearConfigMenu
