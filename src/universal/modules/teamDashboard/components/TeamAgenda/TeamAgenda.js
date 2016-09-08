import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
const TeamAgenda = (props) => {
  const {styles} = TeamAgenda;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaHeader/>
      <AgendaListAndInputContainer teamId={teamId}/>
    </div>
  );
};

TeamAgenda.propTypes = {
  teamId: PropTypes.string,
  children: PropTypes.any
};

TeamAgenda.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    // padding: '1rem',
    width: '100%'
  }
});

export default look(TeamAgenda);
