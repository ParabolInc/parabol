import {Link} from 'react-router'
import {ExtensionOff as ExtensionOffIcon} from '~/ui/icons'

interface Props {
  orgId: string | null
  isOrgAdmin: boolean
}

const linkClassName = 'no-underline! font-semibold! text-accent!'

export const InsightsBlockDisabledNotice = (props: Props) => {
  const {orgId, isOrgAdmin} = props
  const nextStep = !orgId ? (
    <div>Please contact an org admin for support.</div>
  ) : isOrgAdmin ? (
    <div>
      Enable AI features in your{' '}
      <Link to={`/me/organizations/${orgId}/settings`} className={linkClassName}>
        Organization Settings
      </Link>
      .
    </div>
  ) : (
    <div>
      Please contact an{' '}
      <Link to={`/me/organizations/${orgId}/members`} className={linkClassName}>
        org admin
      </Link>{' '}
      for support.
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
