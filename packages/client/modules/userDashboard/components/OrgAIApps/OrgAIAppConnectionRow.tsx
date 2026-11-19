import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OrgAIAppConnectionRow_grant$key} from '../../../../__generated__/OrgAIAppConnectionRow_grant.graphql'
import AIAppIdentity from '../../../../components/AIAppIdentity'
import AIAppScopeList from '../../../../components/AIAppScopeList'
import Avatar from '../../../../components/Avatar/Avatar'
import {cn} from '../../../../ui/cn'
import {Lock} from '../../../../ui/icons'
import OrgAIAppConnectionMenu from './OrgAIAppConnectionMenu'

interface Props {
  grantRef: OrgAIAppConnectionRow_grant$key
  isBlocked: boolean
  orgId: string
  orgName: string
}

const OrgAIAppConnectionRow = ({grantRef, isBlocked, orgId, orgName}: Props) => {
  const grant = useFragment(
    graphql`
      fragment OrgAIAppConnectionRow_grant on OAuthAPIGrant {
        id
        clientName
        clientVerifiedAt
        scopes
        createdAt
        lastUsedAt
        user {
          preferredName
          picture
        }
      }
    `,
    grantRef
  )
  const {id, clientName, clientVerifiedAt, scopes, createdAt, lastUsedAt, user} = grant
  const dataCellClass = cn('px-4 py-3', isBlocked && 'opacity-50')
  return (
    <tr className='border-hairline border-b last:border-0'>
      <td className={dataCellClass}>
        <div className='flex items-center gap-2'>
          <Avatar picture={user.picture} className='size-6' />
          <span className='wrap-anywhere font-medium text-fg-primary'>{user.preferredName}</span>
        </div>
      </td>
      <td className={dataCellClass}>
        <AIAppIdentity name={clientName} verifiedAt={clientVerifiedAt} />
      </td>
      <td className={dataCellClass}>
        <AIAppScopeList scopes={scopes} />
      </td>
      <td className={cn(dataCellClass, 'whitespace-nowrap text-fg-primary')}>
        {new Date(createdAt).toLocaleDateString()}
      </td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {isBlocked ? (
          <span className='inline-flex items-center gap-1 font-semibold'>
            <Lock className='text-base' />
            Blocked
          </span>
        ) : lastUsedAt ? (
          new Date(lastUsedAt).toLocaleDateString()
        ) : (
          '—'
        )}
      </td>
      <td className='px-4 py-3 text-right'>
        <OrgAIAppConnectionMenu
          grantId={id}
          appName={clientName}
          isUnverified={!clientVerifiedAt}
          memberName={user.preferredName}
          orgId={orgId}
          orgName={orgName}
        />
      </td>
    </tr>
  )
}

export default OrgAIAppConnectionRow
