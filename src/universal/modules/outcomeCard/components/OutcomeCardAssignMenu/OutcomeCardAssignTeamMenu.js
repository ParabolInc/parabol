import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';
import ChangeTaskTeamMutation from 'universal/mutations/ChangeTaskTeamMutation';
import styled from 'react-emotion';

const makeAssignableTeams = (props) => {
  const {viewer: {teams}, task: {team: {teamId}}} = props;
  return teams.filter((team) => team.teamId !== teamId);
};

const MenuLabel = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`
});

class OutcomeCardAssignTeamMenu extends Component {
  state = {
    assignableTeams: []
  };

  componentWillMount() {
    this.state.assignableTeams = makeAssignableTeams(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {teams}} = nextProps;
    const {viewer: {teams: oldTeams}} = this.props;
    if (teams !== oldTeams) {
      this.setState({
        assignableTeams: makeAssignableTeams(nextProps)
      });
    }
  }

  handleTaskUpdate = (newTeam) => () => {
    const {
      atmosphere,
      task: {taskId, team: {teamId: oldTeamId}}
    } = this.props;
    const {teamId} = newTeam;
    if (oldTeamId === teamId) {
      return;
    }
    ChangeTaskTeamMutation(atmosphere, {taskId, teamId});
  };

  render() {
    const {
      closePortal
    } = this.props;
    const {assignableTeams} = this.state;

    if (assignableTeams.length === 0) return <div />;
    return (
      <MenuWithShortcuts
        ariaLabel={'Assign this task to another team'}
        closePortal={closePortal}
      >
        <MenuLabel>Move to:</MenuLabel>
        {assignableTeams.map((team) => {
          return (
            <MenuItemWithShortcuts
              key={team.teamId}
              label={team.teamName}
              onClick={this.handleTaskUpdate(team)}
            />
          );
        })}
      </MenuWithShortcuts>
    );
  }
}

OutcomeCardAssignTeamMenu.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withAtmosphere(OutcomeCardAssignTeamMenu),
  graphql`
    fragment OutcomeCardAssignTeamMenu_viewer on User {
      teams {
        teamId: id
        teamName: name
      }
    }
    fragment OutcomeCardAssignTeamMenu_task on Task {
      taskId: id
      team {
        teamId: id
      }
    }
  `
);
