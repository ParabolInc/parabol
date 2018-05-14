// @flow
import React from 'react';
import InlineEstimatedCost from 'universal/components/InlineEstimatedCost';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import {PRO_LABEL, BILLING_LEADER_LABEL} from 'universal/utils/constants';
import {PRICING_LINK} from 'universal/utils/externalLinks';
import UpgradeBenefits from 'universal/components/UpgradeBenefits';
import {createFragmentContainer} from 'react-relay';
import type {UpgradeSqueeze_organization as Organization} from './__generated__/UpgradeSqueeze_organization.graphql';
import UpgradeCreditCardForm from 'universal/modules/userDashboard/components/CreditCardModal/UpgradeCreditCardForm';

type Props = {
  onSuccess: () => void,
  organization: Organization
};

const flexBase = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
};

const modalCopyBase = {
  fontSize: '.9375rem',
  lineHeight: '2rem',
  margin: 0
};

const ModalBoundary = styled('div')({
  ...flexBase,
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  height: 374,
  width: 700
});

const ModalContentPanel = styled('div')({
  ...flexBase,
  flex: 1,
  flexDirection: 'column',
  padding: '2rem'
});

const ModalActionPanel = styled('div')({
  ...flexBase,
  backgroundColor: ui.backgroundColor,
  borderRadius: `0 ${ui.modalBorderRadius} ${ui.modalBorderRadius} 0`,
  height: '100%',
  padding: '1.25rem',
  width: '20rem'
});

const ModalContent = styled('div')({
  textAlign: 'left'
});

const ModalContentSpacer = styled('div')({
  height: '1rem'
});

const ModalHeading = styled('h2')({
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0 0 .5rem'
});

const StyledIcon = styled(StyledFontAwesome)({
  color: ui.linkColor,
  fontSize: ui.iconSize,
  marginRight: '.5rem',
  opacity: 0.5,
  width: '1.125rem'
});

const ModalLink = styled('a')({
  ...modalCopyBase,
  color: ui.palette.mid,
  ':hover,:focus': {
    textDecoration: 'underline'
  }
});

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
});

const pricingLinkCopy = 'Learn About Plans & Invoicing';

const UpgradeSqueeze = (props: Props) => {
  const {onSuccess, organization} = props;
  const {orgId, billingLeaders, isBillingLeader, orgUserCount: {activeUserCount}} = organization;
  const hasManyBillingLeaders = billingLeaders.length !== 1;
  const emailTheBillingLeader = () => {
    const {email, preferredName} = billingLeaders[0];
    return (
      <BillingLeaders>
        <h3>{`Contact your ${BILLING_LEADER_LABEL},`}<br />{`${preferredName}, to upgrade:`}</h3>
        <a href={`mailto:${email}`} title={`Email ${email}`}>{email}</a>
      </BillingLeaders>
    );
  };
  const emailAnyBillingLeader = () => (
    <BillingLeaders>
      <h3>{`Contact a ${BILLING_LEADER_LABEL} to upgrade:`}</h3>
      {billingLeaders.map(({email}) => (
        <a href={`mailto:${email}`} key={email} title={`Email ${email}`}>{email}</a>
      ))}
    </BillingLeaders>
  );
  return (
    <ModalBoundary>
      <ModalContentPanel>
        <ModalHeading>{`Upgrade to ${PRO_LABEL}`}</ModalHeading>
        <ModalContent>
          <UpgradeBenefits />
          <ModalContentSpacer />
          <InlineEstimatedCost activeUserCount={activeUserCount} />
          <ModalLink href={PRICING_LINK} rel="noopener no2referrer" target="_blank" title={pricingLinkCopy}>
            <StyledIcon name={ui.iconExternalLink} />
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
  );
};

export default createFragmentContainer(
  UpgradeSqueeze,
  graphql`
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
);
