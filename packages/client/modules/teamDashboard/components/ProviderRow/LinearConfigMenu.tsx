import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../../../../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../../../../types/constEnums'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const LinearConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
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
    <Menu ariaLabel={'Configure your Linear integration'} {...menuProps}>
      <MenuItem label='Remove Linear' onClick={removeLinearAuth} />
    </Menu>
  )
}

export default LinearConfigMenu
