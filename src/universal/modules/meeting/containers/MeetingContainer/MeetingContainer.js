import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import raven from 'raven-js';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import handleAgendaSort from 'universal/modules/meeting/helpers/handleAgendaSort';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingAvatars from 'universal/modules/meeting/components/MeetingAvatars/MeetingAvatars';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';
import {withRouter} from 'react-router';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingCheckin from 'universal/modules/meeting/components/MeetingCheckin/MeetingCheckin';
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton';
import MeetingUpdatesContainer
  from '../MeetingUpdates/MeetingUpdatesContainer';
import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import {
  LOBBY,
  CHECKIN,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
  phaseArray,
  SORT_STEP
} from 'universal/utils/constants';
import MeetingAgendaItems from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import MeetingAgendaFirstCall from 'universal/modules/meeting/components/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
import MeetingAgendaLastCallContainer from 'universal/modules/meeting/containers/MeetingAgendaLastCall/MeetingAgendaLastCallContainer';
import isLastItemOfPhase from 'universal/modules/meeting/helpers/isLastItemOfPhase';
import withHotkey from 'react-hotkey-hoc';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import resolveMeetingMembers from 'universal/modules/meeting/helpers/resolveMeetingMembers';
import electFacilitatorIfNone from 'universal/modules/meeting/helpers/electFacilitatorIfNone';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import generateMeetingRoute from 'universal/modules/meeting/helpers/generateMeetingRoute';

const meetingContainerQuery = `
query{
  team @live {
    checkInGreeting,
    checkInQuestion,
    id,
    name,
    meetingId,
    activeFacilitator,
    facilitatorPhase,
    facilitatorPhaseItem,
    meetingPhase,
    meetingPhaseItem
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
    projects(teamMemberId: $teamMemberId) @live {
      id
    }
  }
  agendaCount(teamId: $teamId)
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    sortOrder
    teamMemberId
    actionsByAgenda @live {
      id
    }
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

const mapStateToProps = (state, props) => {
  const {params: {localPhaseItem, teamId}} = props;
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
    members: resolveMeetingMembers(queryResult.data, userId),
    team,
    teamMemberCount
  };
};

let infiniteloopCounter = 0;
let infiniteLoopTimer = Date.now();
let infiniteTrigger = false;

@socketWithPresence
@connect(mapStateToProps)
@dragDropContext(HTML5Backend)
@withRouter
@withHotkey
export default class MeetingContainer extends Component {
  static propTypes = {
    agenda: PropTypes.array.isRequired,
    agendaCount: PropTypes.number,
    bindHotkey: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    isFacilitating: PropTypes.bool,
    localPhaseItem: PropTypes.number,
    members: PropTypes.array,
    params: PropTypes.shape({
      localPhase: PropTypes.string,
      teamId: PropTypes.string.isRequired
    }).isRequired,
    router: PropTypes.object,
    team: PropTypes.object.isRequired,
    teamMemberCount: PropTypes.number
  };

  constructor(props) {
    super(props);
    const {bindHotkey, params: {teamId}} = props;
    handleRedirects({}, this.props);
    bindHotkey(['enter', 'right'], this.gotoNext);
    bindHotkey('left', this.gotoPrev);
    bindHotkey('i c a n t h a c k i t', () => cashay.mutate('killMeeting', {variables: {teamId}}));
  }

  componentDidMount() {
    const {agendaCount, params: {teamId}} = this.props;
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
  }

  shouldComponentUpdate(nextProps) {
    const safeRoute = handleRedirects(this.props, nextProps);
    if (safeRoute) {
      return true;
    }
    const {dispatch, isFacilitating, team: {id: teamId}} = this.props;
    // if we call router.push
    if (safeRoute === false && Date.now() - infiniteLoopTimer < 1000) {
      if (++infiniteloopCounter >= 100) {
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
          'MeetingContainer::shouldComponentUpdate(): infiniteLoop watchdog triggered',
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
      params: {localPhase, teamId},
      router,
      team
    } = this.props;
    const {meetingPhase} = team;
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    const safeRoute = generateMeetingRoute(maybeNextPhaseItem, maybeNextPhase || localPhase, this.props);
    if (!safeRoute) return;
    const {nextPhase, nextPhaseItem} = safeRoute;
    const nextPhaseInfo = actionMeeting[nextPhase];

    if (nextPhaseInfo.index <= meetingPhaseInfo.index) {
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      router.push(pushURL);
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
    const {params: {localPhase}, localPhaseItem} = this.props;
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

  render() {
    const {
      agenda,
      isFacilitating,
      localPhaseItem,
      members,
      params: {teamId, localPhase},
      team,
      router
    } = this.props;
    const {
      facilitatorPhase,
      facilitatorPhaseItem,
      meetingPhase,
      meetingPhaseItem,
      name: teamName
    } = team;
    const agendaPhaseItem = meetingPhase === AGENDA_ITEMS ? meetingPhaseItem : undefined;
    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName ||
      members.length === 0
      || ((localPhase === CHECKIN || localPhase === UPDATES) && members.length < localPhaseItem)) {
      return <LoadingView />;
    }
    const phasesAlwaysInSync = ['lobby', 'firstcall', 'lastcall'];
    const inSync = isFacilitating || phasesAlwaysInSync.includes(meetingPhase) ? true :
      localPhase + localPhaseItem === facilitatorPhase + facilitatorPhaseItem;
    const rejoinFacilitator = () => {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.push(pushURL);
    };

    const isBehindMeeting = phaseArray.indexOf(localPhase) < phaseArray.indexOf(meetingPhase);
    const hideMoveMeetingControls = isFacilitating ? false :
      (!isBehindMeeting && isLastItemOfPhase(localPhase, localPhaseItem, members, agenda));

    const phaseStateProps = { // DRY
      localPhaseItem,
      onFacilitatorPhase: facilitatorPhase === localPhase,
      members,
      team
    };
    const gotoAgendaItem = (idx) => async () => {
      if (isFacilitating && agendaPhaseItem !== undefined && idx > agendaPhaseItem) {
        // resort
        const desiredItem = agenda[idx];
        const nextItem = agenda[agendaPhaseItem];
        const prevItem = agenda[agendaPhaseItem - 1];
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
        this.gotoItem(meetingPhaseItem + 1, AGENDA_ITEMS);
      } else {
        this.gotoItem(idx + 1, AGENDA_ITEMS);
      }
    };

    return (
      <MeetingLayout title={`Action Meeting for ${teamName}`}>
        <Sidebar
          agendaPhaseItem={agendaPhaseItem}
          facilitatorPhase={facilitatorPhase}
          facilitatorPhaseItem={facilitatorPhaseItem}
          gotoItem={this.gotoItem}
          gotoAgendaItem={gotoAgendaItem}
          localPhase={localPhase}
          localPhaseItem={localPhaseItem}
          isFacilitating={isFacilitating}
          meetingPhase={meetingPhase}
          meetingPhaseItem={meetingPhaseItem}
          teamName={teamName}
          teamId={teamId}
        />
        <MeetingMain>
          <MeetingAvatars>
            <AvatarGroup avatars={members} localPhase={localPhase} />
          </MeetingAvatars>
          {localPhase === LOBBY && <MeetingLobby members={members} team={team} />}
          {localPhase === CHECKIN &&
            <MeetingCheckin
              gotoItem={this.gotoItem}
              gotoNext={this.gotoNext}
              hideMoveMeetingControls={hideMoveMeetingControls}
              {...phaseStateProps}
            />
          }
          {localPhase === UPDATES &&
            <MeetingUpdatesContainer
              gotoItem={this.gotoItem}
              gotoNext={this.gotoNext}
              hideMoveMeetingControls={hideMoveMeetingControls}
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
              members={members}
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
