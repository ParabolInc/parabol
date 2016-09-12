import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {withRouter} from 'react-router';
import {AGENDA_ITEMS} from 'universal/utils/constants';

const AgendaListAndInput = (props) => {
  const {styles} = AgendaListAndInput;
  const {agenda, agendaPhaseItem, isFacilitating, myTeamMember, router, teamId} = props;
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, agenda.length, router, teamId, AGENDA_ITEMS);
  return (
    <div className={styles.root}>
      <AgendaList
        agenda={agenda}
        agendaPhaseItem={agendaPhaseItem}
        phaseItemFactory={phaseItemFactory}
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
  agendaPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  myTeamMember: PropTypes.object,
  router: PropTypes.object,
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

export default withRouter(look(AgendaListAndInput));
