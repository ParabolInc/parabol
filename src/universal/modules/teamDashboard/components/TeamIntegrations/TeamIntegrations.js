import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';

const TeamIntegrations = (props) => {
  const {jwt, viewer, styles, teamId} = props;

  return (
    <div className={css(styles.listAndAnnoucements)}>
      <ProviderList viewer={viewer} jwt={jwt} teamId={teamId} />
    </div>
  );
};

TeamIntegrations.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  listAndAnnoucements: {
    display: 'flex'
  }
});

export default withStyles(styleThunk)(TeamIntegrations);
