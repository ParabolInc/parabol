import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';

const TeamIntegrations = (props) => {
  const {jwt, providerMap, styles, teamMemberId} = props;

  return (
    <div className={css(styles.listAndAnnoucements)}>
      <ProviderList providerMap={providerMap} jwt={jwt} teamMemberId={teamMemberId}/>
      <div>
        Notifications
      </div>
    </div>
  );
};

TeamIntegrations.propTypes = {
  providerMap: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamMemberId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  listAndAnnoucements: {
    display: 'flex'
  }
});

export default withStyles(styleThunk)(TeamIntegrations);
