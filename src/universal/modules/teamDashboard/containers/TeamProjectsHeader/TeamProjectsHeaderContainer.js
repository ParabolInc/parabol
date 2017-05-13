import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';
import {cashay} from 'cashay';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';

const teamProjectsHeaderQuery = `
query {
  teamMembers @cached(type: "[TeamMember]") {
    id
    preferredName
  }
}
`;

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const {teamMembers} = cashay.query(teamProjectsHeaderQuery, {
    op: 'teamProjectsHeaderContainer',
    key: teamId,
    resolveCached: {
      teamMembers: () => (doc) => doc.id.endsWith(teamId)
    },
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    }
  }).data;
  return {
    teamMemberFilterId: state.teamDashboard.teamMemberFilterId,
    teamMemberFilterName: state.teamDashboard.teamMemberFilterName,
    teamMembers
  };
};

class TeamProjectsHeaderContainer extends Component {
  componentWillReceiveProps(nextProps) {
    const {dispatch, teamId: oldTeamId} = this.props;
    const {teamId} = nextProps;
    if (oldTeamId !== teamId) {
      dispatch(filterTeamMember(null));
    }
  }
  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch(filterTeamMember(null));
  }
  render() {
    const {dispatch, teamId, teamMemberFilterId, teamMemberFilterName, teamMembers} = this.props;
    return (
      <TeamProjectsHeader
        dispatch={dispatch}
        teamId={teamId}
        teamMemberFilterId={teamMemberFilterId}
        teamMemberFilterName={teamMemberFilterName}
        teamMembers={teamMembers}
      />
    );
  }
}

TeamProjectsHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teamId: PropTypes.string.isRequired,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string,
  teamMembers: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(TeamProjectsHeaderContainer);
