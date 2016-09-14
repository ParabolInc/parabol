import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import layoutStyle from 'universal/styles/layout';
import TeamArchiveHeader from 'universal/modules/teamDashboard/components/TeamArchiveHeader/TeamArchiveHeader';

const {combineStyles} = StyleSheet;

const TeamArchive = (props) => {
  const {styles} = TeamArchive;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <div className={combineStyles(styles.root, styles.projects)}>
        <TeamArchiveHeader teamId={teamId}/>
      </div>
    </div>
  );
};

TeamArchive.propTypes = {
  teamId: PropTypes.string,
  teamMembers: PropTypes.array
};

TeamArchive.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem 1rem 1rem 0',
    width: '100%'
  },

  projects: {
    flexDirection: 'column',
  },

  agendaLayout: {
    width: layoutStyle.dashAgendaWidth
  },

  projectsLayout: {
    width: '80%'
  }
});

export default look(TeamArchive);
