import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const GcalConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeGcal = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {service: 'gcal', teamId},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={'Configure your Google Calendar integration'} {...menuProps}>
      <MenuItem label='Remove Google Calendar' onClick={removeGcal} />
    </Menu>
  )
}

export default GcalConfigMenu
