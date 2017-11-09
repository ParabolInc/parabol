import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import raven from 'raven-js';
import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingAgendaFirstCall from 'universal/modules/meeting/components/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
import MeetingAgendaItems from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import MeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/MeetingAvatarGroup';
import MeetingCheckIn from 'universal/modules/meeting/components/MeetingCheckIn/MeetingCheckIn';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingMainHeader from 'universal/modules/meeting/components/MeetingMainHeader/MeetingMainHeader';
import MeetingUpdatesPrompt from 'universal/modules/meeting/components/MeetingUpdatesPrompt/MeetingUpdatesPrompt';
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';
import MeetingAgendaLastCallContainer from 'universal/modules/meeting/containers/MeetingAgendaLastCall/MeetingAgendaLastCallContainer';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import electFacilitatorIfNone from 'universal/modules/meeting/helpers/electFacilitatorIfNone';
import generateMeetingRoute from 'universal/modules/meeting/helpers/generateMeetingRoute';
import handleAgendaSort from 'universal/modules/meeting/helpers/handleAgendaSort';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import isLastItemOfPhase from 'universal/modules/meeting/helpers/isLastItemOfPhase';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import resolveMeetingMembers from 'universal/modules/meeting/helpers/resolveMeetingMembers';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
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
import MeetingUpdatesContainer from '../MeetingUpdates/MeetingUpdatesContainer';

const meetingContainerQuery = `
query{
  teamMembers(teamId: $teamId) @live {
    id
    presence(teamId: $teamId) @live {
      id
      userId
    }
  }
}`;

const mutationHandlers = {
  updateAgendaItem: handleAgendaSort
};

const handleHotkey = (gotoFunc) => () => {
  if (document.activeElement === document.body) gotoFunc();
};

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const queryResult = cashay.query(meetingContainerQuery, {
    op: 'meetingContainerQuery',
    key: teamId,
    mutationHandlers,
    variables: {teamId},
    resolveChannelKey: {
      presence: () => teamId
    }
  });
  return {
    teamMemberPresence: queryResult.data.teamMembers
  };
};

let infiniteloopCounter = 0;
let infiniteLoopTimer = Date.now();
let infiniteTrigger = false;

class MeetingContainer extends Component {
  static propTypes = {
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
    teamMemberPresence: PropTypes.array,
    userId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      members: []
    };
  }

  componentWillMount() {
    const {bindHotkey, teamId, viewer: {team: {teamMembers, activeFacilitator}}, teamMemberPresence, userId} = this.props;
    this.setState({
      members: resolveMeetingMembers(teamMembers, teamMemberPresence, userId, activeFacilitator)
    });
    handleRedirects({}, this.props);
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext));
    bindHotkey('left', handleHotkey(this.gotoPrev));
    bindHotkey('i c a n t h a c k i t', () => cashay.mutate('killMeeting', {variables: {teamId}}));
    this.electionTimer = setTimeout(() => {
      electFacilitatorIfNone(this.props, this.state.members, [], true);
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {team}, localPhase, localPhaseItem, teamMemberPresence, userId, myTeamMemberId} = nextProps;
    const {activeFacilitator, id: teamId, facilitatorPhase, facilitatorPhaseItem, teamMembers} = team;
    const {viewer: {team: oldTeam}, teamMemberPresence: oldPresence} = this.props;
    const {teamMembers: oldTeamMembers, activeFacilitator: oldFacilitator} = oldTeam;
    const {members: oldMembers} = this.state;

    if (teamMemberPresence !== oldPresence || teamMembers !== oldTeamMembers || activeFacilitator !== oldFacilitator) {
      const members = resolveMeetingMembers(teamMembers, teamMemberPresence, userId, activeFacilitator);
      electFacilitatorIfNone(nextProps, members, oldMembers);
      this.setState({
        members
      });
    }
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
        cashay.mutate('moveMeeting', {variables});
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    const safeRoute = handleRedirects(this.props, nextProps);
    if (safeRoute) {
      return true;
    }
    // if we call history.push
    if (safeRoute === false && Date.now() - infiniteLoopTimer < 1000) {
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
            cashay.mutate('moveMeeting', {variables});
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

    if (nextPhaseInfo.index <= meetingPhaseInfo.index) {
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      history.push(pushURL);
    }

    if (isFacilitating) {
      const variables = {teamId};
      if (!nextPhaseInfo.next) {
        cashay.mutate('endMeeting', {variables: {teamId}});
      } else {
        if (nextPhase !== localPhase) {
          variables.nextPhase = nextPhase;
        }
        if (nextPhaseItem) {
          variables.nextPhaseItem = nextPhaseItem;
        }
        cashay.mutate('moveMeeting', {variables});
      }
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
    const {teamId, viewer: {team: {activeFacilitator, agendaItems, facilitatorPhase}}, myTeamMemberId} = this.props;
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
      const options = {
        ops: {
          agendaListAndInputContainer: teamId
        },
        variables: {
          updatedAgendaItem: {
            id: desiredItem.id,
            sortOrder: prevItem ? (prevItem.sortOrder + nextItem.sortOrder) / 2 : nextItem.sortOrder - SORT_STEP
          }
        }
      };
      await cashay.mutate('updateAgendaItem', options);
      this.gotoItem(nextItemIdx + 1, AGENDA_ITEMS);
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
    const {
      localPhase,
      localPhaseItem,
      myTeamMemberId,
      teamId,
      viewer: {team}
    } = this.props;
    const {members} = this.state;
    const {
      activeFacilitator,
      agendaItems,
      facilitatorPhase,
      facilitatorPhaseItem,
      meetingPhase,
      meetingPhaseItem,
      name: teamName
    } = team;
    const isFacilitating = activeFacilitator === myTeamMemberId;

    const inSync = isFacilitating || facilitatorPhase === localPhase &&
      // FIXME remove || when changing to relay. right now it's a null & an undefined
      (facilitatorPhaseItem === localPhaseItem || !facilitatorPhaseItem && !localPhaseItem);
    const agendaPhaseItem = actionMeeting[meetingPhase].index >= actionMeeting[AGENDA_ITEMS].index ?
      agendaItems.findIndex((a) => a.isComplete === false) + 1 : 0;

    const isBehindMeeting = phaseArray.indexOf(localPhase) < phaseArray.indexOf(meetingPhase);
    const isLastPhaseItem = isLastItemOfPhase(localPhase, localPhaseItem, members, agendaItems);
    const hideMoveMeetingControls = isFacilitating ? false : (!isBehindMeeting && isLastPhaseItem);
    const showMoveMeetingControls = isFacilitating || isBehindMeeting;

    const phaseStateProps = { // DRY
      facilitatorPhaseItem,
      localPhaseItem,
      members,
      onFacilitatorPhase: facilitatorPhase === localPhase,
      team
    };
    return (
      <MeetingLayout title={`Action Meeting for ${teamName} | Parabol`}>
        <Sidebar
          agendaPhaseItem={agendaPhaseItem}
          facilitatorPhase={facilitatorPhase}
          facilitatorPhaseItem={facilitatorPhaseItem}
          gotoItem={this.gotoItem}
          gotoAgendaItem={this.gotoAgendaItem}
          localPhase={localPhase}
          localPhaseItem={localPhaseItem}
          isFacilitating={isFacilitating}
          meetingPhase={meetingPhase}
          meetingPhaseItem={meetingPhaseItem}
          teamName={teamName}
          teamId={teamId}
        />
        <MeetingMain hasBoxShadow>
          <MeetingMainHeader>
            <MeetingAvatarGroup
              avatars={members}
              gotoItem={this.gotoItem}
              gotoNext={this.gotoNext}
              isFacilitating={isFacilitating}
              localPhase={localPhase}
              {...phaseStateProps}
            />
            {localPhase === UPDATES &&
            <MeetingUpdatesPrompt
              gotoNext={this.gotoNext}
              localPhaseItem={localPhaseItem}
              members={members}
            />
            }
          </MeetingMainHeader>
          {localPhase === LOBBY && <MeetingLobby members={members} team={team} />}
          {localPhase === CHECKIN &&
          <MeetingCheckIn
            gotoItem={this.gotoItem}
            gotoNext={this.gotoNext}
            showMoveMeetingControls={showMoveMeetingControls}
            {...phaseStateProps}
          />
          }
          {localPhase === UPDATES &&
          <MeetingUpdatesContainer
            gotoItem={this.gotoItem}
            gotoNext={this.gotoNext}
            showMoveMeetingControls={showMoveMeetingControls}
            {...phaseStateProps}
          />
          }
          {localPhase === FIRST_CALL &&
          <MeetingAgendaFirstCall
            {...phaseStateProps}
            gotoNext={this.gotoNext}
            hideMoveMeetingControls={hideMoveMeetingControls}
          />
          }
          {localPhase === AGENDA_ITEMS &&
          <MeetingAgendaItems
            agendaItem={agendaItems[localPhaseItem - 1]}
            isLast={localPhaseItem === agendaItems.length}
            gotoNext={this.gotoNext}
            localPhaseItem={localPhaseItem}
            members={members}
            team={team}
            hideMoveMeetingControls={hideMoveMeetingControls}
          />
          }
          {localPhase === LAST_CALL &&
          <MeetingAgendaLastCallContainer
            {...phaseStateProps}
            gotoNext={this.gotoNext}
            hideMoveMeetingControls={hideMoveMeetingControls}
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
    connect(mapStateToProps)(
      dragDropContext(HTML5Backend)(
        withHotkey(
          withAtmosphere(
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
          content
          isComplete
          sortOrder
          teamMemberId
          teamMember {
            id
            preferredName
            picture
          }
        }
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        id
        name
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
          userId

        }
      }
    }
  `
);
