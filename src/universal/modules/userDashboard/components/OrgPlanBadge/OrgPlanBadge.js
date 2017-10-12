import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import StackedIcon from 'universal/modules/userDashboard/components/StackedIcon';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PERSONAL, PRO} from 'universal/utils/constants';

const StarIcon = () => <StackedIcon top="star-o" bottom="star" color={appTheme.palette.light60d} />;

const OrgPlanBadge = (props) => {
  const {planType, styles} = props;
  const badgeStyles = css(
    planType === PERSONAL ? styles.badgePersonal : styles.badgePro
  );

  return (
    <h2 className={badgeStyles}>
      {planType === PERSONAL ?
        <div className={css(styles.badgeInner)}>
          <StackedIcon top="check-circle-o" bottom="circle" color={appTheme.palette.mid70l} />
          <div className={css(styles.badgeLabel)}>{'Personal Plan'}</div>
        </div> :
        <div className={css(styles.badgeInner)}>
          <StarIcon />
          <StarIcon />
          <div className={css(styles.badgeLabel)}>{'Pro Plan'}</div>
          <StarIcon />
          <StarIcon />
        </div>
      }
    </h2>
  );
};


OrgPlanBadge.propTypes = {
  planType: PropTypes.oneOf([
    PERSONAL,
    PRO
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
  }
});

export default withStyles(styleThunk)(OrgPlanBadge);
