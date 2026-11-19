import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentOrgRow_organization$key} from '../../__generated__/OAuthConsentOrgRow_organization.graphql'
import {initials} from '../../shared/initials'
import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {cn} from '../../ui/cn'
import {CheckCircle, Lock, Person} from '../../ui/icons'
import getTileColorClass from './getTileColorClass'
import OAuthConsentChip from './OAuthConsentChip'
import toPossessive from './toPossessive'

const NOTE_CLASS = 'mt-0.5 flex items-start gap-1.5 text-[13px] text-fg-secondary leading-[18px]'

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
    blockedReason === 'VERIFIED_ONLY'
      ? `${name} allows only verified apps, like Claude and ChatGPT`
      : `${toPossessive(name)} admins don’t allow apps`
  return (
    <div role='listitem' className='border-hairline border-b py-2 last:border-b-0 last:pb-0'>
      <label
        className={cn('flex items-start gap-2.5', isPicking && !isBlocked && 'cursor-pointer')}
      >
        {isPicking && (
          <Checkbox
            checked={isPicked && !isBlocked}
            disabled={isBlocked}
            onCheckedChange={() => onTogglePicked(orgId)}
            className='mt-0.5 shrink-0 disabled:opacity-50'
          />
        )}
        <span
          aria-hidden='true'
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-md font-bold text-[11px] text-white',
            getTileColorClass(orgId)
          )}
        >
          {initials(name)}
        </span>
        <span className='min-w-0 flex-1'>
          <span
            className={cn(
              'wrap-anywhere block font-semibold text-sm leading-5',
              isBlocked && 'text-fg-muted'
            )}
          >
            {name}
          </span>
          {isBlocked && (
            <span className={NOTE_CLASS}>
              <Lock className='mt-px text-base' />
              <span>{reason}</span>
            </span>
          )}
          {isBlocked && adminName && (
            <span className={NOTE_CLASS}>
              <Person className='mt-px text-base' />
              <span>To change this, ask {adminName}, an org admin</span>
            </span>
          )}
        </span>
        {!isPicking &&
          (isBlocked ? (
            <OAuthConsentChip tone='block' Icon={Lock} label='Blocked' />
          ) : (
            <OAuthConsentChip tone='ok' Icon={CheckCircle} label='Included' />
          ))}
      </label>
    </div>
  )
}

export default OAuthConsentOrgRow
