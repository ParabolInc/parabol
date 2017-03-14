import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import themeLabels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import ProjectCardContainer from 'universal/containers/ProjectCard/ProjectCardContainer';
import {USER_DASH, TEAM_DASH, PROJECT} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {cashay} from 'cashay';
import shortid from 'shortid';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {Menu, MenuItem} from 'universal/modules/menu';
import {DropTarget as dropTarget} from 'react-dnd';
import handleColumnHover from 'universal/dnd/handleColumnHover';
import handleDrop from 'universal/dnd/handleDrop';
import withDragState from 'universal/dnd/withDragState';
import AddProjectButton from 'universal/components/AddProjectButton/AddProjectButton';
import dndNoise from 'universal/utils/dndNoise';

const columnTarget = {
  drop: handleDrop,
  hover: handleColumnHover
};

const badgeIconStyle = {
  height: '1.5rem',
  lineHeight: '1.5rem',
  width: '1.5rem'
};

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const handleAddProjectFactory = (status, teamMemberId, sortOrder) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newProject = {
    id: `${teamId}::${shortid.generate()}`,
    status,
    teamMemberId,
    sortOrder
  };
  cashay.mutate('createProject', {variables: {newProject}});
};

const ProjectColumn = (props) => {
  const {area, connectDropTarget, dragState, status, projects, myTeamMemberId, styles, teams, userId} = props;

  const label = themeLabels.projectStatus[status].slug;
  const makeTeamMenuItems = (sortOrder) => {
    return teams.map((team) => ({
      label: team.name,
      handleClick: () => cashay.mutate('createProject', {
        variables: {
          newProject: {
            id: `${team.id}::${shortid.generate()}`,
            status,
            teamMemberId: `${userId}::${team.id}`,
            sortOrder
          }
        }
      })
    }));
  };
  const makeAddProject = () => {
    const sortOrder = getNextSortOrder(projects, dndNoise());
    if (area === TEAM_DASH) {
      const handleAddProject = handleAddProjectFactory(status, myTeamMemberId, sortOrder);
      return <AddProjectButton onClick={handleAddProject} label={label} />;
    } else if (area === USER_DASH) {
      if (teams.length === 1) {
        const {id: teamId} = teams[0];
        const generatedMyTeamMemberId = `${userId}::${teamId}`;
        const handleAddProject = handleAddProjectFactory(status, generatedMyTeamMemberId, sortOrder);
        return <AddProjectButton onClick={handleAddProject} label={label} />;
      }
      const itemFactory = () => {
        const menuItems = makeTeamMenuItems(sortOrder);
        return menuItems.map((item) =>
          <MenuItem
            key={`MenuItem${item.label}`}
            label={item.label}
            onClick={item.handleClick}
          />
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

  // reset every rerender so we make sure we got the freshest info
  dragState.clear();
  return connectDropTarget(
    <div className={css(styles.column)}>
      <div className={css(styles.columnHeader)}>
        <span className={css(styles.statusBadge, styles[`${status}Bg`])}>
          <FontAwesome
            className={css(styles.statusBadgeIcon)}
            name={themeLabels.projectStatus[status].icon}
            style={badgeIconStyle}
          />
        </span>
        <span className={css(styles.statusLabel, styles[status])}>
          {label}
        </span>
        {makeAddProject()}
      </div>
      <div className={css(styles.columnBody)}>
        <div className={css(styles.columnInner)}>
          {projects.map((project) =>
            <ProjectCardContainer
              key={`teamCard${project.id}`}
              area={area}
              project={project}
              dragState={dragState}
              ref={(c) => {
                if (c) {
                  dragState.components.push(c);
                }
              }}
            />)
          }
        </div>
      </div>
    </div>
  );
};

ProjectColumn.propTypes = {
  area: PropTypes.string,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.array.isRequired,
  queryKey: PropTypes.string,
  status: PropTypes.string,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
};

const borderColor = ui.dashBorderColor;

const columnStyles = {
  flex: 1,
  width: '25%'
};

const styleThunk = () => ({
  columnFirst: {
    ...columnStyles,
    padding: '1rem 1rem 0 0'
  },

  column: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'scroll',
    position: 'relative'
  },

  columnLast: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 0 0 1rem',
  },

  columnHeader: {
    borderBottom: '1px solid rgba(0, 0, 0, .05)',
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
    height: '100%',
    padding: '.5rem 1rem 0',
    position: 'absolute',
    width: '100%'
  },

  statusBadge: {
    borderRadius: '.5rem',
    color: '#fff',
    display: 'inline-block',
    fontSize: '14px',
    height: '1.5rem',
    lineHeight: '1.5rem',
    marginRight: '.5rem',
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '1.5rem'
  },

  statusBadgeIcon: {
    lineHeight: '1.5rem'
  },

  statusLabel: {
    flex: 1,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  ...projectStatusStyles('backgroundColor', 'Bg'),
  ...projectStatusStyles('color'),
});

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});

export default
withDragState(
  dropTarget(PROJECT, columnTarget, dropTargetCb)(
    withStyles(styleThunk)(ProjectColumn)
  )
);
