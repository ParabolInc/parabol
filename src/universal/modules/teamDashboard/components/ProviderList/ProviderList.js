import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Panel from 'universal/components/Panel/Panel';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {GITHUB, SLACK} from 'universal/utils/constants';


const ProviderList = (props) => {
  const {jwt, viewer, styles, teamId} = props;
  const {providerMap} = viewer;
  return (
    <div className={css(styles.providerList)}>
      <Panel hasHeader={false}>
        <ProviderRow firstInList name={GITHUB} providerDetails={providerMap[GITHUB]} jwt={jwt} teamId={teamId} />
        <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} jwt={jwt} teamId={teamId} />
      </Panel>
    </div>
  );
};

ProviderList.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  providerList: {
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(ProviderList),
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
