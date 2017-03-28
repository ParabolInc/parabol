import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {phaseArray} from 'universal/utils/constants';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import voidClick from 'universal/utils/voidClick';

const AgendaListAndInput = (props) => {
  const {
    agenda,
    agendaPhaseItem,
    context,
    disabled,
    facilitatorPhase,
    facilitatorPhaseItem,
    gotoAgendaItem,
    localPhase,
    localPhaseItem,
    myTeamMember,
    styles,
    teamId
  } = props;
  const rootStyles = css(
    styles.root,
    disabled && styles.disabled
  );
  const handleOnClick = disabled && voidClick;
  return (
    <div className={rootStyles} onClick={handleOnClick}>
      <AgendaInput
        agenda={agenda}
        disabled={disabled}
        teamId={teamId}
        myTeamMember={myTeamMember}
      />
      <AgendaList
        agenda={agenda}
        agendaPhaseItem={agendaPhaseItem}
        context={context}
        disabled={disabled}
        facilitatorPhase={facilitatorPhase}
        facilitatorPhaseItem={facilitatorPhaseItem}
        gotoAgendaItem={gotoAgendaItem}
        localPhase={localPhase}
        localPhaseItem={localPhaseItem}
        teamId={teamId}
      />
    </div>
  );
};

AgendaListAndInput.propTypes = {
  agenda: PropTypes.array,
  agendaPhaseItem: PropTypes.number,
  context: PropTypes.oneOf([
    'dashboard',
    'meeting'
  ]),
  disabled: PropTypes.bool,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  gotoAgendaItem: PropTypes.func,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  myTeamMember: PropTypes.object,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%'
  },

  disabled: {
    cursor: 'not-allowed',
    filter: 'blur(3px)'
  }
});

export default withStyles(styleThunk)(AgendaListAndInput);
