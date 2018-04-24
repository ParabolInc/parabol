import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import {MONTHLY_PRICE, PERSONAL, PRO, PERSONAL_LABEL, PRO_LABEL} from 'universal/utils/constants';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import {PRICING_LINK} from 'universal/utils/externalLinks';
import plural from 'universal/utils/plural';

import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

import makeGradient from 'universal/styles/helpers/makeGradient';

const personalGradient = makeGradient(ui.palette.mid, ui.palette.midGray);
const professionalGradient = makeGradient(ui.palette.yellow, ui.palette.warm);

const OrgPlanSqueezeRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
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
  fontSize: appTheme.typography.sBase,
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

const CostHint = styled('div')({
  backgroundColor: ui.palette.light,
  borderRadius: ui.borderRadiusSmall,
  color: ui.palette.dark,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: '2.5rem',
  margin: '0 1rem',
  padding: '0 1rem',
  textAlign: 'center'
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
    top: '.4375rem',
    width: '.625rem'
  }
});

class OrgPlanSqueeze extends Component {
  state = {showCost: false}

  getCost = () => {
    this.setState({
      showCost: !this.state.showCost
    });
  };

  render() {
    const {activeUserCount, orgId} = this.props;
    const estimatedCost = activeUserCount * MONTHLY_PRICE;
    const {showCost} = this.state;
    const toggle = (<Button
      buttonSize="medium"
      buttonStyle="primary"
      depth={2}
      isBlock
      label="Upgrade to the Pro Plan"
    />);
    const openUrl = (url) => () => window.open(url, '_blank');
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
            <TierPanelHeader tier={PRO}>{PRO_LABEL}</TierPanelHeader>
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
              {showCost ?
                <CostHint>
                  {`${activeUserCount} Active ${plural(activeUserCount, 'User')} x $${MONTHLY_PRICE} = $${estimatedCost}/mo`}
                </CostHint> :
                <Button
                  buttonSize="medium"
                  buttonStyle="flat"
                  colorPalette="warm"
                  icon="question-circle"
                  iconPlacement="right"
                  label="How much will it cost?"
                  onClick={this.getCost}
                />
              }
            </TierPanelBody>
          </TierPanel>

        </TierPanelLayout>
        <ButtonBlock>
          <Button
            buttonSize="medium"
            buttonStyle="link"
            colorPalette="mid"
            icon="external-link-square"
            iconPlacement="right"
            label="Learn About Plans & Invoicing"
            onClick={openUrl(PRICING_LINK)}
          />
        </ButtonBlock>
      </OrgPlanSqueezeRoot>
    );
  }
}

OrgPlanSqueeze.propTypes = {
  activeUserCount: PropTypes.number,
  orgId: PropTypes.string
};

export default OrgPlanSqueeze;
