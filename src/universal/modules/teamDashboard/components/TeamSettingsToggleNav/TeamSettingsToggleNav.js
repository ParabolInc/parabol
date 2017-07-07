import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import ui from 'universal/styles/ui';
import ToggleNav from 'universal/components/ToggleNav/ToggleNav';

const TeamSettingsToggleNav = (props) => {
  const {activeKey, history, teamId} = props;
  const makeOnClick = (area = '') => {
    return area === activeKey ? undefined : () => {
      history.push(`/team/${teamId}/settings/${area}`);
    };
  };

  const items = [
    {
      label: 'Team',
      icon: 'users',
      isActive: activeKey === '',
      onClick: makeOnClick()
    },
    {
      label: 'Integrations',
      icon: 'puzzle-piece',
      isActive: activeKey === 'integrations',
      onClick: makeOnClick('integrations')
    }
  ];

  const wrapperStyle = {
    margin: `${ui.panelMarginVertical} 0 0`,
    maxWidth: ui.settingsPanelMaxWidth
  };

  return (
    <div style={wrapperStyle}>
      <ToggleNav items={items} />
    </div>
  );
};

TeamSettingsToggleNav.propTypes = {
  activeKey: PropTypes.string,
  history: PropTypes.object,
  teamId: PropTypes.string
};

export default withRouter(TeamSettingsToggleNav);
