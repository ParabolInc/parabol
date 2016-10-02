import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {withRouter} from 'react-router';
import {AGENDA_ITEMS} from 'universal/utils/constants';

const AgendaListAndInput = (props) => {
  const {agenda, agendaPhaseItem, isFacilitating, myTeamMember, styles, router, teamId} = props;
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, agenda.length, router, teamId, AGENDA_ITEMS);
  return (
    <div className={css(styles.root)}>
      <AgendaInput
        agenda={agenda}
        teamId={teamId}
        myTeamMember={myTeamMember}
      />
      <AgendaList
        agenda={agenda}
        agendaPhaseItem={agendaPhaseItem}
        phaseItemFactory={phaseItemFactory}
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

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%'
  }
});

export default withRouter(withStyles(styleThunk)(AgendaListAndInput));
