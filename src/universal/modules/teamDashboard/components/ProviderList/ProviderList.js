import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import withStyles from 'universal/styles/withStyles';
import ProviderSubscription from 'universal/subscriptions/Provider';
import {GITHUB, SLACK} from 'universal/utils/constants';
import ui from 'universal/styles/ui';
import Panel from 'universal/components/Panel/Panel';

const ProviderList = (props) => {
  const {jwt, viewer, styles, teamMemberId} = props;
  const {providerMap: {github, slack}} = viewer;
  return (
    <div className={css(styles.providerList)}>
      <Panel hasHeader={false}>
        <ProviderRow name={GITHUB} providerDetails={github} teamMemberId={teamMemberId} comingSoon />
        <ProviderRow name={SLACK} providerDetails={slack} jwt={jwt} teamMemberId={teamMemberId} />
      </Panel>
    </div>
  );
};

ProviderList.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamMemberId: PropTypes.string
};

const styleThunk = () => ({
  providerList: {
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  }
});

const subscriptionThunk = (props) => ProviderSubscription(props.teamMemberId, props.viewer.id);

export default createFragmentContainer(
  withSubscriptions(subscriptionThunk)(withStyles(styleThunk)(ProviderList)),
  graphql`
    fragment ProviderList_viewer on User {
      id
      providerMap(teamMemberId: $teamMemberId) {
        github {
          ...ProviderRow_providerDetails
        }
        slack {
          ...ProviderRow_providerDetails
        }
      }

    }
  `
);
