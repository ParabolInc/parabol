import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentPermissions_request$key} from '../../__generated__/OAuthConsentPermissions_request.graphql'
import scopeResources from './scopeResources'

interface Props {
  requestRef: OAuthConsentPermissions_request$key
}

const OAuthConsentPermissions = ({requestRef}: Props) => {
  const {scopes} = useFragment(
    graphql`
      fragment OAuthConsentPermissions_request on OAuthAuthorizationRequest {
        scopes
      }
    `,
    requestRef
  )
  const grantedScopes = new Set<string>(scopes)
  const permissions = Object.entries(scopeResources).flatMap(([resource, copy]) => {
    const canRead = grantedScopes.has(`${resource}_READ`)
    const canWrite = grantedScopes.has(`${resource}_WRITE`)
    if (!canRead && !canWrite) return []
    const description = canRead && canWrite ? copy.readWrite : canRead ? copy.read : copy.write
    return [{resource, title: copy.title, Icon: copy.Icon, description}]
  })
  return (
    <section aria-labelledby='oauth-consent-permissions' className='flex flex-col gap-2'>
      <h3
        id='oauth-consent-permissions'
        className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wider'
      >
        It will be able to
      </h3>
      {permissions.length > 0 ? (
        <ul className='m-0 grid list-none grid-cols-[auto_auto_1fr] gap-x-3 p-0'>
          {permissions.map(({resource, title, Icon, description}) => (
            <li key={resource} className='col-span-3 grid grid-cols-subgrid items-center py-1'>
              <Icon className='text-fg-secondary text-xl' />
              <span className='font-semibold'>{title}</span>
              <span className='text-fg-secondary'>{description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='m-0'>No permissions requested.</p>
      )}
    </section>
  )
}

export default OAuthConsentPermissions
