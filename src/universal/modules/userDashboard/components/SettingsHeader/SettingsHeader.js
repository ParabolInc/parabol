import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {withRouter} from 'react-router';
import {SETTINGS, ORGANIZATIONS, NOTIFICATIONS} from 'universal/utils/constants';
import ui from 'universal/styles/ui';

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
  const [area] = location.pathname.slice(4).split('/');
  return (
    <div className={css(styles.root)}>
      <h1 className={css(styles.heading)}>{heading[area].label}</h1>
    </div>
  );
};

SettingsHeader.propTypes = {
  location: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    display: 'flex'
  },

  heading: {
    ...ui.dashHeaderTitleStyles,
    margin: 0,
    padding: 0
  }
});

export default withRouter(withStyles(styleThunk)(SettingsHeader));
