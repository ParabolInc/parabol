import React from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import Tabs from 'universal/components/Tabs/Tabs';
import Tab from 'universal/components/Tab/Tab';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router';
import {SETTINGS, ORGANIZATIONS, NOTIFICATIONS, settingsOrder} from 'universal/utils/constants';

const SettingsTabs = (props) => {
  const {activeTab, router} = props;
  const makeOnClick = (path) => () => {
    if (settingsOrder.indexOf(path) !== activeTab) {
      router.push(`/me/${path}`);
    }
  };
  return (
    <Tabs activeIdx={settingsOrder.indexOf(activeTab)}>
      <Tab
        icon={<FontAwesome name="address-card"/>}
        label="Settings"
        onClick={makeOnClick(SETTINGS)}
      />
      <Tab
        icon={<FontAwesome name="users"/>}
        label="Organizations"
        onClick={makeOnClick(ORGANIZATIONS)}
      />
      <Tab
        icon={<FontAwesome name="bell"/>}
        label="Notifications"
        onClick={makeOnClick(NOTIFICATIONS)}
      />
    </Tabs>
  )
};

export default withRouter(SettingsTabs);

