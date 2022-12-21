import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
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
  const atmosphere = useAtmosphere()
  const {id: domainId, suggestedTier, tier, organizations} = domain
  const starterOrganizations = organizations
    .filter((org) => org.tier === 'starter')
    .sort((a, b) => (a.orgUserCount > b.orgUserCount ? -1 : 1))
  const [biggestOrganization] = starterOrganizations
  const organizationName = biggestOrganization?.name ?? ''
  const suggestTeam = suggestedTier === 'team' && tier === 'starter'
  const suggestEnterprise = suggestedTier === 'enterprise' && tier !== 'enterprise'
  const showNudge = suggestTeam || suggestEnterprise
  const CTACopy = suggestTeam ? `Upgrade ${organizationName} to Team` : 'Contact Us'
  const CTAType = suggestTeam ? 'team' : 'enterprise'
  const onClickCTA = () => {
    if (suggestTeam) {
      togglePortal()
    } else if (suggestEnterprise) {
      window.open('mailto:love@parabol.co?subject=Increase Usage Limits')
    }
    SendClientSegmentEventMutation(atmosphere, 'Clicked Domain Stats CTA', {
      CTAType,
      domainId
    })
  }
  const {togglePortal, closePortal, modalPortal} = useModal()
  return (
    <>
      {modalPortal(
        <CreditCardModal
          // will be null if they successfully upgraded their last free org
          activeUserCount={biggestOrganization?.orgUserCount?.activeUserCount ?? 0}
          orgId={biggestOrganization?.id ?? ''}
          actionType={'upgrade'}
          closePortal={closePortal}
        />
      )}
      {showNudge && (
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
        </NudgeBlock>
      )}
    </>
  )
}

export default InsightsDomainNudge
