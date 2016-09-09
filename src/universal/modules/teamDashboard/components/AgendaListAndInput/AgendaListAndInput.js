import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';

const AgendaListAndInput = (props) => {
  const {styles} = AgendaListAndInput;
  const {agenda, myTeamMember, teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaList
        agenda={agenda}
      />
      <AgendaInput
        agenda={agenda}
        teamId={teamId}
        myTeamMember={myTeamMember}
      />
    </div>
  );
};

AgendaListAndInput.propTypes = {
  agenda: PropTypes.array,
  myTeamMember: PropTypes.object,
  teamId: PropTypes.string
};

AgendaListAndInput.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%'
  }
});

export default look(AgendaListAndInput);
