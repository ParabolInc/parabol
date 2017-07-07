import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import withStyles from 'universal/styles/withStyles';
import providerAddedSubscription from 'universal/subscriptions/providerAddedSubscription';
import {GITHUB, SLACK} from 'universal/utils/constants';

const ProviderList = (props) => {
  const {jwt, viewer, styles, teamMemberId} = props;
  const {providerMap: {github, slack}} = viewer;
  return (
    <div className={css(styles.list)}>
      <ProviderRow name={GITHUB} providerDetails={github} teamMemberId={teamMemberId}/>
      <ProviderRow name={SLACK} providerDetails={slack} jwt={jwt} teamMemberId={teamMemberId}/>
    </div>
  );
};

ProviderList.propTypes = {
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  list: {
    border: '3px solid gray',
    borderRadius: '4px'
  }
});

const subscriptionThunk = (props) => providerAddedSubscription(props.teamMemberId, props.viewer.id);

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