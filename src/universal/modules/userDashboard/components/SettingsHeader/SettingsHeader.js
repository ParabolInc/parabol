import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {withRouter} from 'react-router';
import {SETTINGS, ORGANIZATIONS, NOTIFICATIONS} from 'universal/utils/constants';
import appTheme from 'universal/styles/theme/appTheme';

const heading = {
  [SETTINGS]: {
    label: 'Settings'
  },
  [ORGANIZATIONS]: {
    label: 'Organizations'
  },
  [NOTIFICATIONS]: {
    label: 'Notifications'
  }
};

const SettingsHeader = (props) => {
  const {
    location,
    styles
  } = props;
  return (
    <div className={css(styles.root)}>
      <h1 className={css(styles.heading)}>{heading[location].label}</h1>
    </div>
  );
};

SettingsHeader.propTypes = {
  location: PropTypes.string,
  styles: PropTypes.object,
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    display: 'flex'
  },

  heading: {
    color: appTheme.palette.dark10d,
    fontSize: appTheme.typography.s5,
    fontWeight: 400,
    height: appTheme.typography.s6,
    lineHeight: appTheme.typography.s6,
    margin: 0,
    padding: 0
  }
});

export default withRouter(withStyles(styleThunk)(SettingsHeader));
