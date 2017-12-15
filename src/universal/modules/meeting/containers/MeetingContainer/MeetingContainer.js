import PropTypes from 'prop-types';
import raven from 'raven-js';
import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {createFragmentContainer} from 'react-relay';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingAgendaFirstCall from 'universal/modules/meeting/components/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
import MeetingAgendaItems from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';
import MeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/MeetingAvatarGroup';
import MeetingCheckIn from 'universal/modules/meeting/components/MeetingCheckIn/MeetingCheckIn';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingMainHeader from 'universal/modules/meeting/components/MeetingMainHeader/MeetingMainHeader';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import MeetingUpdatesPrompt from 'universal/modules/meeting/components/MeetingUpdatesPrompt/MeetingUpdatesPrompt';
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import generateMeetingRoute from 'universal/modules/meeting/helpers/generateMeetingRoute';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import isLastItemOfPhase from 'universal/modules/meeting/helpers/isLastItemOfPhase';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import EndMeetingMutation from 'universal/mutations/EndMeetingMutation';
import KillMeetingMutation from 'universal/mutations/KillMeetingMutation';
import MoveMeetingMutation from 'universal/mutations/MoveMeetingMutation';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import UpdateAgendaItemMutation from 'universal/mutations/UpdateAgendaItemMutation';
import {
  AGENDA_ITEMS,
  CHECKIN,
  FIRST_CALL,
  LAST_CALL,
  LOBBY,
  phaseArray,
  SORT_STEP,
  UPDATES
} from 'universal/utils/constants';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const handleHotkey = (gotoFunc, submitting) => () => {
  if (!submitting && document.activeElement === document.body) gotoFunc();
};

let infiniteloopCounter = 0;
let infiniteLoopTimer = Date.now();
let infiniteTrigger = false;

class MeetingContainer extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    localPhase: PropTypes.string,
    localPhaseItem: PropTypes.number,
    match: PropTypes.shape({
      params: PropTypes.shape({
        localPhase: PropTypes.string,
        localPhaseItem: PropTypes.string,
        teamId: PropTypes.string.isRequired
      })
    }),
    myTeamMemberId: PropTypes.string.isRequired,
    history: PropTypes.object,
    viewer: PropTypes.shape({
      team: PropTypes.object.isRequired
    }).isRequired,
    teamId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    error: PropTypes.any,
    submitting: PropTypes.bool,
    submitMutation: PropTypes.func.isRequired,
    onCompleted: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {
      atmosphere,
      bindHotkey,
      history,
      teamId,
      submitting
    } = this.props;
    this.unsafeRoute = !handleRedirects({}, this.props);
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext, submitting));
    bindHotkey('left', handleHotkey(this.gotoPrev, submitting));
    bindHotkey('i c a n t h a c k i t', () => KillMeetingMutation(atmosphere, teamId, history));
    this.electionTimer = setInterval(() => {
      this.electFacilitatorIfNone();
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {team}, localPhase, localPhaseItem, myTeamMemberId} = nextProps;
    const {activeFacilitator, id: teamId, facilitatorPhase, facilitatorPhaseItem} = team;
    const {viewer: {team: oldTeam}} = this.props;
    const {activeFacilitator: oldFacilitator} = oldTeam;
    // if promoted to facilitator, ensure the facilitator is where you are
    // check activeFacilitator to make sure the meeting has started & we've got all the data
    const wasFacilitating = myTeamMemberId === oldFacilitator;
    const isFacilitating = myTeamMemberId === activeFacilitator;
    if (isFacilitating && !wasFacilitating) {
      const variables = {teamId};
      if (facilitatorPhase !== localPhase) {
        variables.nextPhase = localPhase;
      }
      if (localPhaseItem !== facilitatorPhaseItem) {
        variables.nextPhaseItem = localPhaseItem;
      }
      if (Object.keys(variables).length > 1) {
        const {atmosphere, history, onError, onCompleted, submitMutation} = nextProps;
        submitMutation();
        MoveMeetingMutation(atmosphere, variables, history, onError, onCompleted);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    this.unsafeRoute = !handleRedirects(this.props, nextProps);
    if (!this.unsafeRoute) {
      return true;
    }
    // if we call history.push
    if (this.unsafeRoute === false && Date.now() - infiniteLoopTimer < 1000) {
      if (++infiniteloopCounter >= 10) {
        const {dispatch, teamId, myTeamMemberId, viewer: {team: {activeFacilitator}}} = this.props;
        const isFacilitating = myTeamMemberId === activeFacilitator;
        // if we're changing locations 10 times in a second, it's probably infinite
        if (isFacilitating) {
          const variables = {
            teamId,
            nextPhase: CHECKIN,
            nextPhaseItem: 1,
            force: true
          };
          if (!infiniteTrigger) {
            const {atmosphere, history, onError, onCompleted, submitMutation} = nextProps;
            submitMutation();
            MoveMeetingMutation(atmosphere, variables, history, onError, onCompleted);
            infiniteTrigger = true;
          }
        }
        this.gotoItem(1, CHECKIN);
        dispatch(showError({
          title: 'Awh shoot',
          message: 'You found a glitch! We saved your work, but forgot where you were. We sent the bug to our team.'
        }));
        raven.captureMessage(
          'MeetingContainer::shouldComponentUpdate(): infiniteLoop watchdog triggered'
        );
      }
    } else {
      infiniteloopCounter = 0;
      infiniteLoopTimer = Date.now();
    }
    return false;
  }

  componentWillUnmount() {
    clearTimeout(this.electionTimer);
  }

  setAgendaInputRef = (c) => {
    this.agendaInputRef = c;
  };

  electFacilitatorIfNone() {
    const {atmosphere, viewer: {team: {activeFacilitator, teamMembers}}} = this.props;
    if (!activeFacilitator) return;

    const facilitator = teamMembers.find((m) => m.id === activeFacilitator);
    if (!facilitator.isConnected) {
      const onlineMembers = teamMembers.filter((m) => m.isConnected);
      const callingMember = onlineMembers[0];
      const nextFacilitator = onlineMembers.find((m) => m.isFacilitator) || callingMember;
      if (callingMember.isSelf) {
        PromoteFacilitatorMutation(atmosphere, {
          facilitatorId: nextFacilitator.id,
          disconnectedFacilitatorId: facilitator.id
        });
      }
    }
  }

  gotoItem = (maybeNextPhaseItem, maybeNextPhase) => {
    // if we try to go backwards on a place that doesn't have items
    if (!maybeNextPhaseItem && !maybeNextPhase) return;
    const {
      history,
      localPhase,
      myTeamMemberId,
      viewer: {team},
      teamId
    } = this.props;
    const {activeFacilitator, meetingPhase} = team;
    const isFacilitating = myTeamMemberId === activeFacilitator;
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    const safeRoute = generateMeetingRoute(maybeNextPhaseItem, maybeNextPhase || localPhase, this.props);
    if (!safeRoute) return;
    const {nextPhase, nextPhaseItem} = safeRoute;
    const nextPhaseInfo = actionMeeting[nextPhase];

    if (isFacilitating) {
      const {atmosphere, localPhaseItem, onError, onCompleted, submitMutation} = this.props;
      if (!nextPhaseInfo.next) {
        EndMeetingMutation(atmosphere, teamId, history, onError, onCompleted);
      } else if (nextPhase !== localPhase || nextPhaseItem !== localPhaseItem) {
        const variables = {teamId};
        if (nextPhase !== localPhase) {
          variables.nextPhase = nextPhase;
        }
        if (nextPhaseItem) {
          variables.nextPhaseItem = nextPhaseItem;
        }
        if (Object.keys(variables).length === 1) return;
        submitMutation();
        MoveMeetingMutation(atmosphere, variables, history, onError, onCompleted);
      }
    } else if (nextPhaseInfo.index <= meetingPhaseInfo.index) {
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      history.push(pushURL);
    }
  };

  gotoNext = () => {
    const {localPhase, localPhaseItem} = this.props;
    const nextPhaseInfo = actionMeeting[localPhase];
    if (nextPhaseInfo.items) {
      this.gotoItem(localPhaseItem + 1);
    } else {
      this.gotoItem(undefined, nextPhaseInfo.next);
    }
  };

  gotoPrev = () => {
    this.gotoItem(this.props.localPhaseItem - 1);
  };

  gotoAgendaItem = (idx) => async () => {
    const {atmosphere, viewer: {team: {activeFacilitator, agendaItems, facilitatorPhase}}, myTeamMemberId} = this.props;
    const isFacilitating = activeFacilitator === myTeamMemberId;
    const facilitatorPhaseInfo = actionMeeting[facilitatorPhase];
    const agendaPhaseInfo = actionMeeting[AGENDA_ITEMS];
    const firstIncompleteIdx = agendaItems.findIndex((a) => a.isComplete === false);
    const nextItemIdx = firstIncompleteIdx + (facilitatorPhase === AGENDA_ITEMS ? 1 : 0);
    const shouldResort = facilitatorPhaseInfo.index >= agendaPhaseInfo.index && idx > nextItemIdx && firstIncompleteIdx > -1;
    if (isFacilitating && shouldResort) {
      // resort
      const desiredItem = agendaItems[idx];
      const nextItem = agendaItems[nextItemIdx];
      const prevItem = agendaItems[nextItemIdx - 1];
      const updatedAgendaItem = {
        id: desiredItem.id,
        sortOrder: prevItem ? (prevItem.sortOrder + nextItem.sortOrder) / 2 : nextItem.sortOrder - SORT_STEP
      };
      const onCompleted = () => {
        this.gotoItem(nextItemIdx + 1, AGENDA_ITEMS);
      };
      UpdateAgendaItemMutation(atmosphere, updatedAgendaItem, undefined, onCompleted);
    } else {
      this.gotoItem(idx + 1, AGENDA_ITEMS);
    }
  };

  rejoinFacilitator = () => {
    const {history, teamId, viewer: {team: {facilitatorPhase, facilitatorPhaseItem}}} = this.props;
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    history.push(pushURL);
  };

  render() {
    if (this.unsafeRoute) return <div />;

    const {
      localPhase,
      localPhaseItem,
      myTeamMemberId,
      viewer
    } = this.props;
    const {team} = viewer;
    const {
      activeFacilitator,
      agendaItems,
      facilitatorPhase,
      facilitatorPhaseItem,
      meetingPhase,
      teamName,
      teamMembers
    } = team;
    const isFacilitating = activeFacilitator === myTeamMemberId;

    const inSync = isFacilitating || facilitatorPhase === localPhase &&
      // FIXME remove || when changing to relay. right now it's a null & an undefined
      (facilitatorPhaseItem === localPhaseItem || !facilitatorPhaseItem && !localPhaseItem);

    const isBehindMeeting = phaseArray.indexOf(localPhase) < phaseArray.indexOf(meetingPhase);
    const isLastPhaseItem = isLastItemOfPhase(localPhase, localPhaseItem, teamMembers, agendaItems);
    const hideMoveMeetingControls = isFacilitating ? false : (!isBehindMeeting && isLastPhaseItem);
    const showMoveMeetingControls = isFacilitating || isBehindMeeting;
    const facilitatorName = getFacilitatorName(activeFacilitator, teamMembers);

    return (
      <MeetingLayout title={`Action Meeting for ${teamName} | Parabol`}>
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
              team={team}
            />
            }
          </MeetingMainHeader>
          {localPhase === LOBBY && <MeetingLobby team={team} />}
          {localPhase === CHECKIN &&
          <MeetingCheckIn
            facilitatorName={facilitatorName}
            gotoItem={this.gotoItem}
            gotoNext={this.gotoNext}
            isFacilitating={isFacilitating}
            localPhaseItem={localPhaseItem}
            showMoveMeetingControls={showMoveMeetingControls}
            team={team}
          />
          }
          {localPhase === UPDATES &&
          <MeetingUpdates
            facilitatorName={facilitatorName}
            gotoItem={this.gotoItem}
            gotoNext={this.gotoNext}
            localPhaseItem={localPhaseItem}
            showMoveMeetingControls={showMoveMeetingControls}
            viewer={viewer}
          />
          }
          {localPhase === FIRST_CALL &&
          <MeetingAgendaFirstCall
            facilitatorName={facilitatorName}
            gotoNext={this.gotoNext}
            hideMoveMeetingControls={hideMoveMeetingControls}
          />
          }
          {localPhase === AGENDA_ITEMS &&
          <MeetingAgendaItems
            facilitatorName={facilitatorName}
            gotoNext={this.gotoNext}
            hideMoveMeetingControls={hideMoveMeetingControls}
            localPhaseItem={localPhaseItem}
            viewer={viewer}
          />
          }
          {localPhase === LAST_CALL &&
          <MeetingAgendaLastCall
            facilitatorName={facilitatorName}
            gotoNext={this.gotoNext}
            hideMoveMeetingControls={hideMoveMeetingControls}
            team={team}
          />
          }
          {!inSync &&
          <RejoinFacilitatorButton onClickHandler={this.rejoinFacilitator} />
          }
        </MeetingMain>
      </MeetingLayout>
    );
  }
}

export default createFragmentContainer(
  socketWithPresence(
    dragDropContext(HTML5Backend)(
      withHotkey(
        withAtmosphere(
          withMutationProps(
            MeetingContainer
          )
        )
      )
    )
  ),
  graphql`
    fragment MeetingContainer_viewer on User {
      team(teamId: $teamId) {
        agendaItems {
          id
          isComplete
        }
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        id
        teamName: name
        meetingId
        activeFacilitator
        facilitatorPhase
        facilitatorPhaseItem
        meetingPhase
        meetingPhaseItem
        tier
        teamMembers(sortBy: "checkInOrder") {
          id
          preferredName
          picture
          checkInOrder
          isCheckedIn
          isFacilitator
          isLead
          isSelf
          userId
        }
        ...MeetingAgendaLastCall_team
        ...MeetingLobby_team
        ...MeetingAvatarGroup_team
        ...MeetingUpdatesPrompt_team
        ...MeetingCheckIn_team
        ...Sidebar_team
      }
      ...MeetingUpdates_viewer
      ...MeetingAgendaItems_viewer
    }
  `
);
