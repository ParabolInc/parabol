import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const OrgPlanBadge = (props) => {
  const {planType, styles} = props;

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

  const badgeStyles = css(
    planType === 'personal' ? styles.badgePersonal : styles.badgePro
  );

  return (
    <h2 className={badgeStyles}>
      {planType === 'personal' ?
        <div className={css(styles.badgeInner)}>
          {stackedIcon('check-circle-o', 'circle', appTheme.palette.mid70l)}
          <div className={css(styles.badgeLabel)}>{'Personal Plan'}</div>
        </div> :
        <div className={css(styles.badgeInner)}>
          {starIcon()}
          {starIcon()}
          <div className={css(styles.badgeLabel)}>{'Pro Plan'}</div>
          {starIcon()}
          {starIcon()}
        </div>
      }
    </h2>
  );
};


OrgPlanBadge.propTypes = {
  planType: PropTypes.oneOf([
    'personal',
    'pro'
  ]),
  styles: PropTypes.object
};

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
  }
});

export default withStyles(styleThunk)(OrgPlanBadge);
