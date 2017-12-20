import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withScrolling from 'react-dnd-scrollzone';
import FontAwesome from 'react-fontawesome';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import AddProjectButton from 'universal/components/AddProjectButton/AddProjectButton';
import Badge from 'universal/components/Badge/Badge';
import DraggableProject from 'universal/containers/ProjectCard/DraggableProject';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import {Menu, MenuItem} from 'universal/modules/menu';
import CreateProjectMutation from 'universal/mutations/CreateProjectMutation';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {overflowTouch} from 'universal/styles/helpers';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import appTheme from 'universal/styles/theme/appTheme';
import themeLabels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {TEAM_DASH, USER_DASH} from 'universal/utils/constants';
import dndNoise from 'universal/utils/dndNoise';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

import ProjectColumnTrailingSpace from './ProjectColumnTrailingSpace';

// The `ScrollZone` component manages an overflowed block-level element,
// scrolling its contents when another element is dragged close to its edges.
const ScrollZone = withScrolling('div');

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const badgeColor = {
  done: 'dark',
  active: 'cool',
  stuck: 'warm',
  future: 'mid'
};

const handleAddProjectFactory = (atmosphere, status, teamId, userId, sortOrder) => () => {
  const newProject = {
    status,
    teamId,
    userId,
    sortOrder
  };
  CreateProjectMutation(atmosphere, newProject);
};

class ProjectColumn extends Component {
  static propTypes = {
    area: PropTypes.string,
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    firstColumn: PropTypes.bool,
    history: PropTypes.object.isRequired,
    isMyMeetingSection: PropTypes.bool,
    lastColumn: PropTypes.bool,
    myTeamMemberId: PropTypes.string,
    projects: PropTypes.array.isRequired,
    status: PropTypes.string,
    styles: PropTypes.object,
    teamMemberFilterId: PropTypes.string,
    teams: PropTypes.array
  };

  makeAddProject = () => {
    const {
      area,
      atmosphere,
      dispatch,
      history,
      isMyMeetingSection,
      status,
      projects,
      myTeamMemberId,
      teamMemberFilterId,
      teams
    } = this.props;
    const label = themeLabels.projectStatus[status].slug;
    const sortOrder = getNextSortOrder(projects, dndNoise());
    if (area === TEAM_DASH || isMyMeetingSection) {
      const {userId, teamId} = fromTeamMemberId(teamMemberFilterId || myTeamMemberId);
      const handleAddProject = handleAddProjectFactory(atmosphere, status, teamId, userId, sortOrder);
      return <AddProjectButton onClick={handleAddProject} label={label} />;
    } else if (area === USER_DASH) {
      if (teams.length === 1) {
        const {id: teamId} = teams[0];
        const {userId} = atmosphere;
        const handleAddProject = handleAddProjectFactory(atmosphere, status, teamId, userId, sortOrder);
        return <AddProjectButton onClick={handleAddProject} label={label} />;
      }
      const itemFactory = () => {
        const menuItems = this.makeTeamMenuItems(atmosphere, dispatch, history, sortOrder);
        return menuItems.map((item) =>
          (<MenuItem
            key={`MenuItem${item.label}`}
            label={item.label}
            onClick={item.handleClick}
          />)
        );
      };

      const toggle = <AddProjectButton label={label} />;
      return (
        <Menu
          itemFactory={itemFactory}
          originAnchor={originAnchor}
          menuWidth="10rem"
          targetAnchor={targetAnchor}
          toggle={toggle}
          label="Select Team:"
        />
      );
    }
    return null;
  };

  /**
   * `draggedProject` - project being dragged-and-dropped
   * `targetProject` - the project being "dropped on"
   * `before` - whether the dragged project is being inserted before (true) or
   * after (false) the target project.
   */
  insertProject = (draggedProjectId, targetProject, before) => {
    const {area, atmosphere, projects, status} = this.props;
    const targetIndex = projects.findIndex((p) => p.id === targetProject.id);
    // `boundingProject` is the project which sandwiches the dragged project on
    // the opposite side of the target project.  When the target project is in
    // the front or back of the list, this will be `undefined`.
    const boundingProject = projects[targetIndex + (before ? -1 : 1)];
    const draggedProject = projects.find((p) => p.id === draggedProjectId);
    const sortOrder = sortOrderBetween(targetProject, boundingProject, draggedProject, before);
    const noActionNeeded = draggedProject && sortOrder === draggedProject.sortOrder && draggedProject.status === status;
    if (noActionNeeded) {
      return;
    }
    const updatedProject = {id: draggedProjectId, sortOrder, status};
    UpdateProjectMutation(atmosphere, updatedProject, area);
  };

  makeTeamMenuItems = (atmosphere, dispatch, history, sortOrder) => {
    const {
      status,
      teams
    } = this.props;
    const {userId} = atmosphere;
    return teams.map((team) => ({
      label: team.name,
      handleClick: () => {
        const newProject = {
          status,
          teamMemberId: `${userId}::${team.id}`,
          sortOrder
        };
        CreateProjectMutation(atmosphere, newProject);
      }
    }));
  };

  render() {
    const {
      area,
      atmosphere,
      firstColumn,
      lastColumn,
      status,
      projects,
      styles
    } = this.props;
    const label = themeLabels.projectStatus[status].slug;
    const columnStyles = css(
      styles.column,
      firstColumn && styles.columnFirst,
      lastColumn && styles.columnLast
    );

    return (
      <div className={columnStyles}>
        <div className={css(styles.columnHeader)}>
          <div className={css(styles.statusLabelBlock)}>
            <span className={css(styles.statusIcon, styles[status])}>
              <FontAwesome name={themeLabels.projectStatus[status].icon} />
            </span>
            <span className={css(styles.statusLabel, styles[status])}>
              {label}
            </span>
            {(projects.length > 0) &&
            <span className={css(styles.statusBadge)}>
              <Badge colorPalette={badgeColor[status]} flat value={projects.length} />
            </span>
            }
          </div>
          {this.makeAddProject()}
        </div>
        <div className={css(styles.columnBody)}>
          <ScrollZone className={css(styles.columnInner)}>
            {projects.map((project) => (
              <DraggableProject
                key={`teamCard${project.id}`}
                area={area}
                project={project}
                myUserId={atmosphere.userId}
                insert={(draggedProjectId, before) => this.insertProject(draggedProjectId, project, before)}
              />
            ))}
            <ProjectColumnTrailingSpace
              area={area}
              projects={projects}
              status={status}
            />
          </ScrollZone>
        </div>
      </div>
    );
  }
}

const styleThunk = () => ({
  column: {
    borderLeft: `2px dashed ${ui.dashBorderColor}`,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'auto',
    position: 'relative',
    width: '25%'
  },

  columnFirst: {
    borderLeft: 0
  },

  columnLast: {
    // keeping this around, we may need it (TA)
  },

  columnHeader: {
    color: appTheme.palette.dark,
    display: 'flex !important',
    lineHeight: '1.5rem',
    padding: '.5rem 1rem',
    position: 'relative'
  },

  columnBody: {
    flex: 1,
    position: 'relative'
  },

  columnInner: {
    ...overflowTouch,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '0 1rem',
    position: 'absolute',
    width: '100%'
  },

  statusLabelBlock: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    fontSize: appTheme.typography.s3
  },

  statusIcon: {
    fontSize: '14px',
    marginRight: '.25rem',
    paddingTop: 1,
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  statusLabel: {
    fontWeight: 700,
    paddingTop: 2,
    textTransform: 'uppercase'
  },

  statusBadge: {
    marginLeft: '.5rem'
  },

  ...projectStatusStyles('color')
});

export default connect()(
  withAtmosphere(
    withRouter(
      withStyles(styleThunk)(ProjectColumn)
    )
  )
);
