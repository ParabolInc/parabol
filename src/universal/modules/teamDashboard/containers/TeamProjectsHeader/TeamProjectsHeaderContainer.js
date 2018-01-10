import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';

const mapStateToProps = (state) => {
  return {
    teamMemberFilterId: state.teamDashboard.teamMemberFilterId,
    teamMemberFilterName: state.teamDashboard.teamMemberFilterName
  };
};

class TeamProjectsHeaderContainer extends Component {
  componentWillReceiveProps(nextProps) {
    const {dispatch, team: {teamId: oldTeamId}} = this.props;
    const {team: {teamId}} = nextProps;
    if (oldTeamId !== teamId) {
      dispatch(filterTeamMember(null));
    }
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch(filterTeamMember(null));
  }

  render() {
    const {dispatch, teamMemberFilterId, teamMemberFilterName, team} = this.props;
    return (
      <TeamProjectsHeader
        dispatch={dispatch}
        team={team}
        teamMemberFilterId={teamMemberFilterId}
        teamMemberFilterName={teamMemberFilterName}
      />
    );
  }
}

TeamProjectsHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string,
  team: PropTypes.object.isRequired
};

export default createFragmentContainer(
  connect(mapStateToProps)(TeamProjectsHeaderContainer),
  graphql`
    fragment TeamProjectsHeaderContainer_team on Team {
      teamId: id
      ...TeamProjectsHeader_team
    }
  `
);
