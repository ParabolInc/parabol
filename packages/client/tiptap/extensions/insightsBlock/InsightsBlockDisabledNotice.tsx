import {Link} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExtensionOff as ExtensionOffIcon} from '~/ui/icons'
import type {InsightsBlockDisabledNotice_organization$key} from '../../../__generated__/InsightsBlockDisabledNotice_organization.graphql'

interface Props {
  organizationRef: InsightsBlockDisabledNotice_organization$key | null
}

const linkClassName = 'no-underline! font-semibold! text-accent!'

export const InsightsBlockDisabledNotice = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment InsightsBlockDisabledNotice_organization on Organization {
        id
        isOrgAdmin
      }
    `,
    organizationRef
  )
  const nextStep = !organization ? (
    <div>Ask an org admin to turn them back on.</div>
  ) : organization.isOrgAdmin ? (
    <div>
      Turn them back on in{' '}
      <Link
        to='/me/organizations/$orgId/settings'
        params={{orgId: organization.id}}
        className={linkClassName}
      >
        Organization Settings
      </Link>
      .
    </div>
  ) : (
    <div>
      Ask an{' '}
      <Link
        to='/me/organizations/$orgId/members'
        params={{orgId: organization.id}}
        className={linkClassName}
      >
        org admin
      </Link>{' '}
      to turn them back on.
    </div>
  )
  return (
    <div
      contentEditable={false}
      className='flex items-center justify-center gap-4 rounded-lg p-4 text-fg-primary text-sm'
    >
      <div className='flex items-center justify-center rounded-full p-2'>
        <ExtensionOffIcon className='size-12 text-fg-secondary' />
      </div>
      <div className='flex flex-col'>
        <div className='font-semibold'>Your organization has disabled AI features.</div>
        {nextStep}
      </div>
    </div>
  )
}
