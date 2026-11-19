import graphql from 'babel-plugin-relay/macro'
import {useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {ConnectedAppRow_grant$key} from '../../../__generated__/ConnectedAppRow_grant.graphql'
import AIAppIdentity from '../../../components/AIAppIdentity'
import AIAppScopeList from '../../../components/AIAppScopeList'
import {Button} from '../../../ui/Button/Button'
import DisconnectAppDialog from './DisconnectAppDialog'

interface Props {
  grantRef: ConnectedAppRow_grant$key
}

const ConnectedAppRow = ({grantRef}: Props) => {
  const grant = useFragment(
    graphql`
      fragment ConnectedAppRow_grant on OAuthAPIGrant {
        id
        clientName
        clientHost
        clientVerifiedAt
        scopes
        grantedOrganizations {
          id
          name
        }
        personalGrantedAt
        createdAt
        lastUsedAt
      }
    `,
    grantRef
  )
  const {
    id,
    clientName,
    clientHost,
    clientVerifiedAt,
    scopes,
    grantedOrganizations,
    personalGrantedAt,
    createdAt,
    lastUsedAt
  } = grant
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const orgsLine = grantedOrganizations
    ? grantedOrganizations.map(({name}) => name).join(', ')
    : 'All my organizations'
  return (
    <tr className='border-hairline border-b last:border-0'>
      <td className='whitespace-nowrap px-4 py-3'>
        <AIAppIdentity name={clientName} host={clientHost} verifiedAt={clientVerifiedAt} />
      </td>
      <td className='px-4 py-3'>
        <div className='font-medium text-fg-primary'>
          {orgsLine}
          {personalGrantedAt && ' + private pages'}
        </div>
        {!grantedOrganizations && (
          <div className='text-fg-muted text-xs'>Including ones you join later</div>
        )}
      </td>
      <td className='whitespace-nowrap px-4 py-3'>
        <AIAppScopeList scopes={scopes} />
      </td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {new Date(createdAt).toLocaleDateString()}
      </td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {lastUsedAt ? new Date(lastUsedAt).toLocaleDateString() : '—'}
      </td>
      <td className='px-4 py-3 text-right'>
        <Button
          ref={triggerRef}
          variant='outline'
          size='sm'
          aria-label={`Disconnect ${clientName}`}
          onClick={() => setIsDialogOpen(true)}
        >
          Disconnect
        </Button>
      </td>
      {isDialogOpen && (
        <DisconnectAppDialog
          grantId={id}
          appName={clientName}
          includesPrivatePages={!!personalGrantedAt}
          onClose={() => setIsDialogOpen(false)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
        />
      )}
    </tr>
  )
}

export default ConnectedAppRow
