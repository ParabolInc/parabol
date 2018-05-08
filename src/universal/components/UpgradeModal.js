// @flow
import React from 'react';
import {Button} from 'universal/components';
import InlineAlert from 'universal/components/InlineAlert';
import InlineEstimatedCost from 'universal/components/InlineEstimatedCost';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import {PRO_LABEL} from 'universal/utils/constants';
import {PRICING_LINK} from 'universal/utils/externalLinks';

type Props = {
  closePortal: Boolean,
  isBillingLeader: Boolean
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

const CenteredModalBoundary = styled(ModalBoundary)({
  flexDirection: 'column'
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

const StyleInlineAlert = styled(InlineAlert)({
  margin: '1rem 0 1.25rem',
  width: '100%'
});

const Emoji = styled('div')({
  fontSize: '4rem',
  lineHeight: 1
});

const StyledIcon = styled(StyledFontAwesome)({
  color: ui.linkColor,
  fontSize: ui.iconSize,
  marginRight: '.5rem',
  opacity: 0.5,
  width: '1.125rem'
});

const BulletIcon = styled(StyledIcon)({
  color: ui.palette.green,
  opacity: 1
});

const ModalCopy = styled('p')({...modalCopyBase});

const ModalLink = styled('a')({
  ...modalCopyBase,
  color: ui.palette.mid,
  ':hover,:focus': {
    textDecoration: 'underline'
  }
});

const ModalButtonBlock = styled('div')({
  margin: '2rem 0 0',
  width: '22.5rem'
});

const BillingLeaders = styled('div')({
  lineHeight: 1.5,
  textAlign: 'center',
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 400,
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

const makeBulletedContent = (copy, idx) => (
  <ModalCopy key={`modalBulletCopy-${idx + 1}`}>
    <BulletIcon name="check-circle" />
    {copy}
  </ModalCopy>
);

const bullets = [
  'Run Unlimited Retrospective Meetings',
  'Customize Social Check-In Rounds',
  'Access an Unlimited Archive'
];

const billingLeaders = [
  {billingLeaderId: '001', email: 'jordan@parabol.co'},
  {billingLeaderId: '002', email: 'marimar@parabol.co'},
  {billingLeaderId: '003', email: 'taya@parabol.co'}
];

const makeModalSqueezeContent = ({isBillingLeader}) => {
  const pricingLinkCopy = 'Learn About Plans & Invoicing';
  // TODO scrub the org name
  const organizationName = 'Parabol, Inc.';
  const showFreeRetroContext = true; // we may use this modal elsewhere
  return (
    <ModalBoundary>
      <ModalContentPanel>
        <ModalHeading>{`Upgrade to ${PRO_LABEL}`}</ModalHeading>
        {showFreeRetroContext &&
          <StyleInlineAlert>
            {'0 of 3 Free Retrospective Meetings'}<br />
            {'Remaining for '}<b>{organizationName}</b>
          </StyleInlineAlert>
        }
        <ModalContent>
          {bullets.map((bullet, idx) => makeBulletedContent(bullet, idx))}
          <ModalContentSpacer />
          <InlineEstimatedCost activeUserCount={5} />
          <ModalLink href={PRICING_LINK} rel="noopener noreferrer" target="_blank" title={pricingLinkCopy}>
            <StyledIcon name={ui.iconExternalLink} />
            {pricingLinkCopy}
          </ModalLink>
        </ModalContent>
      </ModalContentPanel>
      <ModalActionPanel>
        {isBillingLeader ?
          <ModalCopy>{'Add Credit Card'}</ModalCopy> :
          <BillingLeaders>
            <h3>{'Contact a Billing Leader:'}</h3>
            {billingLeaders.map(({billingLeaderId, email}) => (
              <a href={`mailto:${email}`} key={billingLeaderId} title={`Email ${email}`}>{email}</a>
            ))}
          </BillingLeaders>
        }
      </ModalActionPanel>
    </ModalBoundary>
  );
};

const makeModalConfirmationContent = ({closePortal}) => (
  <CenteredModalBoundary>
    <Emoji>{'🤗'}</Emoji>
    <ModalHeading>{'We’re glad you’re here!'}</ModalHeading>
    <ModalCopy>{'Your organization is now on the '}<b>{PRO_LABEL}</b>{' tier.'}</ModalCopy>
    <ModalButtonBlock>
      <Button
        buttonSize="large"
        colorPalette="gray"
        depth={1}
        isBlock
        label="Let’s Get Back to Business"
        onClick={closePortal}
      />
    </ModalButtonBlock>
  </CenteredModalBoundary>
);

const UpgradeModal = (props: Props) => {
  const justGotPaidToday = false; // got me a pocket full of change
  const modalSqueezeContent = makeModalSqueezeContent(props);
  const modalConfirmationContent = makeModalConfirmationContent(props);
  const modalContent = justGotPaidToday ? modalConfirmationContent : modalSqueezeContent;
  return modalContent;
};

export default UpgradeModal;
