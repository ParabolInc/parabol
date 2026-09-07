import type {ReactNode} from 'react'
import {ERROR_POPUP_CLOSED} from '../../utils/AtlassianClientManager'
import type {ClientIntegrationDefinition} from './ClientIntegrationDefinition'

export const getConnectErrorMessage = (
  error: {message: string} | undefined,
  definition: Pick<ClientIntegrationDefinition, 'authorizationHelpUrl'>
): ReactNode | undefined => {
  if (!error) return undefined
  const {message} = error
  const {authorizationHelpUrl} = definition
  if (message !== ERROR_POPUP_CLOSED || !authorizationHelpUrl) return message
  return (
    <>
      Having trouble authorizing Parabol? Try our{' '}
      <a href={authorizationHelpUrl} target='_blank' rel='noreferrer'>
        troubleshooting guide
      </a>
    </>
  )
}
