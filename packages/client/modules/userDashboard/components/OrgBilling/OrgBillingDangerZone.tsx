import styled from '@emotion/styled'
import {Email as EmailIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import ArchiveOrganization from '~/modules/teamDashboard/components/ArchiveTeam/ArchiveOrganization'
import {OrgBillingDangerZone_organization$key} from '~/__generated__/OrgBillingDangerZone_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
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

const Unsubscribe = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  justifyContent: 'center',
  '& a': {
    alignItems: 'center',
    color: PALETTE.SKY_500,
    display: 'flex',
    marginLeft: 8,
    '& > u': {
      textDecoration: 'none'
    },
    '&:hover > u, &:focus > u': {
      textDecoration: 'underline'
    }
  }
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
        isBillingLeader
        tier
      }
    `,
    organizationRef
  )
  const {isBillingLeader, tier} = organization
  if (!isBillingLeader) return null
  const isStarter = tier === 'starter'
  return (
    <StyledPanel isWide={isWide} label='Danger Zone'>
      <PanelRow>
        {isStarter ? (
          <ArchiveOrganization organization={organization} />
        ) : (
          <Unsubscribe>
            <span>{'Need to cancel? It’s painless. '}</span>
            <a
              href='mailto:love@parabol.co?subject=Instant Unsubscribe from Team Plan'
              title='Instant Unsubscribe from Team Plan'
            >
              <u>{'Contact us'}</u>
              <EnvelopeIcon>
                <EmailIcon />
              </EnvelopeIcon>
            </a>
          </Unsubscribe>
        )}
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgBillingDangerZone
