import styled from '@emotion/styled'
import {Email as EmailIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import ArchiveOrganization from '~/modules/teamDashboard/components/ArchiveTeam/ArchiveOrganization'
import {OrgBillingDangerZone_organization} from '~/__generated__/OrgBillingDangerZone_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout} from '../../../../types/constEnums'

const EnvelopeIcon = styled('div')({
  height: 18,
  width: 18,
  '& svg': {
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

interface Props {
  organization: OrgBillingDangerZone_organization
}
const OrgBillingDangerZone = (props: Props) => {
  const {organization} = props

  //FIXME i18n: Danger Zone
  //FIXME i18n: mailto:love@parabol.co?subject=Instant Unsubscribe from Pro
  //FIXME i18n: Instant Unsubscribe from Pro
  const {t} = useTranslation()

  const {isBillingLeader, tier} = organization
  if (!isBillingLeader) return null
  const isPersonal = tier === 'personal'
  return (
    <Panel label='Danger Zone'>
      <PanelRow>
        {isPersonal ? (
          <ArchiveOrganization organization={organization} />
        ) : (
          <Unsubscribe>
            <span>{t('OrgBillingDangerZone.NeedToCancelItSPainless')}</span>
            <a
              href='mailto:love@parabol.co?subject=Instant Unsubscribe from Pro'
              title='Instant Unsubscribe from Pro'
            >
              <u>{t('OrgBillingDangerZone.ContactUs')}</u>
              <EnvelopeIcon>
                <EmailIcon />
              </EnvelopeIcon>
            </a>
          </Unsubscribe>
        )}
      </PanelRow>
    </Panel>
  )
}

export default createFragmentContainer(OrgBillingDangerZone, {
  organization: graphql`
    fragment OrgBillingDangerZone_organization on Organization {
      ...ArchiveOrganization_organization
      isBillingLeader
      tier
    }
  `
})
