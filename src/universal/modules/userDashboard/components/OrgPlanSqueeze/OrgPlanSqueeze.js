import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';

const stackedIcon = (top, bottom) => {
  // WIP
  const iconStyle = {
    fontSize: ui.iconSize,
    lineHeight: ui.iconSize
  };
  return (
    <div className={css(styles.iconStacked)}>
      <FontAwesome className={css(styles.iconTop)} name={top} style={iconStyle} />
      <FontAwesome className={css(styles.iconBottom)} name={bottom} style={iconStyle} />
    </div>
  );
};

const OrgPlanSqueeze = (props) => {
  const {styles} = props;
  return (
    <Panel hasHeader={false}>
      <div className={css(styles.panelInner)}>
        <div className={css(styles.panelCell, styles.panelPersonal)}>
          <h2 className={css(styles.badgePersonal)}>
            <div className={css(styles.badgeInner)}>{'Personal Badge'}</div>
          </h2>
          <p className={css(styles.copy)}>
            {'Your current plan.'}<br />
            {'The basics, for free!'}
          </p>
        </div>
        <div className={css(styles.panelCell)}>
          <h2 className={css(styles.badgePro)}>
            <div className={css(styles.badgeInner)}>{'Pro Badge'}</div>
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
              size="small"
            />
          </div>
          <Button
            colorPalette="cool"
            buttonStyle="flat"
            icon="question-circle"
            iconPlacement="right"
            label="How much will it cost?"
            size="smallest"
          />
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
  lineHeight: 1,
  margin: '1rem auto 0',
  textTransform: 'uppercase',
  width: '12rem'
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
    backgroundColor: 'transparent',
    border: `.0625rem solid rgba(255, 255, 255, .85)`,
    borderRadius: '100em',
    padding: '.5rem',
  },

  badgePersonal: {
    ...badgeBase,
    backgroundColor: appTheme.palette.mid30l,
    border: `.125rem solid ${appTheme.palette.mid50l}`,
    color: appTheme.palette.dark,
  },

  badgePro: {
    ...badgeBase,
    backgroundColor: appTheme.palette.light80d,
    border: `.125rem solid ${appTheme.palette.light70d}`,
    color: appTheme.palette.light40d,
  }
});

export default withStyles(styleThunk)(OrgPlanSqueeze);
