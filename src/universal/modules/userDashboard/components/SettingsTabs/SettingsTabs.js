import React, {Children, cloneElement, Component, PropTypes} from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import Tabs from 'universal/components/Tabs/Tabs';
import Tab from 'universal/components/Tab/Tab';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';

const order = ['settings', 'organizations', 'notifications'];

const SettingsTabs = (props) => {
  const {activeIdx, router} = props;
  const makeOnClick = (path) => () => {
    if (order.indexOf(path) !== activeIdx) {
      router.push(`/me/${path}`);
    }
  };
  return (
    <Tabs activeIdx={activeIdx}>
      <Tab
        icon={<FontAwesome name="address-card"/>}
        label="Settings"
        onClick={makeOnClick('settings')}
      />
      <Tab
        icon={<FontAwesome name="users"/>}
        label="Organizations"
        onClick={makeOnClick('organizations')}
      />
      <Tab
        icon={<FontAwesome name="bell"/>}
        label="Notifications"
        onClick={makeOnClick('notifications')}
      />
    </Tabs>
  )
};

export default withRouter(SettingsTabs);

