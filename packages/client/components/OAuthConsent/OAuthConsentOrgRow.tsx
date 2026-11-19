import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentOrgRow_organization$key} from '../../__generated__/OAuthConsentOrgRow_organization.graphql'
import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {cn} from '../../ui/cn'

interface Props {
  organizationRef: OAuthConsentOrgRow_organization$key
  isPicking: boolean
  isPicked: boolean
  onTogglePicked: (orgId: string) => void
}

const OAuthConsentOrgRow = ({organizationRef, isPicking, isPicked, onTogglePicked}: Props) => {
  const {blockedReason, adminName, organization} = useFragment(
    graphql`
      fragment OAuthConsentOrgRow_organization on OAuthAuthorizationOrganization {
        blockedReason
        adminName
        organization {
          id
          name
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, name} = organization
  const isBlocked = !!blockedReason
  const reason =
    blockedReason === 'VERIFIED_ONLY' ? 'Only verified apps allowed' : 'No apps allowed'
  return (
    <div role='listitem' className='border-hairline border-b last:border-0'>
      <label
        className={cn(
          'flex items-start gap-2 px-3 py-2',
          isPicking && !isBlocked && 'cursor-pointer select-none'
        )}
      >
        {isPicking && (
          <Checkbox
            checked={isPicked && !isBlocked}
            disabled={isBlocked}
            onCheckedChange={() => onTogglePicked(orgId)}
            className='mt-0.5 shrink-0'
          />
        )}
        <span className='flex min-w-0 flex-col'>
          <span className={cn('wrap-anywhere font-medium', isBlocked && 'text-fg-muted')}>
            {name}
          </span>
          {isBlocked && (
            <span className='text-fg-secondary text-xs'>
              {reason}
              {adminName && ` · Ask ${adminName}, an org admin`}
            </span>
          )}
        </span>
      </label>
    </div>
  )
}

export default OAuthConsentOrgRow
