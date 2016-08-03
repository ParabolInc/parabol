import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamProjects from 'universal/modules/teamDashboard/components/TeamProjects/TeamProjects';

const AgendaAndProjects = (props) => {
  const {styles} = AgendaAndProjects;
  return (
    <div className={styles.root}>
      <TeamAgenda/>
      <TeamProjects/>
    </div>
  )
};

AgendaAndProjects.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaAndProjects);
