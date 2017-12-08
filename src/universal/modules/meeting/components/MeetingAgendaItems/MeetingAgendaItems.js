import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';

class MeetingAgendaItems extends Component {
  state = {};

  componentWillMount() {
    this.makeAgendaProjects(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {projects: oldProjects}, localPhaseItem: oldLocalPhaseItem} = this.props;
    const {viewer: {projects}, localPhaseItem} = nextProps;
    if (projects !== oldProjects || localPhaseItem !== oldLocalPhaseItem) {
      this.makeAgendaProjects(nextProps);
    }
  }

  makeAgendaProjects(props) {
    const {localPhaseItem, viewer: {team: {agendaItems}, projects}} = props;
    const agendaItem = agendaItems[localPhaseItem - 1];
    const agendaProjects = projects.edges
      .map(({node}) => node)
      .filter((node) => node.agendaId === agendaItem.id)
      .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);

    this.setState({
      agendaProjects
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
    const {agendaProjects} = this.state;
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
                projects={agendaProjects}
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
      projects(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_projects") {
        edges {
          node {
            id
            agendaId
            createdAt
            ...NullableProject_project
          }
        }
      }
    }`
);
