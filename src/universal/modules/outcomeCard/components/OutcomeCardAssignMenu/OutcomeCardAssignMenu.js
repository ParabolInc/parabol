import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import AddSoftTeamMember from 'universal/modules/outcomeCard/components/AddSoftTeamMember';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';

class OutcomeCardAssignMenu extends Component {
  state = {active: 0};
  handleKeyDown = (e) => {
    const {viewer: {team}, project: {assignee: {ownerId}}} = this.props;
    const {teamMembers, softTeamMembers} = team;
    const allAssignees = teamMembers
      .filter((teamMember) => teamMember.id !== ownerId)
      .concat(softTeamMembers);

    const {active} = this.state;
    let handled;
    if (e.key === 'ArrowDown') {
      handled = true;
      this.setState({
        active: Math.min(active + 1, allAssignees.length)
      });
    } else if (e.key === 'ArrowUp') {
      handled = true;
      this.setState({
        active: Math.max(active - 1, 0)
      });
    } else if (e.key === 'Enter') {
      const nextAssignee = allAssignees[active];
      if (nextAssignee) {
        handled = true;
        this.handleMenuItemClick(nextAssignee.id)();
      }
    }
    if (handled) {
      e.preventDefault();
    }
  };
  handleProjectUpdate = (newOwner) => {
    const {
      atmosphere,
      area,
      project: {projectId, assignee: {ownerId}}
    } = this.props;
    if (newOwner === ownerId) {
      return;
    }
    const updatedProject = {
      id: projectId,
      assigneeId: newOwner
    };
    UpdateProjectMutation(atmosphere, updatedProject, area);
  };
  handleMenuItemClick = (newAssigneeId) => () => {
    const {assignRef, closePortal} = this.props;
    this.handleProjectUpdate(newAssigneeId);
    closePortal();
    assignRef.focus();
  };

  componentDidMount() {
    this.menuRef.focus();
  }

  render() {
    const {active} = this.state;
    const {
      area,
      assignRef,
      closePortal,
      project: {projectId, assignee: {ownerId}},
      viewer: {team}
    } = this.props;
    const {softTeamMembers, teamMembers} = team;
    const allAssignees = teamMembers
      .filter((teamMember) => teamMember.id !== ownerId)
      .concat(softTeamMembers);
    return (
      <div tabIndex={-1} onKeyDown={this.handleKeyDown} ref={(c) => { this.menuRef = c; }}>
        {allAssignees.map((teamMember, idx) => {
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
          isActive={active >= allAssignees.length}
          area={area}
          closePortal={closePortal}
          projectId={projectId}
          team={team}
          menuRef={this.menuRef}
          assignRef={assignRef}
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
  project: PropTypes.object.isRequired,
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
    fragment OutcomeCardAssignMenu_project on Project {
      projectId: id
      assignee {
        ownerId: id
      }
    }
  `
);
