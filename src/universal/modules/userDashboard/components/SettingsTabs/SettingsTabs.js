import React from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import Tabs from 'universal/components/Tabs/Tabs';
import Tab from 'universal/components/Tab/Tab';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';
import {SETTINGS, settingsOrder} from 'universal/utils/constants';

const SettingsTabs = (props) => {
  const {router} = props;
  let currentPath = SETTINGS;
  let isRootPath;
  const makeOnClick = (path) => {
    const fullPath = `/me/${path}`;
    if (router.isActive(fullPath)) {
      currentPath = path;
      if (router.isActive(fullPath, true)) {
        isRootPath = true;
        return undefined;
      }
    }
    return () => {
      router.push(fullPath);
    }
  };
  const clickHandlers = settingsOrder.map((path) => makeOnClick(path));
  return (
    <Tabs activeIdx={settingsOrder.indexOf(currentPath)}>
      <Tab
        icon={<FontAwesome name="address-card"/>}
        label="Settings"
        onClick={clickHandlers[0]}
      />
      <Tab
        icon={<FontAwesome name="users"/>}
        label="Organizations"
        onClick={clickHandlers[1]}
      />
      <Tab
        icon={<FontAwesome name="bell"/>}
        label="Notifications"
        onClick={clickHandlers[2]}
      />
    </Tabs>
  )
};

export default withRouter(SettingsTabs);

