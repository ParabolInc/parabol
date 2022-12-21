import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {PALETTE} from '../styles/paletteV3'
import {TeamsLimit} from '../types/constEnums'
import relativeDate from '../utils/date/relativeDate'
import {InsightsDomainNudge_domain$key} from '../__generated__/InsightsDomainNudge_domain.graphql'
import PrimaryButton from './PrimaryButton'

const NudgeBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  padding: 16,
  width: '100%'
})

const WarningMsg = styled('div')({
  background: PALETTE.GOLD_100,
  padding: '16px',
  fontSize: 16,
  borderRadius: 2,
  lineHeight: '26px',
  fontWeight: 500
})

const BoldText = styled('span')({
  fontWeight: 600
})

const OverLimitBlock = styled('div')({
  backgroundColor: PALETTE.GOLD_100,
  borderRadius: 2,
  color: PALETTE.SLATE_900,
  fontSize: 16,
  lineHeight: '24px',
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap'
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
        viewerOrganizations {
          id
          name
          scheduledLockAt
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
  const history = useHistory()
  const {id: domainId, suggestedTier, tier, viewerOrganizations} = domain
  const personalOrganizations = viewerOrganizations
    .filter((org) => org.tier === 'personal')
    .sort((a, b) => (a.orgUserCount > b.orgUserCount ? -1 : 1))
  const [biggestOrganization] = personalOrganizations
  const organizationName = biggestOrganization?.name ?? ''
  const suggestPro = suggestedTier === 'pro' && tier === 'personal'
  const suggestEnterprise = suggestedTier === 'enterprise' && tier !== 'enterprise'
  const toBeLockedOrg = viewerOrganizations.find(({scheduledLockAt}) => scheduledLockAt)
  const showNudge = suggestPro || suggestEnterprise || toBeLockedOrg
  const CTACopy = suggestPro || toBeLockedOrg ? `Upgrade ${organizationName}` : 'Contact Us'
  const CTAType = suggestPro ? 'pro' : 'enterprise'
  const onClickCTA = () => {
    const event = toBeLockedOrg ? 'Upgrade CTA Clicked' : 'Clicked Domain Stats CTA'
    const variables = toBeLockedOrg
      ? ({
          upgradeCTALocation: 'usageStats',
          orgId: biggestOrganization?.id,
          upgradeTier: 'pro'
        } as const)
      : ({CTAType, domainId} as const)
    SendClientSegmentEventMutation(atmosphere, event, variables)
    if (toBeLockedOrg) {
      history.push(`/me/organizations/${biggestOrganization?.id}/billing`)
    } else if (suggestPro) {
      togglePortal()
    } else if (suggestEnterprise) {
      window.open('mailto:love@parabol.co?subject=Increase Usage Limits')
    }
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
            <WarningMsg>
              <BoldText>{domainId}</BoldText>
              {` is over the limit of `}
              <BoldText>{`${TeamsLimit.PERSONAL_TIER_MAX_TEAMS} free teams`}</BoldText>
              {toBeLockedOrg?.scheduledLockAt && (
                <>
                  {`. Your free access will end in `}
                  <BoldText>{`${relativeDate(toBeLockedOrg?.scheduledLockAt)}.`}</BoldText>
                </>
              )}
            </WarningMsg>
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
