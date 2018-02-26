import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingUpdatesPrompt from 'universal/modules/meeting/components/MeetingUpdatesPrompt/MeetingUpdatesPrompt';
import {LOBBY, UPDATES} from 'universal/utils/constants';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {withRouter} from 'react-router-dom';
import styled from 'react-emotion';
import {Helmet} from 'react-helmet';

const MeetingContainer = styled('div')({
  backgroundColor: '#fff',
  display: 'flex',
  height: '100vh'
});

class NewMeeting extends Component {
  render() {
    const {viewer} = this.props;
    const {team: {teamName}} = viewer;
    return (
      <MeetingContainer>
        <Helmet title={`Retrospective Meeting for ${teamName} | Parabol`} />
        <Sidebar
          gotoItem={this.gotoItem}
          gotoAgendaItem={this.gotoAgendaItem}
          localPhase={localPhase}
          localPhaseItem={localPhaseItem}
          isFacilitating={isFacilitating}
          setAgendaInputRef={this.setAgendaInputRef}
          team={team}
        />
        <MeetingMain hasBoxShadow>
          <MeetingMainHeader>
            <MeetingAvatarGroup
              gotoItem={this.gotoItem}
              gotoNext={this.gotoNext}
              isFacilitating={isFacilitating}
              localPhase={localPhase}
              localPhaseItem={localPhaseItem}
              team={team}
            />
            {localPhase === UPDATES &&
            <MeetingUpdatesPrompt
              agendaInputRef={this.agendaInputRef}
              gotoNext={this.gotoNext}
              localPhaseItem={localPhaseItem}
              updateUserHasTasks={this.state.updateUserHasTasks}
              team={team}
            />
            }
          </MeetingMainHeader>
          {localPhase === LOBBY && <MeetingLobby team={team} />}
        </MeetingMain>
      </MeetingLayout>
    );
  }
}

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(
    withHotkey(
      withAtmosphere(
        withMutationProps(
          withRouter(
            NewMeeting
          )
        )
      )
    )
  ),
  graphql`
    fragment NewMeeting_viewer on User {
      team(teamId: $teamId) {
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        id
        teamName: name
        newMeetingId
        tier
        teamMembers(sortBy: "checkInOrder") {
          id
          preferredName
          picture
          checkInOrder
          isCheckedIn
          isConnected
          isFacilitator
          isLead
          isSelf
          userId
        }
        newMeeting {
          id
          facilitatorId
          phases {
            isComplete
            type
            isSingleView
            isAutoAdvanced
            customPhaseItem {
              ...on RetroPhaseItem {
                title
                question
              }
            }
          }
          ... on RetrospectiveMeeting {
            thoughts {
              id
            }
            thoughtGroups {
              id
            }
          }
        }
      }
    }
  `
);
