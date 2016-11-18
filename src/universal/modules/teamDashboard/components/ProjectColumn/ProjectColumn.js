import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import themeLabels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import ProjectCardContainer from 'universal/containers/ProjectCard/ProjectCardContainer';
import {USER_DASH, TEAM_DASH} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {cashay} from 'cashay';
import shortid from 'shortid';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {Menu, MenuItem} from 'universal/modules/menu';
import {DropTarget as dropTarget} from 'react-dnd';
import {PROJECT, SORT_STEP} from 'universal/utils/constants';
import {findDOMNode} from 'react-dom';


const columnTarget = {
  hover(targetProps, monitor) {
    const {projects, status: targetStatus} = targetProps;
    const sourceProps = monitor.getItem();
    const {dragState, id, status: sourceStatus} = sourceProps;
    const {components, minY, maxY, thresholds} = dragState[targetStatus];
    const {y: sourceOffsetY} = monitor.getClientOffset();
    // console.log('hovering at', sourceOffsetY);
    // keep it cheap by only doing work when we know it will result in a change
    if (minY !== null && sourceOffsetY >= minY && sourceOffsetY <= maxY) {
      console.log('will not update until outside bounds of', minY, maxY, 'at', sourceOffsetY);
      return;
    }
    console.log('project order', projects.map(p => p.id));
    // establish an object full of centerY thresholds. When the thresh gets exceeded, we know where to drop the target
    if (thresholds.length === 0) {
      console.log('no thresholds, computing new ones from components', components);
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const node = findDOMNode(component);
        const {top, height} = node.getBoundingClientRect();
        thresholds[i] = top + height / 2;
      }
    }

    console.log('finding the best threshold', thresholds, sourceOffsetY);
    let i;
    for (i = 0; i < thresholds.length; i++) {
      const centerY = thresholds[i];
      if (sourceOffsetY < centerY) {
        console.log('found a good threshold', i, thresholds[i]);
        break;
      }
    }
    const updatedProject = {id};
    const projectToReplace = projects[i];
    const prevProject = projects[i-1];

    // for DESCENDING ONLY
    if (thresholds.length === 0) {
      console.log('no thresholds, setting to first in the column');
      updatedProject.teamSort = 0;
    } else if (i === 0) {
      // if we're trying to put it at the top, make sure it's not already at the top
      if (projectToReplace.id === id) {
        console.log('best place is where it is, at the top. setting min and max Y')
        // don't listen to any upwards movement, we'll still be on top
        dragState[targetStatus].minY = -1;
        // if there is a second card, start listening if we're halfway down it. otherwise, never listen to downward movement
        dragState[targetStatus].maxY = thresholds.length > 1 ? thresholds[1] + 1 : 10e6;
        return;
      }
      console.log('setting to first in the column behind', projectToReplace);
      updatedProject.teamSort = projectToReplace.teamSort + SORT_STEP;
    } else if (i === thresholds.length) {
        console.log('putting card at the end')
        // if we wanna put it at the end, make sure it's not already at the end
        if (prevProject.id === id) {
          console.log('best place is where it is (at the bottom), setting min and max Y')
          // only listen to upward movement starting halfway up the card above it
          dragState[targetStatus].minY = thresholds[i-1] - 1;
          // don't listen to downward movement. we're on the bottom & that ain't changing
          dragState[targetStatus].maxY = thresholds.length > i + 1  ? thresholds[i+1] + 1 : 10e6;
          return;
        }
      console.log('setting to last in the column after', prevProject);
      updatedProject.teamSort = prevProject.teamSort - SORT_STEP;
    } else {
      console.log('putting card in the middle')
      // if we're somewhere in the middle, make sure we're actually gonna move
      if (projectToReplace.id === id || prevProject.id === id) {
        // only listen to upward movement starting halfway up the card above it
        dragState[targetStatus].minY = thresholds[i - 1] - 1;
        // start listening if we're halfway down the card below
        dragState[targetStatus].maxY = thresholds[i] + 1;
        console.log('cannot assign to middle, setting min max', dragState[targetStatus].minY, dragState[targetStatus].maxY)
        return;
      }
      console.log('setting', id,  'in between', prevProject.id, projectToReplace.id);
      updatedProject.teamSort = (prevProject.teamSort + projectToReplace.teamSort) / 2;
      console.log('new sort', updatedProject.teamSort, 'in between', prevProject.teamSort, projectToReplace.teamSort)
    }
    // mutative for fast response
    sourceProps.teamSort = updatedProject.teamSort;

    if (targetStatus !== sourceStatus) {
      console.log('changing status', sourceStatus, targetStatus);
      updatedProject.status = targetStatus;
      // mutative
      sourceProps.status = targetStatus;
    }
    const [teamId] = id.split('::');
    const options = {
      ops: {
        teamColumnsContainer: teamId,
      },
      variables: {updatedProject}
    };
    // reset the drag state now that we've moved the card
    // console.log('why bad', sourceProps, targetProps, dragState.toString());
    console.log('clearing drag state and sending to cashay');
    dragState.clear();
    cashay.mutate('updateProject', options);
  }
};

const badgeIconStyle = {
  height: '1.5rem',
  lineHeight: '1.5rem',
  width: '1.5rem'
};
const handleAddProjectFactory = (status, teamMemberId, teamSort, userSort) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newProject = {
    id: `${teamId}::${shortid.generate()}`,
    status,
    teamMemberId,
    teamSort,
    userSort
  };
  cashay.mutate('createProject', {variables: {newProject}});
};

const ProjectColumn = (props) => {
  const {area, connectDropTarget, dragProject, status, privateDragState, projects, myTeamMemberId, styles, teams, userId} = props;

  const label = themeLabels.projectStatus[status].slug;
  const makeAddProjectButton = (clickHandler) => {
    return (<FontAwesome
      className={css(styles.addIcon, styles[status])}
      name="plus-square-o"
      onClick={clickHandler}
      title={`Add a Project set to ${label}`}
    />);
  };
  const makeTeamMenuItems = (userSort) => {
    return teams.map(team => ({
      label: team.name,
      isActive: false,
      handleClick: () => cashay.mutate('createProject', {
        variables: {
          newProject: {
            id: `${team.id}::${shortid.generate()}`,
            status,
            teamMemberId: `${userId}::${team.id}`,
            teamSort: 0,
            userSort
          }
        }
      })
    }));
  };
  const makeAddProject = () => {
    if (area === TEAM_DASH) {
      const teamSort = getNextSortOrder(projects, 'teamSort');
      const handleAddProject = handleAddProjectFactory(status, myTeamMemberId, teamSort, 0);
      return makeAddProjectButton(handleAddProject);
    } else if (area === USER_DASH) {
      const userSort = getNextSortOrder(projects, 'userSort');
      if (teams.length === 1) {
        const {id: teamId} = teams[0];
        const generatedMyTeamMemberId = `${userId}::${teamId}`;
        const handleAddProject = handleAddProjectFactory(status, generatedMyTeamMemberId, 0, userSort);
        return makeAddProjectButton(handleAddProject);
      }
      const toggle = makeAddProjectButton();
      const menuItems = makeTeamMenuItems(userSort);
      return (
        <Menu
          menuKey={`UserDashAdd${status}Project`}
          menuOrientation="right"
          menuWidth="10rem"
          toggle={toggle}
          toggleHeight="1.5rem" label="Select Team:"
        >
          {menuItems.map((item, idx) =>
            <MenuItem
              isActive={item.isActive}
              key={`MenuItem${idx}`}
              label={item.label}
              onClick={item.handleClick}
            />
          )}
        </Menu>
      );
    }
    return null;
  };

  // reset every rerender so we make sure we got the freshest info
  console.log('clearing prviate drag state components', status)
  privateDragState[status].components = [];
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
          {projects.map(project =>
            <ProjectCardContainer
              key={`teamCard${project.id}`}
              area={area}
              dragProject={dragProject}
              project={project}
              privateDragState={privateDragState}
              ref={(c) => {
                if (c) {
                  console.log('adding', c, 'to private drag state', status)
                  privateDragState[status].components.push(c)
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
    position: 'relative',
    zIndex: '400'
  },

  columnBody: {
    flex: 1,
    position: 'relative',
    zIndex: '200'
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

  addIcon: {
    // #shame overriding FA
    fontSize: '28px !important',
    height: '1.5rem',
    lineHeight: '1.5rem !important',
    paddingTop: '1px',

    ':hover': {
      cursor: 'pointer',
      opacity: '.5'
    },
    ':focus': {
      cursor: 'pointer',
      opacity: '.5'
    }
  },

  ...projectStatusStyles('backgroundColor', 'Bg'),
  ...projectStatusStyles('color'),
});

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});

export default dropTarget(PROJECT, columnTarget, dropTargetCb)(
  withStyles(styleThunk)(ProjectColumn)
);
