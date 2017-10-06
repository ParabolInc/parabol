import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';

const OrgPlanSqueeze = (props) => {
  const {styles} = props;

  const stackedIcon = (top, bottom, color) => {
    const iconStyle = {
      fontSize: ui.iconSize,
      lineHeight: ui.iconSize
    };
    const topIconStyle = {
      ...iconStyle,
      color
    };
    return (
      <div className={css(styles.iconStacked)}>
        <FontAwesome className={css(styles.iconTop)} name={top} style={topIconStyle} />
        <FontAwesome className={css(styles.iconBottom)} name={bottom} style={iconStyle} />
      </div>
    );
  };

  const starIcon = () => stackedIcon('star-o', 'star', appTheme.palette.light60d);

  const noActiveUsers = 7;
  const subscriptionPrice = 5;
  const estimatedCost = noActiveUsers * subscriptionPrice;
  const showCost = true;

  return (
    <Panel hasHeader={false}>
      <div className={css(styles.panelInner)}>
        <div className={css(styles.panelCell, styles.panelPersonal)}>
          <h2 className={css(styles.badgePersonal)}>
            <div className={css(styles.badgeInner)}>
              {stackedIcon('check-circle-o', 'circle', appTheme.palette.mid70l)}
              <div className={css(styles.badgeLabel)}>{'Personal Plan'}</div>
            </div>
          </h2>
          <p className={css(styles.copy)}>
            {'Your current plan.'}<br />
            {'The basics, for free!'}
          </p>
        </div>
        <div className={css(styles.panelCell)}>
          <h2 className={css(styles.badgePro)}>
            <div className={css(styles.badgeInner)}>
              {starIcon()}
              {starIcon()}
              <div className={css(styles.badgeLabel)}>{'Pro Plan'}</div>
              {starIcon()}
              {starIcon()}
            </div>
          </h2>
          <p className={css(styles.copy, styles.copyPro)}>
            {'This could be you.'}<br />
            {'Ready for the full experience?'}
          </p>
          <div className={css(styles.buttonBlock)}>
            <Button
              colorPalette="cool"
              depth={2}
              isBlock
              label="Upgrade to the Pro Plan"
              onClick={() => (console.log(`
                Open the CC modal;
                if they bail, show Billing View !isPaid;
                otherwise, when CC success, show Billing View isPaid.
              `))}
              size="small"
            />
          </div>
          {showCost ?
            <div className={css(styles.costHint)}>
              {`${noActiveUsers} Active Users x $${subscriptionPrice} = $${estimatedCost}/mo`}
            </div> :
            <Button
              colorPalette="cool"
              buttonStyle="flat"
              icon="question-circle"
              iconPlacement="right"
              label="How much will it cost?"
              size="smallest"
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
          size="smallest"
        />
      </div>
    </Panel>
  );
};


OrgPlanSqueeze.propTypes = {
  styles: PropTypes.object
};

const panelBorder = `.0625rem solid ${ui.panelInnerBorderColor}`;
const padding = ui.panelGutter;

const badgeBase = {
  borderRadius: '100em',
  boxShadow: ui.shadow[0],
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s5,
  margin: '1rem auto 0',
  textShadow: '0 .0625rem 0 rgba(255, 255, 255, .35)',
  textTransform: 'uppercase',
  width: '11rem'
};

const iconBase = {
  left: 0,
  position: 'absolute',
  textAlign: 'center',
  top: 0,
  verticalAlign: 'middle'
};

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

  badgeInner: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: '.0625rem solid rgba(255, 255, 255, .85)',
    borderRadius: '100em',
    display: 'flex',
    justifyContent: 'center',
    padding: '.375rem'
  },

  badgeLabel: {
    padding: '.125rem .1875rem 0'
  },

  badgePersonal: {
    ...badgeBase,
    backgroundColor: appTheme.palette.mid30l,
    border: `.125rem solid ${appTheme.palette.mid50l}`,
    color: appTheme.palette.mid
  },

  badgePro: {
    ...badgeBase,
    backgroundColor: appTheme.palette.light80d,
    border: `.125rem solid ${appTheme.palette.light70d}`,
    color: appTheme.palette.light40d
  },

  iconStacked: {
    height: ui.iconSize,
    margin: '0 .0625rem',
    position: 'relative',
    width: ui.iconSize
  },

  iconTop: {
    ...iconBase,
    zIndex: 200
  },

  iconBottom: {
    ...iconBase,
    color: '#fff',
    textShadow: '0 .0625rem 0 rgba(255, 255, 255, .35)',
    zIndex: 100
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
