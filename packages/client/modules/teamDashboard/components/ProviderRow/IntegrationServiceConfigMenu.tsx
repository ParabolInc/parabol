import {forwardRef} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {ClientIntegrationDefinition} from '../../../../integrations/platform/ClientIntegrationDefinition'
import type {ServiceProvider} from '../../../../integrations/platform/integrationServiceProviders'
import RemoveTeamMemberIntegrationAuthMutation from '../../../../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../../../../types/constEnums'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

interface Props {
  definition: ClientIntegrationDefinition
  teamId: string
  provider: ServiceProvider
  grantedScopes: readonly string[]
  mutationProps: MenuMutationProps
}

const IntegrationServiceConfigMenu = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {definition, teamId, provider, grantedScopes, mutationProps} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const {service, title} = definition
  const disconnectSubline = definition.getDisconnectSubline?.(grantedScopes)

  const refreshToken = () => {
    definition.connect(atmosphere, {teamId, mutationProps, provider, heldScopes: grantedScopes})
  }

  const removeAuth = () => {
    if (submitting) return
    submitMutation()
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(atmosphere, {service, teamId}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }

  return (
    <MenuContent ref={ref}>
      <MenuItem onClick={refreshToken}>Refresh token</MenuItem>
      <MenuItem onClick={removeAuth}>
        {disconnectSubline ? (
          <div className='py-1'>
            <div>{`Remove ${title}`}</div>
            <div className='text-fg-muted text-xs'>{disconnectSubline}</div>
          </div>
        ) : (
          `Remove ${title}`
        )}
      </MenuItem>
    </MenuContent>
  )
})

export default IntegrationServiceConfigMenu
