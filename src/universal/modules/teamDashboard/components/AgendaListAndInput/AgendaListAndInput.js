import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaListContainer from 'universal/modules/teamDashboard/containers/AgendaList/AgendaListContainer';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';


const AgendaListAndInput = (props) => {
  const {styles} = AgendaListAndInput;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaListContainer teamId={teamId}/>
      <AgendaInput/>
    </div>
  );
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
