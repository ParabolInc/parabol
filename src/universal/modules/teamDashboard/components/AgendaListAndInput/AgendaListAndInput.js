import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {phaseArray} from 'universal/utils/constants';

const AgendaListAndInput = (props) => {
  const {
    agendaPhaseItem,
    canNavigate,
    context,
    disabled,
    facilitatorPhase,
    facilitatorPhaseItem,
    gotoAgendaItem,
    localPhase,
    localPhaseItem,
    styles,
    team
  } = props;
  const rootStyles = css(
    styles.root,
    disabled && styles.disabled
  );
  return (
    <div className={rootStyles}>
      <AgendaInput
        context={context}
        disabled={disabled}
        team={team}
      />
      <AgendaList
        agendaPhaseItem={agendaPhaseItem}
        canNavigate={canNavigate}
        context={context}
        disabled={disabled}
        facilitatorPhase={facilitatorPhase}
        facilitatorPhaseItem={facilitatorPhaseItem}
        gotoAgendaItem={gotoAgendaItem}
        localPhase={localPhase}
        localPhaseItem={localPhaseItem}
        team={team}
      />
    </div>
  );
};

AgendaListAndInput.propTypes = {
  agenda: PropTypes.array,
  agendaPhaseItem: PropTypes.number,
  canNavigate: PropTypes.bool,
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
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = (theme, {context}) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: context === 'dashboard' ? 0 : ui.meetingSidebarGutter,
    width: '100%'
  },

  disabled: {
    cursor: 'not-allowed',
    filter: 'blur(3px)'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(AgendaListAndInput),
  graphql`
    fragment AgendaListAndInput_team on Team {
      agendaItems {
        id
        content
        teamMember {
          id
        }
      }
      ...AgendaInputField_team
      ...AgendaList_team
    }`
);
