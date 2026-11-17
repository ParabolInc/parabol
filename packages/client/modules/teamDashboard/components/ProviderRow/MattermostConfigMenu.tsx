import useAtmosphere from '../../../../hooks/useAtmosphere'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import RemoveIntegrationProviderMutation from '../../../../mutations/RemoveIntegrationProviderMutation'
import {Duration} from '../../../../types/constEnums'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

interface Props {
  mutationProps: MenuMutationProps
  providerId: string
}

const MattermostConfigMenu = (props: Props) => {
  const {mutationProps, providerId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()

  const removeMattermostAuth = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveIntegrationProviderMutation(atmosphere, {providerId}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <MenuContent>
      <MenuItem onClick={removeMattermostAuth}>Remove Mattermost</MenuItem>
    </MenuContent>
  )
}

export default MattermostConfigMenu
