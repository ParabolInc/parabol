import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import OrgPlanBadge from 'universal/modules/userDashboard/components/OrgPlanBadge/OrgPlanBadge';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {MONTHLY_PRICE, PERSONAL, PRO} from 'universal/utils/constants';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import {PRICING_LINK} from 'universal/utils/externalLinks';

class OrgPlanSqueeze extends Component {
  state = {showCost: false}

  getCost = () => {
    this.setState({
      showCost: !this.state.showCost
    });
  };

  render() {
    const {activeUserCount, orgId, styles} = this.props;
    const estimatedCost = activeUserCount * MONTHLY_PRICE;
    const {showCost} = this.state;
    const toggle = (<Button
      colorPalette="cool"
      depth={2}
      isBlock
      label="Upgrade to the Pro Plan"
      size="small"
    />);
    const openUrl = (url) => () => window.open(url, '_blank');
    return (
      <Panel hasHeader={false}>
        <div className={css(styles.panelInner)}>
          <div className={css(styles.panelCell, styles.panelPersonal)}>
            <OrgPlanBadge planType={PERSONAL} />
            <p className={css(styles.copy)}>
              {'Your current plan.'}<br />
              {'The basics, for free!'}
            </p>
          </div>
          <div className={css(styles.panelCell)}>
            <OrgPlanBadge planType={PRO} />
            <p className={css(styles.copy, styles.copyPro)}>
              {'This could be you.'}<br />
              {'Ready for the full experience?'}
            </p>
            <div className={css(styles.buttonBlock)}>
              <CreditCardModalContainer
                orgId={orgId}
                toggle={toggle}
              />

            </div>
            {showCost ?
              <div className={css(styles.costHint)}>
                {`${activeUserCount} Active Users x $${MONTHLY_PRICE} = $${estimatedCost}/mo`}
              </div> :
              <Button
                colorPalette="cool"
                buttonStyle="flat"
                icon="question-circle"
                iconPlacement="right"
                label="How much will it cost?"
                size="smallest"
                onClick={this.getCost}
              />
            }
          </div>
        </div>
        <div className={css(styles.panelCell, styles.panelFooter)}>
          <Button
            colorPalette="mid"
            buttonStyle="flat"
            icon="external-link-square"
            iconPlacement="right"
            label="Learn About Plans & Invoicing"
            onClick={openUrl(PRICING_LINK)}
            size="smallest"
          />
        </div>
      </Panel>
    );
  }
}


OrgPlanSqueeze.propTypes = {
  activeUserCount: PropTypes.number,
  orgId: PropTypes.string,
  styles: PropTypes.object
};

const panelBorder = `.0625rem solid ${ui.panelInnerBorderColor}`;
const padding = ui.panelGutter;

const styleThunk = () => ({
  panelInner: {
    display: 'flex',
    width: '100%'
  },

  panelCell: {
    flex: 1,
    padding,
    textAlign: 'center'
  },

  panelPersonal: {
    borderRight: panelBorder
  },

  panelFooter: {
    borderTop: panelBorder
  },

  copy: {
    color: ui.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    margin: '1rem 0 .5rem'
  },

  copyPro: {
    color: appTheme.palette.light40d
  },

  buttonBlock: {
    padding: '1rem'
  },

  costHint: {
    backgroundColor: appTheme.palette.cool10l,
    borderRadius: ui.borderRadiusSmall,
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '2rem',
    margin: '0 1rem',
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(OrgPlanSqueeze);
