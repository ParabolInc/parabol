import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {overflowTouch} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';
import TeamProjectCard from 'universal/modules/teamDashboard/components/TeamProjectCard/TeamProjectCard';

const TeamArchive = (props) => {
  const {styles} = TeamArchive;
  const {archivedProjects, dispatch, teamId} = props;
  return (
    <div className={styles.root}>
        <TeamArchiveHeader teamId={teamId}/>
      <div className={styles.body}>
        <div className={styles.scrollable}>
          <div className={styles.cardGrid}>
          {archivedProjects.map(project =>
              <div className={styles.cardBlock} key={`cardBlockFor${project.id}`}>
            <TeamProjectCard
              key={project.id}
              dispatch={dispatch}
              form={`archived::${project.id}`}
              project={project}
              isArchived
            />
              </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

TeamArchive.propTypes = {
  archivedProjects: PropTypes.array,
  teamId: PropTypes.string,
  teamMembers: PropTypes.array
};

TeamArchive.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: '0 0 0 1.5rem',
    width: '100%'
  },

  body: {
    borderTop: `1px solid ${ui.dashBorderColor}`,
    flex: 1,
    position: 'relative'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    padding: '1.5rem 0 0',
    position: 'absolute',
    right: 0,
    top: 0,
  },

  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: ui.projectColumnsMaxWidth,
    width: '100%'
  },

  cardBlock: {
    flex: '0 0 100%',
    padding: '0 1.5rem 1rem 0',

    '@media (min-width: 40rem)': {
      flex: '0 0 50%'
    },

    '@media (min-width: 60rem)': {
      flex: '0 0 33.3333%'
  },

    '@media (min-width: 80rem)': {
      flex: '0 0 25%'
  },

    '@media (min-width: 100rem)': {
      flex: '0 0 20%'
    }
  }
});

export default look(TeamArchive);
