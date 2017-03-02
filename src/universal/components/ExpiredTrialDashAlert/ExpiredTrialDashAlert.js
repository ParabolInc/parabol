import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {Link} from 'react-router';
import FontAwesome from 'react-fontawesome';
import {DashAlert} from 'universal/components/Dashboard';

const ExpiredTrialDashAlert = (props) => {
  const {accountLink, styles} = props;
  const iconStyle = {
    fontSize: ui.iconSize
  };
  return (
    <DashAlert colorPalette="light">
      <div className={css(styles.inlineBlock, styles.message)}>
        Your trial has expired!
      </div>
      <div className={css(styles.inlineBlock)}>
        <Link className={css(styles.link)} title="Add Billing Information" to={accountLink}>
          <span className={css(styles.underline)}>Add Billing Information</span> <FontAwesome name="arrow-right" style={iconStyle} />
        </Link>
      </div>
    </DashAlert>
  );
};

ExpiredTrialDashAlert.propTypes = {
  accountLink: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  inlineBlock: {
    color: appTheme.palette.warm,
    display: 'inline-block',
    margin: '0 1rem',
    verticalAlign: 'top'
  },

  link: {
    color: 'inherit',
    textDecoration: 'none',

    ':hover': {
      color: 'inherit',
      opacity: '.5'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.5'
    },
    paddingRight: '1rem'
  },

  underline: {
    textDecoration: 'underline'
  },

  message: {
    fontWeight: 700,
    paddingLeft: '1rem'
  }
});

export default withStyles(styleThunk)(ExpiredTrialDashAlert);
