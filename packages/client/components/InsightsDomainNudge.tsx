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
import {InsightsDomainNudge_domain$key} from '../__generated__/InsightsDomainNudge_domain.graphql'
import PrimaryButton from './PrimaryButton'
import LimitExceededWarning from './LimitExceededWarning'

const NudgeBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  padding: 16,
  width: '100%'
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
          ...LimitExceededWarning_organization
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
  const {togglePortal, closePortal, modalPortal} = useModal()
  const {id: domainId, suggestedTier, tier, organizations} = domain
  const starterOrganizations = organizations
    .filter((org) => org.tier === 'starter')
    .sort((a, b) => (a.orgUserCount > b.orgUserCount ? -1 : 1))
  const [biggestOrganization] = starterOrganizations
  if (!biggestOrganization) return null
  const {id: biggestOrganizationId, name: organizationName, orgUserCount} = biggestOrganization
  const suggestTeam = suggestedTier === 'team' && tier === 'starter'
  const suggestEnterprise = suggestedTier === 'enterprise' && tier !== 'enterprise'
  const toBeLockedOrg = organizations.find(({scheduledLockAt}) => scheduledLockAt)
  const showNudge = suggestTeam || suggestEnterprise || toBeLockedOrg
  const CTACopy = suggestTeam || toBeLockedOrg ? `Upgrade ${organizationName}` : 'Contact Us'
  const CTAType = suggestTeam ? 'team' : 'enterprise'

  const onClickCTA = () => {
    const event = toBeLockedOrg ? 'Upgrade CTA Clicked' : 'Clicked Domain Stats CTA'
    const variables = toBeLockedOrg
      ? ({
          upgradeCTALocation: 'usageStats',
          orgId: biggestOrganizationId,
          upgradeTier: 'team'
        } as const)
      : ({CTAType, domainId} as const)
    SendClientSegmentEventMutation(atmosphere, event, variables)
    if (toBeLockedOrg) {
      history.push(`/me/organizations/${biggestOrganizationId}/billing`)
    } else if (suggestTeam) {
      togglePortal()
    } else if (suggestEnterprise) {
      window.open('mailto:love@parabol.co?subject=Increase Usage Limits')
    }
  }

  return (
    <>
      {modalPortal(
        <CreditCardModal
          // will be null if they successfully upgraded their last free org
          activeUserCount={orgUserCount.activeUserCount}
          orgId={biggestOrganizationId}
          actionType={'upgrade'}
          closePortal={closePortal}
        />
      )}
      {showNudge && (
        <NudgeBlock>
          <LimitExceededWarning organizationRef={biggestOrganization} domainId={domainId} />
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
