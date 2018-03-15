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

import type {Match, RouterHistory} from 'react-router-dom';
import type {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import type {NewMeeting_viewer as Viewer} from './__generated__/NewMeeting_viewer.graphql';
import {meetingTypeToLabel, meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import ui from 'universal/styles/ui';
import {CHECKIN} from 'universal/utils/constants';
import NewMeetingCheckIn from 'universal/components/NewMeetingCheckIn';
import findStageById from 'universal/utils/meetings/findStageById';
import fromStageIdToUrl from 'universal/utils/meetings/fromStageIdToUrl';
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation';
import ErrorBoundary from 'universal/components/ErrorBoundary';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId';
import handleHotkey from 'universal/utils/meetings/handleHotkey';
import fromUrlToStage from 'universal/utils/meetings/fromUrlToStage';
import KillMeetingMutation from 'universal/mutations/KillMeetingMutation';

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
  bindHotkey: (mousetrapKey: string|Array<string>, cb: () => void) => void,
  localPhase: NewMeetingPhaseTypeEnum,
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
    const {atmosphere, bindHotkey, history, match: {params: {teamId}}, meetingType, submitting} = props;
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext, submitting));
    bindHotkey('left', handleHotkey(this.gotoPrev, submitting));
    bindHotkey('i c a n t h a c k i t', () => {
      const onCompleted = () => {
        const meetingSlug = meetingTypeToSlug[meetingType];
        history.push(`/${meetingSlug}/${teamId}`);
      };
      KillMeetingMutation(atmosphere, teamId, history, undefined, onCompleted);
    });
  }
  gotoStageId = (stageId, submitMutation, onError, onCompleted) => {
    const {atmosphere, history, meetingType, viewer: {team: {teamId, newMeeting}}} = this.props;
    if (!newMeeting) return;
    const {facilitatorStageId, facilitatorUserId, meetingId, phases} = newMeeting;
    const nextUrl = fromStageIdToUrl(stageId, phases, teamId, meetingType);
    if (!nextUrl) return;
    const {viewerId} = atmosphere;
    const isFacilitating = viewerId === facilitatorUserId;
    if (isFacilitating) {
      const {stage: {isComplete}} = findStageById(phases, facilitatorStageId);
      const variables: Variables = {meetingId, facilitatorStageId: stageId};
      if (!isComplete) {
        variables.completedStageId = facilitatorStageId;
      }
      // submitMutation();
      NavigateMeetingMutation(atmosphere, variables, onError, onCompleted);
    }
    history.push(nextUrl);
  };

  gotoNext = () => {
    const {viewer: {team: {newMeeting}}} = this.props;
    if (!newMeeting) return;
    const {phases} = newMeeting;
    const stage = fromUrlToStage(phases);
    const nextStageRes = findStageAfterId(phases, stage.id);
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
    const {phases} = newMeeting;
    const stage = fromUrlToStage(phases);
    const nextStageRes = findStageBeforeId(phases, stage.id);
    if (!nextStageRes) {
      // TODO end meeting!
      return;
    }
    const {stage: {id: nextStageId}} = nextStageRes;
    this.gotoStageId(nextStageId);
  }

  render() {
    const {atmosphere, localPhase, meetingType, viewer} = this.props;
    const {team} = viewer;
    const {newMeeting, teamName} = team; const {facilitatorUserId} = newMeeting || {};
    const meetingSlug = meetingTypeToSlug[meetingType];
    const {viewerId} = atmosphere;
    const isFacilitating = facilitatorUserId === viewerId;
    const meetingLabel = meetingTypeToLabel[meetingType]; return (
      <MeetingContainer>
        <Helmet title={`${meetingLabel} Meeting for ${teamName} | Parabol`} />
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
          </MeetingAreaHeader><ErrorBoundary>
            <Switch>
              <Route
                path={`/${meetingSlug}/:teamId/${phaseTypeToSlug[CHECKIN]}/:localPhaseItem`}
                render={() => <NewMeetingCheckIn gotoNext={this.gotoNext} meetingType={meetingType} team={team} />}
              />
              <Route
                path={`/${meetingSlug}/:teamId`}
                render={() => <NewMeetingLobby meetingType={meetingType} team={team} />}
              />
            </Switch>
          </ErrorBoundary>
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
          phases {
            phaseType
            stages {
              id
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
