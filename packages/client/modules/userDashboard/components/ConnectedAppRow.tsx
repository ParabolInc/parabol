import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ConnectedAppRow_grant$key} from '../../../__generated__/ConnectedAppRow_grant.graphql'
import {useRevokeOAuthAPIGrantMutation} from '../../../mutations/useRevokeOAuthAPIGrantMutation'
import {Button} from '../../../ui/Button/Button'
import formatOAuthScope from '../../../utils/formatOAuthScope'
import ConnectedAppAccess from './ConnectedAppAccess'

interface Props {
  grantRef: ConnectedAppRow_grant$key
}

const ConnectedAppRow = ({grantRef}: Props) => {
  const grant = useFragment(
    graphql`
      fragment ConnectedAppRow_grant on OAuthAPIGrant {
        id
        appName
        redirectUris
        scopes
        createdAt
        lastUsedAt
        ...ConnectedAppAccess_grant
      }
    `,
    grantRef
  )
  const [revokeOAuthAPIGrant, submitting] = useRevokeOAuthAPIGrantMutation()
  const {id, appName, redirectUris, scopes, createdAt, lastUsedAt} = grant
  const redirectHosts = [...new Set(redirectUris.map((uri) => new URL(uri).host))]
  return (
    <tr className='border-hairline border-b last:border-0'>
      <td className='px-4 py-3'>
        <div className='font-medium text-fg-primary'>{appName}</div>
        <div className='text-fg-muted text-xs'>{redirectHosts.join(', ')}</div>
      </td>
      <td className='max-w-[200px] px-4 py-3 text-fg-primary'>
        <ConnectedAppAccess grantRef={grant} />
      </td>
      <td className='max-w-[200px] px-4 py-3 text-fg-primary'>
        {scopes.map(formatOAuthScope).join(', ')}
      </td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {new Date(createdAt).toLocaleDateString()}
      </td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {lastUsedAt ? new Date(lastUsedAt).toLocaleDateString() : '—'}
      </td>
      <td className='px-4 py-3 text-right'>
        <Button
          variant='outline'
          size='sm'
          disabled={submitting}
          onClick={() => revokeOAuthAPIGrant({variables: {grantId: id}})}
        >
          Disconnect
        </Button>
      </td>
    </tr>
  )
}

export default ConnectedAppRow
