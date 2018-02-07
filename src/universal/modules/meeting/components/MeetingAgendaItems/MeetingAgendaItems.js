import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';

class MeetingAgendaItems extends Component {
  state = {agendaTasks: []};

  componentWillMount() {
    this.makeAgendaTasks(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {tasks: oldTasks}, localPhaseItem: oldLocalPhaseItem} = this.props;
    const {viewer: {tasks}, localPhaseItem} = nextProps;
    if (tasks !== oldTasks || localPhaseItem !== oldLocalPhaseItem) {
      this.makeAgendaTasks(nextProps);
    }
  }

  makeAgendaTasks(props) {
    const {localPhaseItem, viewer: {team: {agendaItems}, tasks}} = props;
    const agendaItem = agendaItems[localPhaseItem - 1];
    const agendaTasks = tasks.edges
      .map(({node}) => node)
      .filter((node) => node.agendaId === agendaItem.id)
      .sort((a, b) => a.sortOrder < b.sortOrder ? 1 : -1);

    this.setState({
      agendaTasks
    });
  }

  render() {
    const {
      facilitatorName,
      gotoNext,
      hideMoveMeetingControls,
      localPhaseItem,
      styles,
      viewer: {team}
    } = this.props;
    const {agendaTasks} = this.state;
    const {agendaItems, teamMembers} = team;
    const agendaItem = agendaItems[localPhaseItem - 1];
    const currentTeamMember = teamMembers.find((m) => m.id === agendaItem.teamMember.id);
    const isLast = agendaItems.length === localPhaseItem;
    const heading = (<span>{currentTeamMember.preferredName}: <i
      style={{color: ui.palette.warm}}
    >“{agendaItem.content}”</i></span>);
    return (
      <MeetingMain>
        <MeetingSection flexToFill paddingBottom="2rem">
          <MeetingSection flexToFill>
            <div className={css(styles.layout)}>
              <div className={css(styles.prompt)}>
                <MeetingPrompt
                  avatar={currentTeamMember.picture}
                  heading={heading}
                  subHeading={'What do you need?'}
                />
              </div>
              <div className={css(styles.nav)}>
                {hideMoveMeetingControls ?
                  <MeetingFacilitationHint>
                    {'Waiting for'} <b>{facilitatorName}</b> {`to wrap up the ${actionMeeting.agendaitems.name}`}
                  </MeetingFacilitationHint> :
                  <Button
                    buttonStyle="flat"
                    colorPalette="cool"
                    icon="arrow-circle-right"
                    iconPlacement="right"
                    key={`agendaItem${localPhaseItem}`}
                    label={isLast ? 'Wrap up the meeting' : `Next ${AGENDA_ITEM_LABEL}`}
                    onClick={gotoNext}
                    buttonSize="medium"
                  />
                }
              </div>
              <MeetingAgendaCards
                agendaId={agendaItem.id}
                tasks={agendaTasks}
                teamId={team.id}
              />
              <EditorHelpModalContainer />
            </div>
          </MeetingSection>
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
    );
  }
}

MeetingAgendaItems.propTypes = {
  facilitatorName: PropTypes.string.isRequired,
  gotoNext: PropTypes.func.isRequired,
  hideMoveMeetingControls: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  styles: PropTypes.object.isRequired,
  viewer: PropTypes.object
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 .5rem 4rem',
    width: '100%',

    [ui.breakpoint.wide]: {
      paddingBottom: '0 1rem 6rem'
    },

    [ui.breakpoint.wider]: {
      paddingBottom: '8rem'
    },

    [ui.breakpoint.widest]: {
      paddingBottom: '12rem'
    }
  },

  prompt: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },

  nav: {
    paddingTop: '1rem',
    textAlign: 'center',
    width: '100%'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingAgendaItems),
  graphql`
    fragment MeetingAgendaItems_viewer on User {
      team(teamId: $teamId) {
        id
        agendaItems {
          id
          content
          teamMember {
            id
          }
        }
        teamMembers(sortBy: "checkInOrder") {
          id
          picture
          preferredName
        }
      }
      tasks(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            id
            agendaId
            createdAt
            sortOrder
            ...NullableTask_task
          }
        }
      }
    }`
);
