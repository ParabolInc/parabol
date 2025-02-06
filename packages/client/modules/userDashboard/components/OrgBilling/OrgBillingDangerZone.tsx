import styled from '@emotion/styled'
import {Email as EmailIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgBillingDangerZone_organization$key} from '~/__generated__/OrgBillingDangerZone_organization.graphql'
import ArchiveOrganization from '~/modules/teamDashboard/components/ArchiveTeam/ArchiveOrganization'
import Panel from '../../../../components/Panel/Panel'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth, Layout} from '../../../../types/constEnums'

const EnvelopeIcon = styled('div')({
  height: 18,
  width: 18,
  svg: {
    fontSize: 18
  },
  marginLeft: 4
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  textAlign: 'center'
})

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

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
  const {history} = useRouter()
  const {id, isBillingLeader, billingTier} = organization
  if (!isBillingLeader)
    return (
      <StyledPanel isWide={isWide} label='Danger Zone'>
        <PanelRow>
          <div className='text-slate-700'>
            {'Only the billing leader can manage this organization'}
          </div>
        </PanelRow>
      </StyledPanel>
    )
  const isStarter = billingTier === 'starter'
  const isTeam = billingTier === 'team'

  const handleDowngrade = () => {
    history.push(`/me/organizations/${id}/billing`)
  }

  return (
    <StyledPanel isWide={isWide} label='Danger Zone'>
      <PanelRow>
        {isStarter ? (
          <ArchiveOrganization organization={organization} />
        ) : isTeam ? (
          <div className='flex items-center justify-center text-slate-700'>
            <span>{'Need to cancel? '}</span>
            <a
              onClick={handleDowngrade}
              title='Downgrade'
              className='mr-1 ml-1 flex items-center text-sky-500'
            >
              <u className='no-underline hover:cursor-pointer hover:underline focus:underline'>
                {'Downgrade'}
              </u>
            </a>
            <span>{' to the Starter tier'}</span>
          </div>
        ) : (
          <div className='flex items-center justify-center text-slate-700'>
            <span>{'Need to cancel? It’s painless. '}</span>
            <a
              href='mailto:love@parabol.co?subject=Instant Unsubscribe from Team Plan'
              title='Instant Unsubscribe from Team Plan'
              className='mr-1 ml-1 flex items-center text-sky-500'
            >
              <u className='no-underline hover:cursor-pointer hover:underline focus:underline'>
                {'Contact us'}
              </u>
              <EnvelopeIcon>
                <EmailIcon />
              </EnvelopeIcon>
            </a>
          </div>
        )}
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgBillingDangerZone
