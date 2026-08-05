import {Email as EmailIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {OrgBillingDangerZone_organization$key} from '~/__generated__/OrgBillingDangerZone_organization.graphql'
import ArchiveOrganization from '~/modules/teamDashboard/components/ArchiveTeam/ArchiveOrganization'
import Panel from '../../../../components/Panel/Panel'

interface Props {
  organization: OrgBillingDangerZone_organization$key
  isWide?: boolean
}

const OrgBillingDangerZone = (props: Props) => {
  const {organization: organizationRef, isWide = false} = props
  const organization = useFragment(
    graphql`
      fragment OrgBillingDangerZone_organization on Organization {
        ...ArchiveOrganization_organization
        id
        isBillingLeader
        billingTier
      }
    `,
    organizationRef
  )
  const navigate = useNavigate()
  const {id, isBillingLeader, billingTier} = organization
  if (!isBillingLeader)
    return (
      <Panel className={isWide ? 'max-w-[976px]' : 'max-w-[inherit]'} label='Danger Zone'>
        <div className='border-hairline border-t p-4 text-center'>
          <div className='text-fg-primary'>
            {'Only the billing leader can manage this organization'}
          </div>
        </div>
      </Panel>
    )
  const isStarter = billingTier === 'starter'
  const isTeam = billingTier === 'team'

  const handleDowngrade = () => {
    navigate(`/me/organizations/${id}/billing`)
  }

  return (
    <Panel className={isWide ? 'max-w-[976px]' : 'max-w-[inherit]'} label='Danger Zone'>
      <div className='border-hairline border-t p-4 text-center'>
        {isStarter ? (
          <ArchiveOrganization organization={organization} />
        ) : isTeam ? (
          <div className='flex items-center justify-center text-fg-primary'>
            <span>{'Need to cancel? '}</span>
            <a
              onClick={handleDowngrade}
              title='Downgrade'
              className='mr-1 ml-1 flex items-center text-accent'
            >
              <u className='no-underline hover:cursor-pointer hover:underline focus:underline'>
                {'Downgrade'}
              </u>
            </a>
            <span>{' to the Starter tier'}</span>
          </div>
        ) : (
          <div className='flex items-center justify-center text-fg-primary'>
            <span>{'Need to cancel? It’s painless. '}</span>
            <a
              href='mailto:love@parabol.co?subject=Instant Unsubscribe from Team Plan'
              title='Instant Unsubscribe from Team Plan'
              className='mr-1 ml-1 flex items-center text-accent'
            >
              <u className='no-underline hover:cursor-pointer hover:underline focus:underline'>
                {'Contact us'}
              </u>
              <div className='ml-1 h-[18px] w-[18px] [&_svg]:text-[18px]'>
                <EmailIcon />
              </div>
            </a>
          </div>
        )}
      </div>
    </Panel>
  )
}

export default OrgBillingDangerZone
