import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';

const TeamProjects = (props) => {
  const {styles} = TeamProjects;
  const {projects, teamMembers, teamMemberId} = props;
  return (
    <div className={styles.root}>
      <TeamProjectsHeader/>
      <ProjectColumns teamMemberId={teamMemberId} teamMembers={teamMembers} projects={projects}/>
    </div>
  );
};

TeamProjects.propTypes = {
  projects: PropTypes.array,
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
};

TeamProjects.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(TeamProjects);
