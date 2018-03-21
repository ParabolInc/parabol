import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {SettingsWrapper} from 'universal/components/Settings';
import Panel from 'universal/components/Panel/Panel';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import {GITHUB, SLACK} from 'universal/utils/constants';


const ProviderList = (props) => {
  const {jwt, viewer, teamId} = props;
  const {providerMap} = viewer;
  return (
    <SettingsWrapper>
      <Panel hideFirstRowBorder>
        <ProviderRow name={GITHUB} providerDetails={providerMap[GITHUB]} jwt={jwt} teamId={teamId} />
        <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} jwt={jwt} teamId={teamId} />
      </Panel>
    </SettingsWrapper>
  );
};

ProviderList.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  teamId: PropTypes.string
};

export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_viewer on User {
      providerMap(teamId: $teamId) {
        GitHubIntegration {
          ...ProviderRow_providerDetails
        }
        SlackIntegration {
          ...ProviderRow_providerDetails
        }
      }

    }
  `
);
