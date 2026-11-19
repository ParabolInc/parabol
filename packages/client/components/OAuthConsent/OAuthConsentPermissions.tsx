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
      <h2
        id='oauth-consent-permissions'
        className='m-0 font-semibold text-fg-muted text-xs uppercase leading-4 tracking-[0.08em]'
      >
        It will be able to
      </h2>
      {permissions.length > 0 ? (
        <ul className='m-0 list-none p-0'>
          {permissions.map(({resource, title, Icon, description}) => (
            <li key={resource} className='flex items-start gap-3 py-1.5 text-sm'>
              <Icon className='mt-px text-fg-secondary text-xl' />
              <span>
                <span className='block font-semibold'>{title}</span>
                <span className='block text-[13px] text-fg-secondary leading-[18px]'>
                  {description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='m-0 text-sm'>Nothing yet. It isn’t asking for any permissions.</p>
      )}
    </section>
  )
}

export default OAuthConsentPermissions
