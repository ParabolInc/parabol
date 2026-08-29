import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import {
  getClientIntegration,
  type RegisteredClientIntegration
} from '../integrations/platform/registry'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  service: RegisteredClientIntegration
  title: string
  provider: ConnectProvider
  heldScopes: readonly string[]
}

const ConnectIntegrationMenuItem = forwardRef((props: Props, ref) => {
  const {teamId, mutationProps, service, title, provider, heldScopes} = props
  const atmosphere = useAtmosphere()
  const definition = getClientIntegration(service)
  const onClick = () => {
    definition.connect(atmosphere, {teamId, mutationProps, provider, heldScopes})
  }
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <definition.Icon className={definition.iconClassName} />
          </MenuItemAvatar>
          {`Add ${title} integration`}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default ConnectIntegrationMenuItem
