import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {Link} from 'react-router';
import FontAwesome from 'react-fontawesome';
import {DashAlert} from 'universal/components/Dashboard';
import {segmentEventTrack} from 'universal/redux/segmentActions';

const ActiveTrialDashAlert = (props) => {
  const {accountLink, dispatch, styles} = props;
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
            dispatch(
              segmentEventTrack('DashAlert Click ActiveTrialDashAlert')
            );
          }}
        >
          <span className={css(styles.underline)}>Go to My Account</span> <FontAwesome name="arrow-right" style={iconStyle} />
        </Link>
      </div>
    </DashAlert>
  );
};

ActiveTrialDashAlert.propTypes = {
  accountLink: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
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

export default withStyles(styleThunk)(ActiveTrialDashAlert);
