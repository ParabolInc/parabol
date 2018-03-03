import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {phaseArray, AGENDA_ITEMS} from 'universal/utils/constants';

const meetingOnAgendaItem = (props) => (
  props.facilitatorPhase === AGENDA_ITEMS && props.facilitatorPhaseItem != null
);

const meetingChangingAgendaItem = (curProps, nextProps) => (
  nextProps.facilitatorPhase === AGENDA_ITEMS &&
  nextProps.facilitatorPhaseItem !== curProps.facilitatorPhaseItem
);

class AgendaListAndInput extends Component {
  static propTypes = {
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
    setAgendaInputRef: PropTypes.func,
    styles: PropTypes.object,
    team: PropTypes.object.isRequired
  };

  state = {
    visibleAgendaItemId: this.props.team.agendaItems[this.props.facilitatorPhaseItem - 1].id
  };

  componentDidMount() {
    if (meetingOnAgendaItem(this.props)) {
      this.scrollToFacilitatedAgendaItem(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {team: {agendaItems}} = this.props;
    if (!agendaItems.length) { return; }
    if (meetingChangingAgendaItem(this.props, nextProps)) {
      this.scrollToFacilitatedAgendaItem(nextProps);
    }
  }

  scrollToFacilitatedAgendaItem = (props) => {
    const {facilitatorPhaseItem, team: {agendaItems}} = props;
    if (!meetingOnAgendaItem(props)) {
      return;
    }
    this.setState({visibleAgendaItemId: agendaItems[facilitatorPhaseItem - 1].id});
  };

  scrollToLatestAgendaItem = () => {
    const {team: {agendaItems}} = this.props;
    if (!agendaItems.length) { return; }
    const visibleAgendaItemId = agendaItems[agendaItems.length - 1].id;
    this.setState({visibleAgendaItemId});
  };

  render() {
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
      setAgendaInputRef,
      styles,
      team
    } = this.props;
    const {visibleAgendaItemId} = this.state;
    const rootStyles = css(
      styles.root,
      disabled && styles.disabled
    );
    return (
      <div className={rootStyles}>
        <div className={css(styles.inner)}>
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
            visibleAgendaItemId={visibleAgendaItemId}
            team={team}
          />
          <AgendaInput
            context={context}
            disabled={disabled}
            afterSubmitAgendaItem={this.scrollToLatestAgendaItem}
            setAgendaInputRef={setAgendaInputRef}
            team={team}
          />
        </div>
      </div>
    );
  }
}

const styleThunk = (theme, {context}) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: context === 'dashboard' ? 0 : ui.meetingSidebarGutter,
    position: 'relative',
    width: '100%'
  },

  inner: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
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
