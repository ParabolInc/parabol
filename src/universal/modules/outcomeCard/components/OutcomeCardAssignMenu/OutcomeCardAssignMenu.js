import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {css} from 'aphrodite-local-styles/no-important';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import AddSoftTeamMember from 'universal/modules/outcomeCard/components/AddSoftTeamMember';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

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

  closeMenu = () => {
    const {assignRef, closePortal} = this.props;
    closePortal();
    assignRef.focus();
  };

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
    } else if (e.key === 'Tab') {
      handled = true;
      this.closeMenu();
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
    this.handleTaskUpdate(newAssigneeId);
    this.closeMenu();
  };

  render() {
    const {active} = this.state;
    const {
      area,
      assignRef,
      closePortal,
      styles,
      task: {taskId},
      viewer: {team}
    } = this.props;
    const {assignees} = this.state;
    const menuBlock = {
      outline: 0
    };
    return (
      <div
        role="menu"
        aria-label={'Assign this task to a teammate'}
        tabIndex={-1}
        onKeyDown={this.handleKeyDown}
        ref={(c) => { this.menuRef = c; }}
        style={menuBlock}
      >
        <div className={css(styles.label)}>Assign to:</div>
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
        <div role="menuitem">
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
      </div>
    );
  }
}

OutcomeCardAssignMenu.propTypes = {
  area: PropTypes.string.isRequired,
  assignRef: PropTypes.instanceOf(Element),
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
  task: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    borderBottom: `1px solid ${appTheme.palette.mid30l}`,
    color: ui.palette.dark,
    fontSize: ui.menuItemFontSize,
    fontWeight: 700,
    lineHeight: ui.menuItemHeight,
    marginBottom: ui.menuGutterVertical,
    padding: `0 ${ui.menuGutterHorizontal}`
  }
});

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(OutcomeCardAssignMenu)),
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
