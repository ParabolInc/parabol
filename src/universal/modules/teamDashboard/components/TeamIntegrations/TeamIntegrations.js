import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';

const TeamIntegrations = (props) => {
  const {jwt, viewer, styles, teamMemberId} = props;

  return (
    <div className={css(styles.listAndAnnoucements)}>
      <ProviderList viewer={viewer} jwt={jwt} teamMemberId={teamMemberId}/>
    </div>
  );
};

TeamIntegrations.propTypes = {
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamMemberId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  listAndAnnoucements: {
    display: 'flex'
  }
});

export default withStyles(styleThunk)(TeamIntegrations);
