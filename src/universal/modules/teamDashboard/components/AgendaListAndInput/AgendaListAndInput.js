import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaListContainer from 'universal/modules/teamDashboard/containers/AgendaList/AgendaListContainer';
import AgendaInputContainer from 'universal/modules/teamDashboard/containers/AgendaInput/AgendaInputContainer';

const AgendaListAndInput = (props) => {
  const {styles} = AgendaListAndInput;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaListContainer teamId={teamId}/>
      <AgendaInputContainer teamId={teamId}/>
    </div>
  );
};

AgendaListAndInput.propTypes = {
  teamId: PropTypes.string
};

AgendaListAndInput.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaListAndInput);
