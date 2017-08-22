import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import {DashAlert} from 'universal/components/Dashboard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const ExpiredTrialDashAlert = (props) => {
  const {atmosphere, orgId, styles} = props;
  const iconStyle = {
    fontSize: ui.iconSize
  };
  const accountLink = `/me/organizations/${orgId}`;
  return (
    <DashAlert colorPalette="light">
      <div className={css(styles.inlineBlock, styles.message)}>
        Your trial has expired!
      </div>
      <div className={css(styles.inlineBlock)}>
        <Link
          className={css(styles.link)}
          title="Add Billing Information"
          to={accountLink}
          onClick={() => {
            SendClientSegmentEventMutation(atmosphere, 'DashAlert Click ExpiredTrialDashAlert', {orgId});
          }}
        >
          <span className={css(styles.underline)}>
            Add Billing Information
          </span>
          <FontAwesome name="arrow-right" style={iconStyle}/>
        </Link>
      </div>
    </DashAlert>
  );
};

ExpiredTrialDashAlert.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  orgId: PropTypes.string,
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

export default withAtmosphere(withStyles(styleThunk)(ExpiredTrialDashAlert));
