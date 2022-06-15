import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {PALETTE} from '../styles/paletteV3'
import {InsightsDomainNudge_domain$key} from '../__generated__/InsightsDomainNudge_domain.graphql'
import PrimaryButton from './PrimaryButton'

const NudgeBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  padding: 16,
  width: '100%'
})

const OverLimitBlock = styled('div')({
  backgroundColor: PALETTE.GOLD_100,
  borderRadius: 2,
  color: PALETTE.SLATE_900,
  fontSize: 16,
  lineHeight: '24px',
  width: '100%'
})

const OverLimitCopy = styled('div')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: '4px 12px'
})

const CTA = styled(PrimaryButton)({
  lineHeight: '24px',
  padding: '8px 32px',
  width: 'fit-content'
})

const ButtonBlock = styled('div')({
  paddingTop: 16
})

interface Props {
  domainRef: InsightsDomainNudge_domain$key
}

const InsightsDomainNudge = (props: Props) => {
  const {domainRef} = props
  const atmosphere = useAtmosphere()
  const domain = useFragment(
    graphql`
      fragment InsightsDomainNudge_domain on Company {
        id
        suggestedTier
        tier
        organizations {
          id
          name
          tier
          orgUserCount {
            activeUserCount
          }
        }
      }
    `,
    domainRef
  )
  const {id: domainId, suggestedTier, tier, organizations} = domain
  const personalOrganizations = organizations
    .filter((org) => org.tier === 'personal')
    .sort((a, b) => (a.orgUserCount > b.orgUserCount ? -1 : 1))
  const [biggestOrganization] = personalOrganizations
  const organizationName = biggestOrganization?.name ?? ''
  const suggestPro = suggestedTier === 'pro' && tier === 'personal'
  const suggestEnterprise = suggestedTier === 'enterprise' && tier !== 'enterprise'
  const showNudge = suggestPro || suggestEnterprise
  const CTACopy = suggestPro ? `Upgrade ${organizationName} to Pro` : 'Contact Us'
  const onClickCTA = () => {
    const ctaType = suggestPro ? 'pro' : suggestEnterprise ? 'enterprise' : 'personal'
    SendClientSegmentEventMutation(atmosphere, 'Clicked Domain Stats CTA', {
      ctaType,
      domainId
    })
    if (suggestPro) {
      togglePortal()
    } else if (suggestEnterprise) {
      window.open('mailto:love@parabol.co?subject=Increase Usage Limits')
    }
  }
  const {togglePortal, closePortal, modalPortal} = useModal()
  if (!showNudge) return null
  return (
    <NudgeBlock>
      <OverLimitBlock>
        <OverLimitCopy>
          <b>{domainId}</b> is over the limit of <b>2 Free Teams</b>
        </OverLimitCopy>
      </OverLimitBlock>
      <ButtonBlock>
        <CTA size={'large'} onClick={onClickCTA}>
          {CTACopy}
        </CTA>
      </ButtonBlock>
      {biggestOrganization &&
        modalPortal(
          <CreditCardModal
            activeUserCount={biggestOrganization.orgUserCount.activeUserCount}
            orgId={biggestOrganization.id}
            actionType={'upgrade'}
            closePortal={closePortal}
          />
        )}
    </NudgeBlock>
  )
}

export default InsightsDomainNudge
