import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import raven from 'raven-js';
import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import withHotkey from 'react-hotkey-hoc';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
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
  team @live {
    checkInGreeting {
      content,
      language
    },
    checkInQuestion,
    id,
    name,
    meetingId,
    activeFacilitator,
    facilitatorPhase,
    facilitatorPhaseItem,
    meetingPhase,
    meetingPhaseItem,
    tier
  }
  teamMemberCount(teamId: $teamId)
  teamMembers(teamId: $teamId) @live {
    id
    preferredName
    picture
    checkInOrder
    isCheckedIn
    isFacilitator,
    isLead,
    presence(teamId: $teamId) @live {
      id
      userId
    },
  }
  agendaCount(teamId: $teamId)
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    sortOrder
    teamMemberId
  }
}`;

const perMeetingQueries = `
query{
  teamMemberCount(teamId: $teamId)
  agendaCount(teamId: $teamId)
}`;

const mutationHandlers = {
  updateAgendaItem: handleAgendaSort
};

const handleHotkey = (gotoFunc) => () => {
  if (document.activeElement === document.body) gotoFunc();
};

const mapStateToProps = (state, props) => {
  const {match: {params: {localPhase, localPhaseItem, teamId}}} = props;
  const {sub: userId} = state.auth.obj;
  const queryResult = cashay.query(meetingContainerQuery, {
    op: 'meetingContainerQuery',
    key: teamId,
    mutationHandlers,
    variables: {teamId},
    sort: {
      agenda: (a, b) => a.sortOrder - b.sortOrder,
      teamMembers: (a, b) => a.checkInOrder - b.checkInOrder
    },
    resolveChannelKey: {
      team: () => teamId,
      presence: () => teamId
    }
  });
  const {agenda, agendaCount, team, teamMemberCount} = queryResult.data;
  const myTeamMemberId = `${userId}::${teamId}`;
  return {
    agenda,
    agendaCount,
    isFacilitating: myTeamMemberId === team.activeFacilitator,
    localPhaseItem: localPhaseItem && Number(localPhaseItem),
    localPhase,
    members: resolveMeetingMembers(queryResult.data, userId),
    team,
    teamId,
    teamMemberCount
  };
};

let infiniteloopCounter = 0;
let infiniteLoopTimer = Date.now();
let infiniteTrigger = false;

@socketWithPresence
@connect(mapStateToProps)
@dragDropContext(HTML5Backend)
@withHotkey
@withAtmosphere
export default class MeetingContainer extends Component {
  static propTypes = {
    agenda: PropTypes.array.isRequired,
    agendaCount: PropTypes.number,
    bindHotkey: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    isFacilitating: PropTypes.bool,
    localPhase: PropTypes.string,
    localPhaseItem: PropTypes.number,
    members: PropTypes.array,
    match: PropTypes.shape({
      params: PropTypes.shape({
        localPhase: PropTypes.string,
        localPhaseItem: PropTypes.string,
        teamId: PropTypes.string.isRequired
      })
    }),
    history: PropTypes.object,
    team: PropTypes.object.isRequired,
    teamId: PropTypes.string.isRequired,
    teamMemberCount: PropTypes.number
  };

  componentWillMount() {
    const {bindHotkey, teamId} = this.props;
    handleRedirects({}, this.props);
    bindHotkey(['enter', 'right'], handleHotkey(this.gotoNext));
    bindHotkey('left', handleHotkey(this.gotoPrev));
    bindHotkey('i c a n t h a c k i t', () => cashay.mutate('killMeeting', {variables: {teamId}}));
  }

  componentDidMount() {
    const {agendaCount, teamId} = this.props;
    // if we have stale count data (from a previous meeting) freshen it up!
    if (agendaCount !== null) {
      cashay.query(perMeetingQueries, {
        op: 'meetingContainerMountQuery',
        key: teamId,
        mutationHandlers,
        variables: {teamId},
        forceFetch: true
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    electFacilitatorIfNone(nextProps, this.props.members);
    // if promoted to facilitator, ensure the facilitator is where you are
    const {isFacilitating, team: {id: teamId, facilitatorPhase, facilitatorPhaseItem}, localPhase, localPhaseItem} = nextProps;
    // check activeFacilitator to make sure the meeting has started & we've got all the data
    if (this.props.team.activeFacilitator && !this.props.isFacilitating && isFacilitating) {
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
    const {dispatch, isFacilitating, team: {id: teamId}} = this.props;
    // if we call history.push
    if (safeRoute === false && Date.now() - infiniteLoopTimer < 1000) {
      if (++infiniteloopCounter >= 10) {
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

  gotoItem = (maybeNextPhaseItem, maybeNextPhase) => {
    // if we try to go backwards on a place that doesn't have items
    if (!maybeNextPhaseItem && !maybeNextPhase) return;
    const {
      isFacilitating,
      history,
      localPhase,
      team,
      teamId
    } = this.props;
    const {meetingPhase} = team;
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
    const {agenda, team: {id: teamId, facilitatorPhase}, isFacilitating} = this.props;
    const facilitatorPhaseInfo = actionMeeting[facilitatorPhase];
    const agendaPhaseInfo = actionMeeting[AGENDA_ITEMS];
    const firstIncompleteIdx = agenda.findIndex((a) => a.isComplete === false);
    const nextItemIdx = firstIncompleteIdx + (facilitatorPhase === AGENDA_ITEMS ? 1 : 0);
    const shouldResort = facilitatorPhaseInfo.index >= agendaPhaseInfo.index && idx > nextItemIdx && firstIncompleteIdx > -1;
    if (isFacilitating && shouldResort) {
      // resort
      const desiredItem = agenda[idx];
      const nextItem = agenda[nextItemIdx];
      const prevItem = agenda[nextItemIdx - 1];
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

  render() {
    const {
      agenda,
      isFacilitating,
      localPhase,
      localPhaseItem,
      members,
      team,
      teamId,
      history
    } = this.props;
    const {
      facilitatorPhase,
      facilitatorPhaseItem,
      meetingPhase,
      meetingPhaseItem,
      name: teamName
    } = team;

    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName ||
      members.length === 0
      || ((localPhase === CHECKIN || localPhase === UPDATES) && members.length < localPhaseItem)) {
      return <LoadingView />;
    }

    const inSync = isFacilitating || facilitatorPhase === localPhase &&
      // FIXME remove || when changing to relay. right now it's a null & an undefined
      (facilitatorPhaseItem === localPhaseItem || !facilitatorPhaseItem && !localPhaseItem);
    const agendaPhaseItem = actionMeeting[meetingPhase].index >= actionMeeting[AGENDA_ITEMS].index ?
      agenda.findIndex((a) => a.isComplete === false) + 1 : 0;
    const rejoinFacilitator = () => {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      history.push(pushURL);
    };

    const isBehindMeeting = phaseArray.indexOf(localPhase) < phaseArray.indexOf(meetingPhase);
    const isLastPhaseItem = isLastItemOfPhase(localPhase, localPhaseItem, members, agenda);
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
            agendaItem={agenda[localPhaseItem - 1]}
            isLast={localPhaseItem === agenda.length}
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
          <RejoinFacilitatorButton onClickHandler={rejoinFacilitator} />
          }
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
