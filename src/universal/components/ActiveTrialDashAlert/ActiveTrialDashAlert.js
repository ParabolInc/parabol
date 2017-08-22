import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import {DashAlert} from 'universal/components/Dashboard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';

const ActiveTrialDashAlert = (props) => {
  const {atmosphere, orgId, styles} = props;
  const accountLink = `/me/organizations/${orgId}`;
  const iconStyle = {
    fontSize: ui.iconSize
  };
  return (
    <DashAlert colorPalette="cool">
      <div className={css(styles.inlineBlock, styles.message)}>
        Add 30 days to your trial!
      </div>
      <div className={css(styles.inlineBlock)}>
        <Link
          className={css(styles.link)}
          title="Go to My Account"
          to={accountLink}
          onClick={() => {
            SendClientSegmentEventMutation(atmosphere, 'DashAlert Click ActiveTrialDashAlert', {orgId});
          }}
        >
          <span className={css(styles.underline)}>
            Go to My Account
          </span>
          <FontAwesome name="arrow-right" style={iconStyle}/>
        </Link>
      </div>
    </DashAlert>
  );
};

ActiveTrialDashAlert.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  inlineBlock: {
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

export default withAtmosphere(withStyles(styleThunk)(ActiveTrialDashAlert));
