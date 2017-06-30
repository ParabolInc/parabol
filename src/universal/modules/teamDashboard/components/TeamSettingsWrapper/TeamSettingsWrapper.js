import PropTypes from 'prop-types';
import React from 'react';
import {matchPath, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import TeamSettingsTabs from 'universal/modules/teamDashboard/components/TeamSettingsTabs/TeamSettingsTabs';

const overview = () => System.import('universal/modules/teamDashboard/containers/TeamSettings/TeamSettingsContainer');

const TeamSettingsWrapper = (props) => {
  const {location: {pathname}, match} = props;
  const {params: {teamId}} = match;
  const areaMatch = matchPath(pathname, {path: `${match.url}/:area?`});
  return (
    <div>
      <TeamSettingsTabs activeKey={areaMatch.params.area || ''} teamId={teamId}/>
      <Switch>
        <AsyncRoute exact path={match.url} mod={overview} extraProps={{teamId}}/>
        {/*<AsyncRoute exact path={`${match.url}/insights`} mod={overview} extraProps={{teamId}}/>*/}
        {/*<AsyncRoute exact path={`${match.url}/roles`} mod={overview} extraProps={{teamId}}/>*/}
        <AsyncRoute path={`${match.url}/integrations`} mod={overview} extraProps={{teamId}}/>
      </Switch>
    </div>
  );
};

TeamSettingsWrapper.propTypes = {
  match: PropTypes.object.isRequired
};

export default TeamSettingsWrapper;
