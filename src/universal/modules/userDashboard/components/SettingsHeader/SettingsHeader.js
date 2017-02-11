import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';
import {SETTINGS, ORGANIZATIONS, NOTIFICATIONS} from 'universal/utils/constants';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const iconStyle = {
  color: appTheme.palette.dark,
  display: 'none',
  fontSize: ui.iconSize,
  lineHeight: 'inherit',
  marginRight: '.5rem'
};

const heading = {
  [SETTINGS]: {
    label: 'Settings',
    icon: 'address-card'
  },
  [ORGANIZATIONS]: {
    label: 'Organizations',
    icon: 'building'
  },
  [NOTIFICATIONS]: {
    label: 'Notifications',
    icon: 'bell'
  }
};

const SettingsHeader = (props) => {
  const {
    location,
    styles
  } = props;
  return (
    <div className={css(styles.root)}>
      <FontAwesome name={heading[location].icon} style={iconStyle} />
      <h1 className={css(styles.heading)}>{heading[location].label}</h1>
    </div>
  );
};

// <IconAvatar icon={heading[location].icon}/>

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
