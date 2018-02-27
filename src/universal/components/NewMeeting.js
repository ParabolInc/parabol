import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {Route, Switch, withRouter} from 'react-router-dom';
import styled from 'react-emotion';
import {Helmet} from 'react-helmet';
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar';
import MeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/MeetingAvatarGroup';
import NewMeetingLobby from 'universal/components/NewMeetingLobby';

const MeetingContainer = styled('div')({
  backgroundColor: '#fff',
  display: 'flex',
  height: '100vh'
});

const MeetingArea = styled('div')({
  display: 'flex !important',
  flex: 1,
  flexDirection: 'column',
  minWidth: '60rem',
  width: '100%'
});

const MeetingAreaHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'row-reverse',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  maxWidth: '100%',
  overflow: 'hidden',
  padding: '1rem',
  width: '100%'
});

class NewMeeting extends Component {
  render() {
    const {localPhase, match, viewer} = this.props;
    const {team} = viewer;
    const {teamId, teamName} = team;
    return (
      <MeetingContainer>
        <Helmet title={`Retrospective Meeting for ${teamName} | Parabol`} />
        <NewMeetingSidebar localPhase={localPhase} viewer={viewer} />
        <MeetingArea>
          <MeetingAreaHeader>
            <MeetingAvatarGroup
              gotoItem={() => {}}
              isFacilitating={false}
              localPhase={localPhase}
              localPhaseItem={null}
              team={team}
            />
          </MeetingAreaHeader>
          <Switch>
            <Route path="/retro/:teamId" render={() => <NewMeetingLobby team={team}/>}/>
          </Switch>
        </MeetingArea>
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
        ...MeetingAvatarGroup_team
        ...NewMeetingLobby_team
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        teamId: id
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
          facilitatorUserId
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
