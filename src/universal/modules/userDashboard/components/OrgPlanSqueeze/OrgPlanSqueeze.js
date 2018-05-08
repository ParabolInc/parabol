import React from 'react';
import Button from 'universal/components/Button/Button';
import {PERSONAL, PERSONAL_LABEL, PRO, PRO_LABEL} from 'universal/utils/constants';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import {PRICING_LINK} from 'universal/utils/externalLinks';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import makeGradient from 'universal/styles/helpers/makeGradient';
import {createFragmentContainer} from 'react-relay';
import InlineEstimatedCost from 'universal/components/InlineEstimatedCost';

const personalGradient = makeGradient(ui.palette.mid, ui.palette.midGray);
const professionalGradient = makeGradient(ui.palette.yellow, ui.palette.warm);

const OrgPlanSqueezeRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  margin: '0 auto',
  maxWidth: '40.25rem',
  width: '100%'
});

const TierPanelLayout = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '2rem auto .5rem',
  width: '100%'
});

const TierPanel = styled('div')(({tier}) => ({
  boxShadow: tier === PERSONAL ? ui.shadow[0] : ui.shadow[2],
  borderRadius: ui.borderRadiusLarge,
  width: tier === PERSONAL ? '15rem' : '21.25rem'
}));

const TierPanelHeader = styled('div')(({tier}) => ({
  alignItems: 'center',
  backgroundImage: tier === PERSONAL ? personalGradient : professionalGradient,
  fontSize: tier === PERSONAL ? '1.25rem' : '1.5rem',
  fontWeight: 600,
  borderRadius: `${ui.borderRadiusLarge} ${ui.borderRadiusLarge} 0 0`,
  color: ui.palette.white,
  display: 'flex',
  height: tier === PERSONAL ? '6rem' : '8rem',
  justifyContent: 'center',
  width: '100%'
}));

const TierPanelBody = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  borderRadius: `0 0 ${ui.borderRadiusLarge} ${ui.borderRadiusLarge}`,
  display: 'flex',
  flexDirection: 'column',
  fontSize: '.9375rem',
  lineHeight: 1.5,
  padding: '1.5rem 1.25rem',
  textAlign: 'center',
  width: '100%'
});

const ButtonBlock = styled('div')({
  padding: '1.5rem 1rem',
  textAlign: 'center',
  width: '100%'
});

const CopyWithStatus = styled('div')({
  margin: '0 auto',
  padding: '0 0 .5rem',
  position: 'relative',
  textAlign: 'left',
  '&:before': {
    backgroundColor: ui.palette.green,
    borderRadius: '100%',
    content: '""',
    height: '.625rem',
    left: '-1rem',
    position: 'absolute',
    top: '.375rem',
    width: '.625rem'
  }
});

const EmailBlock = styled('div')({
  margin: '1rem auto 0'
});

const Email = styled('a')({
  color: ui.palette.mid,
  cursor: 'pointer',
  display: 'block',
  fontWeight: 400,
  lineHeight: '2rem',
  margin: '0 auto .5rem',
  ':hover, :focus': {
    color: ui.palette.mid,
    textDecoration: 'underline'
  }
});

type Props = {|
  organization: Object
|};

const OrgPlanSqueeze = (props: Props) => {
  const {organization: {isBillingLeader, billingLeaders, orgUserCount: {activeUserCount}, orgId}} = props;
  const primaryButtonProps = {
    buttonSize: 'medium',
    buttonStyle: 'primary',
    depth: 2,
    isBlock: true
  };
  const toggle = (<Button
    {...primaryButtonProps}
    label="Upgrade to the Pro Plan"
  />);
  const openUrl = (url) => () => window.open(url, '_blank');

  const billingLeaderSqueeze = (
    <TierPanelBody>
      <div>
        {'This could be you.'}<br />
        {'Ready for the full experience?'}
      </div>
      <ButtonBlock>
        <CreditCardModalContainer
          orgId={orgId}
          toggle={toggle}
        />
      </ButtonBlock>
      <InlineEstimatedCost activeUserCount={activeUserCount} />
    </TierPanelBody>
  );

  const makeEmail = (email) => <Email href={`mailto:${email}`} title={`Email ${email}`}>{email}</Email>;

  const nudgeTheBillingLeader = () => {
    const {email, preferredName} = billingLeaders[0];
    return (
      <TierPanelBody>
        <div>
          {'Contact your billing leader,'}<br />
          <b>{preferredName}</b>{', to upgrade:'}
        </div>
        {makeEmail(email)}
      </TierPanelBody>
    );
  };

  const nudgeAnyBillingLeader = () => {
    return (
      <TierPanelBody>
        <div>{'Contact a billing leader to upgrade:'}</div>
        <EmailBlock>
          {billingLeaders.map((billingLeader) => {
            const {billingLeaderId, email} = billingLeader;
            return (
              <div key={billingLeaderId}>
                {makeEmail(email)}
              </div>
            );
          })}
        </EmailBlock>
      </TierPanelBody>
    );
  };

  return (
    <OrgPlanSqueezeRoot>
      <TierPanelLayout>
        {/* Personal Panel */}
        <TierPanel tier={PERSONAL}>
          <TierPanelHeader tier={PERSONAL}>{PERSONAL_LABEL}</TierPanelHeader>
          <TierPanelBody>
            <CopyWithStatus>
              <b>{'Your current plan.'}</b><br />
              {'The basics, for free!'}
            </CopyWithStatus>
          </TierPanelBody>
        </TierPanel>
        {/* Professional Panel */}
        <TierPanel tier={PRO}>
          <TierPanelHeader tier={PRO}>{'Upgrade to '}{PRO_LABEL}</TierPanelHeader>
          {isBillingLeader && billingLeaderSqueeze}
          {!isBillingLeader && billingLeaders.length === 1 && nudgeTheBillingLeader()}
          {!isBillingLeader && billingLeaders.length !== 1 && nudgeAnyBillingLeader()}
        </TierPanel>
      </TierPanelLayout>
      {/* Learn More Link */}
      <ButtonBlock>
        <Button
          buttonSize="medium"
          buttonStyle="link"
          colorPalette="mid"
          icon={ui.iconExternalLink}
          iconPlacement="right"
          label="Learn About Plans & Invoicing"
          onClick={openUrl(PRICING_LINK)}
        />
      </ButtonBlock>
    </OrgPlanSqueezeRoot>
  );
};

export default createFragmentContainer(
  OrgPlanSqueeze,
  graphql`
    fragment OrgPlanSqueeze_organization on Organization {
      orgId: id
      isBillingLeader
      billingLeaders {
        billingLeaderId: id
        email
        preferredName
      }
      orgUserCount {
        activeUserCount
      }
    }
  `
);
