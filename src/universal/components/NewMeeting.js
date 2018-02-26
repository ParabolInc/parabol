import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {withRouter} from 'react-router-dom';
import styled from 'react-emotion';
import {Helmet} from 'react-helmet';
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar';

const MeetingContainer = styled('div')({
  backgroundColor: '#fff',
  display: 'flex',
  height: '100vh'
});

class NewMeeting extends Component {
  render() {
    const {localPhase, viewer} = this.props;
    const {team: {teamName}} = viewer;
    return (
      <MeetingContainer>
        <Helmet title={`Retrospective Meeting for ${teamName} | Parabol`} />
        <NewMeetingSidebar localPhase={localPhase} viewer={viewer} />
      </MeetingContainer>
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
      ...NewMeetingSidebar_viewer
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
          stages {
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
