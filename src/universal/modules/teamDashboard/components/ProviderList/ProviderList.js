import React from 'react';
import PropTypes from 'prop-types';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import {createFragmentContainer} from 'react-relay';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import {SLACK, GITHUB} from 'universal/utils/constants';
import Panel from 'universal/components/Panel/Panel';

const providerRow = {
  github: {
    accessToken: 'foo',
    userCount: 2,
    integrationCount: 3,
    providerUserName: 'ackernaut'
  }
};

const ProviderList = (props) => {
  const {jwt, providerMap, styles, teamMemberId} = props;
  console.log('map', providerMap)
  return (
    <div className={css(styles.providerList)}>
      <Panel hasHeader={false}>
        <ProviderRow name={GITHUB} providerDetails={providerMap.github} teamMemberId={teamMemberId} />
        <ProviderRow name={SLACK} providerDetails={providerMap.slack} jwt={jwt} teamMemberId={teamMemberId} />
      </Panel>
    </div>
  );
};

ProviderList.propTypes = {
  providerMap: PropTypes.object.isRequired,
  styles: PropTypes.object
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
    fragment ProviderList_providerMap on ProviderMap {
      github {
        ...ProviderRow_providerDetails
      }
      slack {
        ...ProviderRow_providerDetails
      }
    }
  `
);
