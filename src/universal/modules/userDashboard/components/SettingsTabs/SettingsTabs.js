import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Tabs from 'universal/components/Tabs/Tabs';
import Tab from 'universal/components/Tab/Tab';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';
import {SETTINGS, settingsOrder} from 'universal/utils/constants';
import appTheme from 'universal/styles/theme/appTheme';

const iconStyle = {opacity: '.5'};

const SettingsTabs = (props) => {
  const {notificationCount, router, styles} = props;
  let currentPath = SETTINGS;
  const makeOnClick = (path) => {
    const fullPath = `/me/${path}`;
    if (router.isActive(fullPath)) {
      currentPath = path;
      if (router.isActive(fullPath, true)) {
        return undefined;
      }
    }
    return () => {
      router.push(fullPath);
    };
  };
  const clickHandlers = settingsOrder.map((path) => makeOnClick(path));
  const notificationIconAndBadge = () => {
    return (
      <div className={css(styles.badgeAndBell)}>
        <FontAwesome name="bell" style={iconStyle}/>
        {notificationCount > 0 ? <div className={css(styles.badge)}>{notificationCount}</div> : null}
      </div>

    );
  };

  return (
    <Tabs activeIdx={settingsOrder.indexOf(currentPath)}>
      <Tab
        icon={<FontAwesome name="address-card" style={iconStyle}/>}
        label="Settings"
        onClick={clickHandlers[0]}
      />
      <Tab
        icon={<FontAwesome name="users" style={iconStyle}/>}
        label="Organizations"
        onClick={clickHandlers[1]}
      />
      <Tab
        icon={notificationIconAndBadge()}
        label="Notifications"
        onClick={clickHandlers[2]}
      />
    </Tabs>
  );
};

SettingsTabs.propTypes = {
  notificationCount: PropTypes.number,
  router: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  badge: {
    background: appTheme.palette.warm,
    borderRadius: '100%',
    bottom: 0,
    color: 'white',
    fontSize: '14px',
    fontWeight: 700,
    height: '16px',
    cursor: 'default',
    position: 'absolute',
    right: '-4px',
    textAlign: 'center',
    width: '16px',
  },
  badgeAndBell: {
    position: 'relative'
  }
});
export default withRouter(withStyles(styleThunk)(SettingsTabs));
