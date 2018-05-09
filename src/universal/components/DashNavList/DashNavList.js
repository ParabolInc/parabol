import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import DashNavTeam from 'universal/components/Dashboard/DashNavTeam';
import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';

const DashNavListStyles = styled('div')({
  width: '100%'
});

const EmptyTeams = styled('div')({
  fontSize: appTheme.typography.sBase,
  fontStyle: 'italic',
  marginLeft: '2.1875rem'
});

const DashNavList = (props) => {
  const {location, viewer} = props;
  const {teams} = viewer || {};
  // const isLoading = !teams;
  const hasTeams = teams && teams.length > 0;
  return (
    <DashNavListStyles>
      {hasTeams ?
        teams.map((team) => <DashNavTeam key={team.id} location={location} team={team} />) :
        <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
      }
    </DashNavListStyles>
  );
};

DashNavList.propTypes = {
  // required to update highlighting
  location: PropTypes.object.isRequired,
  viewer: PropTypes.object
};

export default createFragmentContainer(
  DashNavList,
  graphql`
    fragment DashNavList_viewer on User {
      teams {
        id
        ...DashNavTeam_team
      }
    }
  `
);
