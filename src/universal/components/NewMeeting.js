// @flow
import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import type {Match, RouterHistory} from 'react-router-dom';
import {Route, Switch, withRouter} from 'react-router-dom';
import styled from 'react-emotion';
import {Helmet} from 'react-helmet';
import NewMeetingSidebar from 'universal/components/NewMeetingSidebar';
import NewMeetingLobby from 'universal/components/NewMeetingLobby';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
import RetroReflectPhase from 'universal/components/RetroReflectPhase/RetroReflectPhase';
import type {NewMeeting_viewer as Viewer} from './__generated__/NewMeeting_viewer.graphql';
import {meetingTypeToLabel, meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import ui from 'universal/styles/ui';
import {CHECKIN} from 'universal/utils/constants';
import NewMeetingCheckIn from 'universal/components/NewMeetingCheckIn';
import findStageById from 'universal/utils/meetings/findStageById';
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation';
import ErrorBoundary from 'universal/components/ErrorBoundary';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId';
import handleHotkey from 'universal/utils/meetings/handleHotkey';
import {connect} from 'react-redux';
import KillNewMeetingMutation from 'universal/mutations/KillNewMeetingMutation';
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton';
import type {Dispatch} from 'redux';
import NewMeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup';
import updateLocalStage from 'universal/utils/relay/updateLocalStage';
import NewMeetingPhaseHeading from 'universal/components/NewMeetingPhaseHeading/NewMeetingPhaseHeading';

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
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: '1rem 0',
  maxWidth: '100%',
  overflow: 'hidden',
  padding: '0 1rem',
  width: '100%'
});

type Props = {
  atmosphere: Object,
  bindHotkey: (mousetrapKey: string | Array<string>, cb: () => void) => void,
  dispatch: Dispatch<*>,
  history: RouterHistory,
  match: Match,
  meetingType: MeetingTypeEnum,
  submitting: boolean,
  viewer: Viewer
}

type Variables = {
  meetingId: string,
  facilitatorStageId: ?string,
  completedStageId?: string
};

class NewMeeting extends Component<Props> {
  constructor(props) {
    super(props);
    const {atmosphere, bindHotkey, dispatch, history, submitting} = props;
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext, submitting));
    bindHotkey('left', handleHotkey(this.gotoPrev, submitting));
    bindHotkey('i c a n t h a c k i t', () => {
      const {viewer: {team: {newMeeting}}} = props;
      if (!newMeeting) return;
      const {meetingId} = newMeeting;
      KillNewMeetingMutation(atmosphere, {meetingId}, {dispatch, history});
    });
  }

  gotoStageId = (stageId, submitMutation, onError, onCompleted) => {
    const {atmosphere, viewer: {team: {newMeeting}}} = this.props;
    if (!newMeeting) return;
    const {facilitatorStageId, facilitatorUserId, meetingId, phases} = newMeeting;
    const {viewerId} = atmosphere;
    const isFacilitating = viewerId === facilitatorUserId;
    updateLocalStage(atmosphere, meetingId, stageId);
    if (isFacilitating) {
      const {stage: {isComplete}} = findStageById(phases, facilitatorStageId);
      const variables: Variables = {meetingId, facilitatorStageId: stageId};
      if (!isComplete) {
        variables.completedStageId = facilitatorStageId;
      }
      // submitMutation();
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted);
    }
  };

  gotoNext = () => {
    const {viewer: {team: {newMeeting}}} = this.props;
    if (!newMeeting) return;
    const {localStage: {localStageId}, phases} = newMeeting;
    const nextStageRes = findStageAfterId(phases, localStageId);
    if (!nextStageRes) {
      // TODO end meeting!
      return;
    }
    const {stage: {id: nextStageId}} = nextStageRes;
    this.gotoStageId(nextStageId);
  }

  gotoPrev = () => {
    const {viewer: {team: {newMeeting}}} = this.props;
    if (!newMeeting) return;
    const {localStage: {localStageId}, phases} = newMeeting;
    const nextStageRes = findStageBeforeId(phases, localStageId);
    if (!nextStageRes) {
      // TODO end meeting!
      return;
    }
    const {stage: {id: nextStageId}} = nextStageRes;
    this.gotoStageId(nextStageId);
  }

  render() {
    const {meetingType, viewer} = this.props;
    const {team} = viewer;
    const {newMeeting, teamName} = team;
    const {facilitatorStageId, localStage} = newMeeting || {};
    const meetingSlug = meetingTypeToSlug[meetingType];
    const meetingLabel = meetingTypeToLabel[meetingType];
    const inSync = localStage ? localStage.localStageId === facilitatorStageId : true;
    return (
      <MeetingContainer>
        <Helmet title={`${meetingLabel} Meeting for ${teamName} | Parabol`} />
        <NewMeetingSidebar gotoStageId={this.gotoStageId} meetingType={meetingType} viewer={viewer} />
        <MeetingArea>
          <MeetingAreaHeader>
            <NewMeetingPhaseHeading />
            <NewMeetingAvatarGroup
              gotoStageId={this.gotoStageId}
              team={team}
            />
          </MeetingAreaHeader>
          <ErrorBoundary>
            <Switch>
              <Route
                path={`/${meetingSlug}/:teamId/${phaseTypeToSlug[CHECKIN]}`}
                render={() => <NewMeetingCheckIn gotoNext={this.gotoNext} meetingType={meetingType} team={team} />}
              />
              <Route
                path="/retro/:teamId/reflect"
                component={RetroReflectPhase}
              />
              <Route
                path={`/${meetingSlug}/:teamId`}
                render={() => <NewMeetingLobby meetingType={meetingType} team={team} />}
              />
            </Switch>
          </ErrorBoundary>
        </MeetingArea>
        {!inSync && <RejoinFacilitatorButton onClickHandler={() => this.gotoStageId(facilitatorStageId)} />}
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
            connect()(
              NewMeeting
            )
          )
        )
      )
    )
  ),
  graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingSidebar_viewer
      team(teamId: $teamId) {
        ...NewMeetingAvatarGroup_team
        ...NewMeetingLobby_team
        ...NewMeetingCheckIn_team
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
          facilitatorStageId
          facilitatorUserId
          localStage {
            localStageId: id
          }
          phases {
            id
            phaseType
            stages {
              id
              isComplete
            }
          }
          ... on RetrospectiveMeeting {
            reflections {
              id
            }
            reflectionGroups {
              id
            }
          }
        }
      }
    }
  `
);
