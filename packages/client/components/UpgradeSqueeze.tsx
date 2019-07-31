import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import InlineEstimatedCost from './InlineEstimatedCost'
import UpgradeBenefits from './UpgradeBenefits'
import ui from '../styles/ui'
import {BILLING_LEADER_LABEL, PRO_LABEL} from '../utils/constants'
import {PRICING_LINK} from '../utils/externalLinks'
import {UpgradeSqueeze_organization} from '../__generated__/UpgradeSqueeze_organization.graphql'
import UpgradeCreditCardForm from '../modules/userDashboard/components/CreditCardModal/UpgradeCreditCardForm'
import Icon from './Icon'
import {MD_ICONS_SIZE_18} from '../styles/icons'

interface Props {
  onSuccess: () => void
  organization: UpgradeSqueeze_organization
}

const flexBase = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
}

const ModalBoundary = styled('div')({
  ...flexBase,
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  height: 374,
  width: 700
})

const ModalContentPanel = styled('div')({
  ...flexBase,
  flex: 1,
  flexDirection: 'column',
  padding: '2rem'
})

const ModalActionPanel = styled('div')({
  ...flexBase,
  backgroundColor: ui.backgroundColor,
  borderRadius: `0 ${ui.modalBorderRadius} ${ui.modalBorderRadius} 0`,
  height: '100%',
  padding: '1.25rem',
  width: '20rem'
})

const ModalContent = styled('div')({
  textAlign: 'left'
})

const ModalContentSpacer = styled('div')({
  height: '1rem'
})

const ModalHeading = styled('h2')({
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0 0 .5rem'
})

const StyledIcon = styled(Icon)({
  color: ui.linkColor,
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem',
  opacity: 0.5
})

const ModalLink = styled('a')({
  alignItems: 'center',
  display: 'flex',
  fontSize: '.9375rem',
  lineHeight: '2rem',
  margin: 0,
  color: ui.palette.mid,
  ':hover,:focus': {
    textDecoration: 'underline'
  }
})

const BillingLeaders = styled('div')({
  lineHeight: 1.5,
  textAlign: 'center',
  width: '100%',
  '& h3': {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 1rem'
  },
  '& a': {
    color: ui.palette.mid,
    display: 'block',
    margin: '.5rem 0',
    ':hover, :focus': {
      textDecoration: 'underline'
    }
  }
})

const pricingLinkCopy = 'Learn About Plans & Invoicing'

const UpgradeSqueeze = (props: Props) => {
  const {onSuccess, organization} = props
  const {
    orgId,
    billingLeaders,
    isBillingLeader,
    orgUserCount: {activeUserCount}
  } = organization
  const hasManyBillingLeaders = billingLeaders.length !== 1
  const emailTheBillingLeader = () => {
    const [billingLeader] = billingLeaders
    const preferredName = billingLeader.preferredName || ''
    const email = billingLeader.email || ''
    return (
      <BillingLeaders>
        <h3>
          {`Contact your ${BILLING_LEADER_LABEL},`}
          <br />
          {`${preferredName}, to upgrade:`}
        </h3>
        <a href={`mailto:${email}`} title={`Email ${email}`}>
          {email}
        </a>
      </BillingLeaders>
    )
  }
  const emailAnyBillingLeader = () => (
    <BillingLeaders>
      <h3>{`Contact a ${BILLING_LEADER_LABEL} to upgrade:`}</h3>
      {billingLeaders.map(({email}) => (
        <a href={`mailto:${email}`} key={email} title={`Email ${email}`}>
          {email}
        </a>
      ))}
    </BillingLeaders>
  )
  return (
    <ModalBoundary>
      <ModalContentPanel>
        <ModalHeading>{`Upgrade to ${PRO_LABEL}`}</ModalHeading>
        <ModalContent>
          <UpgradeBenefits />
          <ModalContentSpacer />
          <InlineEstimatedCost activeUserCount={activeUserCount} />
          <ModalLink
            href={PRICING_LINK}
            rel='noopener noreferrer'
            target='_blank'
            title={pricingLinkCopy}
          >
            <StyledIcon>{ui.iconExternalLink}</StyledIcon>
            {pricingLinkCopy}
          </ModalLink>
        </ModalContent>
      </ModalContentPanel>
      <ModalActionPanel>
        {isBillingLeader && <UpgradeCreditCardForm orgId={orgId} onSuccess={onSuccess} />}
        {!isBillingLeader && !hasManyBillingLeaders && emailTheBillingLeader()}
        {!isBillingLeader && hasManyBillingLeaders && emailAnyBillingLeader()}
      </ModalActionPanel>
    </ModalBoundary>
  )
}

export default createFragmentContainer(UpgradeSqueeze, {
  organization: graphql`
    fragment UpgradeSqueeze_organization on Organization {
      orgId: id
      isBillingLeader
      billingLeaders {
        email
        preferredName
      }
      orgUserCount {
        activeUserCount
      }
    }
  `
})
