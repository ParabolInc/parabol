import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import AddSoftTeamMember from 'universal/modules/outcomeCard/components/AddSoftTeamMember';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';

class OutcomeCardAssignMenu extends Component {
  state = {
    active: 0,
    assignees: []
  };

  componentDidMount() {
    this.menuRef.focus();
    this.setAssignees(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {team: {teamMembers, softTeamMembers}}} = nextProps;
    const {viewer: {team: {teamMembers: oldTeamMembers, softTeamMembers: oldSoftTeamMembers}}} = this.props;
    if (teamMembers !== oldTeamMembers || oldSoftTeamMembers !== softTeamMembers) {
      this.setAssignees(nextProps);
    }
  }

  setAddSoftAsActive = () => {
    this.setState({
      active: this.state.assignees.length
    });
  };

  setAssignees(props) {
    const {viewer: {team: {teamMembers, softTeamMembers}}, task: {assignee: {assigneeId}}} = props;
    this.setState({
      assignees: teamMembers
        .concat(softTeamMembers)
        .filter((teamMember) => teamMember.id !== assigneeId)
    });
  }

  handleKeyDown = (e) => {
    const {assignees} = this.state;
    const {active} = this.state;
    let handled;
    if (e.key === 'ArrowDown') {
      handled = true;
      this.setState({
        active: Math.min(active + 1, assignees.length)
      });
    } else if (e.key === 'ArrowUp') {
      handled = true;
      this.setState({
        active: Math.max(active - 1, 0)
      });
    } else if (e.key === 'Enter') {
      const nextAssignee = assignees[active];
      if (nextAssignee) {
        handled = true;
        this.handleMenuItemClick(nextAssignee.id)();
      }
    }
    if (handled) {
      e.preventDefault();
    }
  };

  handleTaskUpdate = (newOwner) => {
    const {
      atmosphere,
      area,
      task: {taskId, assignee: {assigneeId}}
    } = this.props;
    if (newOwner === assigneeId) {
      return;
    }
    const updatedTask = {
      id: taskId,
      assigneeId: newOwner
    };
    UpdateTaskMutation(atmosphere, updatedTask, area);
  };

  handleMenuItemClick = (newAssigneeId) => () => {
    const {assignRef, closePortal} = this.props;
    this.handleTaskUpdate(newAssigneeId);
    closePortal();
    assignRef.focus();
  };

  render() {
    const {active} = this.state;
    const {
      area,
      assignRef,
      closePortal,
      task: {taskId},
      viewer: {team}
    } = this.props;
    const {assignees} = this.state;
    const menuBlock = {
      outline: 0
    };
    return (
      <div tabIndex={-1} onKeyDown={this.handleKeyDown} ref={(c) => { this.menuRef = c; }} style={menuBlock}>
        {assignees.map((teamMember, idx) => {
          return (
            <MenuItem
              key={teamMember.id}
              avatar={teamMember.picture || avatarUser}
              isActive={active === idx}
              label={teamMember.preferredName}
              onClick={this.handleMenuItemClick(teamMember.id)}
            />
          );
        })}
        <AddSoftTeamMember
          isActive={active >= assignees.length}
          area={area}
          closePortal={closePortal}
          taskId={taskId}
          team={team}
          menuRef={this.menuRef}
          assignRef={assignRef}
          setAddSoftAsActive={this.setAddSoftAsActive}
        />
      </div>
    );
  }
}

OutcomeCardAssignMenu.propTypes = {
  area: PropTypes.string.isRequired,
  assignRef: PropTypes.instanceOf(Element),
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withAtmosphere(OutcomeCardAssignMenu),
  graphql`
    fragment OutcomeCardAssignMenu_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
        softTeamMembers {
          id
          preferredName
        }
        ...AddSoftTeamMember_team
      }
    }
    fragment OutcomeCardAssignMenu_task on Task {
      taskId: id
      assignee {
        assigneeId: id
      }
    }
  `
);
