import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import {
  getClientIntegration,
  type RegisteredClientIntegration
} from '../integrations/platform/registry'
import {MenuItem} from '../ui/Menu/MenuItem'
import MenuItemAvatar from './MenuItemAvatar'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  service: RegisteredClientIntegration
  title: string
  provider: ConnectProvider
  heldScopes: readonly string[]
}

const ConnectIntegrationMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {teamId, mutationProps, service, title, provider, heldScopes} = props
  const atmosphere = useAtmosphere()
  const definition = getClientIntegration(service)
  const onClick = () => {
    definition.connect(atmosphere, {teamId, mutationProps, provider, heldScopes})
  }
  return (
    <MenuItem ref={ref} onClick={onClick}>
      <MenuItemAvatar>
        <definition.Icon className={definition.iconClassName} />
      </MenuItemAvatar>
      {`Add ${title} integration`}
    </MenuItem>
  )
})

export default ConnectIntegrationMenuItem
