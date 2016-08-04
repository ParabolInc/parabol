import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ProjectColumns from 'universal/modules/teamDashboard/components/ProjectColumns/ProjectColumns';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';

const TeamProjects = (props) => {
  const {styles} = TeamProjects;
  const {teamMemberId} = props;
  const projects = [];
  return (
    <div className={styles.root}>
      <TeamProjectsHeader/>
      <ProjectColumns teamMemberId={teamMemberId} projects={projects}/>
    </div>
  )
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
