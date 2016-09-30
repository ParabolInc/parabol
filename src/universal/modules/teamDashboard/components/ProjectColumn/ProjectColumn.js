import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import themeLabels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import ProjectCardContainer from 'universal/containers/ProjectCard/ProjectCardContainer';
import {ACTIVE, STUCK, DONE, FUTURE, USER_DASH, TEAM_DASH, MEETING} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {cashay} from 'cashay';
import shortid from 'shortid';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {MenuToggle} from 'universal/components';
import MenuItem from 'universal/components/MenuItem/MenuItem';

const combineStyles = StyleSheet.combineStyles;
const badgeIconStyle = {
  height: '1.5rem',
  lineHeight: '1.5rem',
  width: '1.5rem'
};
const borderColor = ui.dashBorderColor;
const labels = {
  [DONE]: 'Done',
  [ACTIVE]: 'Active',
  [STUCK]: 'Stuck',
  [FUTURE]: 'Future'
};

let styles = {};

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
  const {area, status, projects, myTeamMemberId, teams, userId} = props;
  const label = labels[status];

  // TODO do it fur real
  const MeetingCardContainer = ProjectCardContainer;
  const CardContainer = area === MEETING ? MeetingCardContainer : ProjectCardContainer;
  const makeAddProjectButton = (clickHandler) => {
    return (<FontAwesome
      className={combineStyles(styles.addIcon, styles[status])}
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
        <MenuToggle menuOrientation="right" menuWidth="10rem" toggle={toggle} toggleHeight="1.5rem" label="Select Team:">
          {menuItems.map((item, idx) =>
            <MenuItem
              isActive={item.isActive}
              key={`MenuItem${idx}`}
              label={item.label}
              onClick={item.handleClick}
            />
          )}
        </MenuToggle>
      );
    }
    return null;
  };

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={combineStyles(styles.statusBadge, styles[`${status}Bg`])}>
          <FontAwesome
            className={styles.statusBadgeIcon}
            name={themeLabels.projectStatus[status].icon}
            style={badgeIconStyle}
          />
        </span>
        <span className={combineStyles(styles.statusLabel, styles[status])}>
          {label}
        </span>
        {makeAddProject()}
      </div>
      <div className={styles.columnBody}>
        <div className={styles.columnInner}>
          {projects.map(project =>
            <CardContainer
              key={`teamCard${project.id}`}
              area={area}
              project={project}
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
  status: PropTypes.string,
  teams: PropTypes.array,
  userId: PropTypes.string
};

const columnStyles = {
  flex: 1,
  width: '25%'
};

styles = StyleSheet.create({
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
    color: theme.palette.dark,
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
    fontSize: theme.typography.s3,
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

export default look(ProjectColumn);
