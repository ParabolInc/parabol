import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import TeamTasksHeader from 'universal/modules/teamDashboard/components/TeamTasksHeader/TeamTasksHeader';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';

const mapStateToProps = (state) => {
  return {
    teamMemberFilterId: state.teamDashboard.teamMemberFilterId,
    teamMemberFilterName: state.teamDashboard.teamMemberFilterName
  };
};

class TeamTasksHeaderContainer extends Component {
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
      <TeamTasksHeader
        dispatch={dispatch}
        team={team}
        teamMemberFilterId={teamMemberFilterId}
        teamMemberFilterName={teamMemberFilterName}
      />
    );
  }
}

TeamTasksHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string,
  team: PropTypes.object.isRequired
};

export default createFragmentContainer(
  connect(mapStateToProps)(TeamTasksHeaderContainer),
  graphql`
    fragment TeamTasksHeaderContainer_team on Team {
      teamId: id
      ...TeamTasksHeader_team
    }
  `
);
