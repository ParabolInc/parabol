import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveSlackAuthMutation from '../mutations/RemoveSlackAuthMutation'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import SlackClientManager from '../utils/SlackClientManager'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
}

const SlackConfigMenu = (props: Props) => {
  const {mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const removeSlack = () => {
    if (submitting) return
    submitMutation()
    RemoveSlackAuthMutation(atmosphere, {teamId}, {onCompleted, onError})
  }
  return (
    <MenuContent>
      <MenuItem onClick={openOAuth}>Refresh token</MenuItem>
      <MenuItem onClick={removeSlack}>Remove Slack</MenuItem>
    </MenuContent>
  )
}

export default SlackConfigMenu
