import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import DashNavTeam from 'universal/components/Dashboard/DashNavTeam';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';

const DashNavList = (props) => {
  const {location, styles, viewer} = props;
  const {teams} = viewer || {};
  // const isLoading = !teams;
  const hasTeams = teams && teams.length > 0;
  return (
    <div className={css(styles.root)}>
      {hasTeams ?
        <div>
          {teams.map((team) => <DashNavTeam key={team.id} location={location} team={team} />)}
        </div> :
        <div className={css(styles.emptyTeams)}>It appears you are not a member of any team!</div>
      }
    </div>
  );
};

DashNavList.propTypes = {
  // required to update highlighting
  location: PropTypes.object.isRequired,
  styles: PropTypes.object,
  viewer: PropTypes.object
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  emptyTeams: {
    fontSize: appTheme.typography.sBase,
    fontStyle: 'italic',
    padding: '0 0 .125rem 1rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(DashNavList),
  graphql`
    fragment DashNavList_viewer on User {
      teams {
        id
        ...DashNavTeam_team
      }
    }
  `
);
