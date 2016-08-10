import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
const TeamAgenda = (props) => {
  const {styles} = TeamAgenda;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaHeader/>
      <AgendaListAndInput teamId={teamId}/>
    </div>
  );
};

TeamAgenda.propTypes = {
  // TODO:
  children: PropTypes.any
};

TeamAgenda.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(TeamAgenda);
