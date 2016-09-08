import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import themeLabels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import ProjectCardContainer from 'universal/containers/ProjectCard/ProjectCardContainer';
import {ACTIVE, STUCK, DONE, FUTURE, SORT_STEP, USER_DASH, TEAM_DASH, MEETING} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';
import {cashay} from 'cashay';
import shortid from 'shortid';

const combineStyles = StyleSheet.combineStyles;
const borderColor = 'rgba(0, 0, 0, .1)';
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
  const {area, status, projects, myTeamMemberId} = props;
  const label = labels[status];
  let handleAddProject;
  if (area === TEAM_DASH) {
    const teamSort = projects[projects.length - 1] ? projects[projects.length - 1].teamSort + SORT_STEP : 0;
    handleAddProject = handleAddProjectFactory(status, myTeamMemberId, teamSort, 0);
  } else if (area === USER_DASH) {
    // TODO pop a menu of all the teams & create a card based on the team selection
  }
  // TODO do it fur real
  const MeetingCardContainer = ProjectCardContainer;
  const CardContainer = area === MEETING ? MeetingCardContainer : ProjectCardContainer;

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={combineStyles(styles.statusBadge, styles[`${status}Bg`])}>
          <FontAwesome className={styles.statusBadgeIcon} name={themeLabels.projectStatus[status].icon}/>
        </span>
        <span className={combineStyles(styles.statusLabel, styles[status])}>
          {label}
        </span>
        {handleAddProject &&
          <FontAwesome
            className={combineStyles(styles.addIcon, styles[status])}
            name="plus-square-o"
            onClick={handleAddProject}
            title={`Add a Project set to ${label}`}
          />
        }
      </div>
      {projects.map(project =>
        <CardContainer
          key={`teamCard${project.id}`}
          area={area}
          project={project}
        />)
      }
    </div>
  );
};

ProjectColumn.propTypes = {
  area: PropTypes.string,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.array.isRequired,
  status: PropTypes.string,
};

const columnStyles = {
  flex: 1,
  width: '25%'
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
    margin: '1rem 0',
    width: '100%'
  },

  columns: {
    display: 'flex !important',
    maxWidth: '80rem',
    width: '100%'
  },

  columnFirst: {
    ...columnStyles,
    padding: '1rem 1rem 0 0'
  },

  column: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 1rem 0'
  },

  columnLast: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 0 0 1rem',
  },

  columnHeader: {
    color: theme.palette.dark,
    display: 'flex !important',
    lineHeight: '1.5rem',
    margin: '0 0 1rem'
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
    fontSize: '28px',
    height: '1.5rem',
    lineHeight: '1.5rem',
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
