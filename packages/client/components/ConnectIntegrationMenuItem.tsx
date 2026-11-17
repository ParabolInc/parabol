import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProviderRef} from '../integrations/platform/ClientIntegrationDefinition'
import {
  getClientIntegration,
  type RegisteredClientIntegration
} from '../integrations/platform/registry'
import type {BeginConnect} from '../integrations/platform/useConnectInMenu'
import {MenuItem} from '../ui/Menu/MenuItem'
import MenuItemAvatar from './MenuItemAvatar'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  service: RegisteredClientIntegration
  title: string
  provider: ConnectProviderRef
  heldScopes: readonly string[]
  label?: string
  onConnect?: BeginConnect
}

const ConnectIntegrationMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {teamId, mutationProps, service, title, provider, heldScopes, label, onConnect} = props
  const atmosphere = useAtmosphere()
  const definition = getClientIntegration(service)
  const onSelect = (event: Event) => {
    if (onConnect) event.preventDefault()
    const attemptProps = onConnect ? onConnect(service, title) : mutationProps
    const isStarted = definition.connect(atmosphere, {
      teamId,
      mutationProps: attemptProps,
      provider,
      heldScopes
    })
    if (!isStarted && onConnect) {
      attemptProps.onError({message: `${title} isn't set up for this team yet.`})
    }
  }
  return (
    <MenuItem ref={ref} onSelect={onSelect}>
      <MenuItemAvatar>
        <definition.Icon className={definition.iconClassName} />
      </MenuItemAvatar>
      {label ?? `Add ${title} integration`}
    </MenuItem>
  )
})

export default ConnectIntegrationMenuItem
