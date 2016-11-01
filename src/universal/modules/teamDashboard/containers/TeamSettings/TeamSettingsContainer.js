import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings';
import {cashay} from 'cashay';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const teamSettingsQuery = `
query {
  team @cached(id: $teamId, type: "Team") {
    id
    name
  },
  teamMembers(teamId: $teamId) @live {
    id
    isLead
    picture
    preferredName
  }
}`;

const mapStateToProps = (state, props) => {
  const {teamId} = props.params;
  const {team, teamMembers} = cashay.query(teamSettingsQuery, {
    op: 'teamSettingsContainer',
    key: teamId,
    variables: {teamId}
  }).data;
  return {
    team,
    teamMembers
  };
};

@connect(mapStateToProps)
export default class TeamSettingsContainer extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    teamMembers: PropTypes.array.isRequired
  };

  render() {
    const {team, teamMembers} = this.props;
    if (teamMembers.length === 0) {
      return <LoadingView/>
    }
    return <TeamSettings team={team} teamMembers={teamMembers}/>;
  }
};
