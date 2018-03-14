// @flow
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

import type {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import type {NewMeeting_viewer as Viewer} from './__generated__/NewMeeting_viewer.graphql';
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import ui from 'universal/styles/ui';
import {CHECKIN} from 'universal/utils/constants';
import NewMeetingCheckIn from 'universal/components/NewMeetingCheckIn';
import findStageById from 'universal/utils/meetings/findStageById';
import fromStageIdToUrl from 'universal/utils/meetings/fromStageIdToUrl';
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation';

const MeetingContainer = styled('div')({
  backgroundColor: ui.backgroundColor,
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

type Props = {
  atmosphere: Object,
  localPhase: NewMeetingPhaseTypeEnum,
  meetingType: MeetingTypeEnum,
  viewer: Viewer
}

class NewMeeting extends Component<Props> {
  gotoStageId = (stageId, submitMutation, onError, onCompleted) => {
    const {atmosphere, meetingType, viewer: {team: {teamId, newMeeting: {facilitatorStageId, facilitatorUserId, meetingId, phases}}}} = this.props;
    const nextUrl = fromStageIdToUrl(stageId, phases, teamId, meetingType);
    if (!nextUrl) return;
    const {viewerId} = atmosphere;
    const isFacilitating = viewerId === facilitatorUserId;
    if (isFacilitating) {
      const {stage: {isComplete}} = findStageById(phases, facilitatorStageId);
      const variables = {meetingId, facilitatorStageId: stageId};
      if (!isComplete) {
        variables.completedStageId = facilitatorStageId;
      }
      submitMutation();
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted);
    }
    history.push(nextUrl);
  }

  render() {
    const {atmosphere, localPhase, meetingType, viewer} = this.props;
    const {team} = viewer;
    const {newMeeting, teamName} = team;
    const {facilitatorUserId} = newMeeting || {};
    const meetingSlug = meetingTypeToSlug[meetingType];
    const {viewerId} = atmosphere;
    const isFacilitating = facilitatorUserId === viewerId;
    return (
      <MeetingContainer>
        <Helmet title={`Retrospective Meeting for ${teamName} | Parabol`} />
        <NewMeetingSidebar localPhase={localPhase} viewer={viewer} />
        <MeetingArea>
          <MeetingAreaHeader>
            <MeetingAvatarGroup
              gotoItem={() => {}}
              isFacilitating={isFacilitating}
              localPhase={localPhase}
              localPhaseItem={null}
              team={team}
            />
          </MeetingAreaHeader>
          <Switch>
            <Route
              path={`/${meetingSlug}/:teamId`}
              render={() => <NewMeetingLobby meetingType={meetingType} team={team} />}
            />
            <Route
              path={`/${meetingSlug}/:teamId/${phaseTypeToSlug[CHECKIN]}/:localPhaseItem`}
              render={() => <NewMeetingCheckIn meetingType={meetingType} team={team} />}
            />
          </Switch>
        </MeetingArea>
      </MeetingContainer>
    );
  }
};

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
        meetingId
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
          meetingId: id
          facilitatorUserId
          phases {
            phaseType
            stages {
              isComplete
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
