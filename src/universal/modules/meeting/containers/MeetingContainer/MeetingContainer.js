import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
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
  phaseArray,
  phaseOrder,
  LOBBY,
  CHECKIN,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
  SUMMARY
} from 'universal/utils/constants';
import MeetingAgendaItems from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import MeetingAgendaFirstCall from 'universal/modules/meeting/components/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
import MeetingAgendaLastCallContainer from 'universal/modules/meeting/containers/MeetingAgendaLastCall/MeetingAgendaLastCallContainer';
import hasPhaseItem from 'universal/modules/meeting/helpers/hasPhaseItem';
import withHotkey from 'react-hotkey-hoc';
import getBestPhaseItem from 'universal/modules/meeting/helpers/getBestPhaseItem';
import {showError, showInfo} from 'universal/modules/toast/ducks/toastDuck';

const resolveMeetingMembers = (queryData, userId) => {
  if (queryData !== resolveMeetingMembers.queryData) {
    resolveMeetingMembers.queryData = queryData;
    const {teamMembers, team} = queryData;
    resolveMeetingMembers.cache = [];
    for (let i = 0; i < teamMembers.length; i++) {
      const teamMember = teamMembers[i];
      resolveMeetingMembers.cache[i] = {
        ...teamMember,
        isConnected: teamMember.presence.length > 0,
        isFacilitating: team.activeFacilitator === teamMember.id,
        isSelf: teamMember.id.startsWith(userId)
      };
    }
  }
  return resolveMeetingMembers.cache;
};

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
  teamMembers(teamId: $teamId) @live {
    id
    preferredName
    picture
    checkInOrder
    isCheckedIn
    isFacilitator,
    isLead,
    presence @cached(type: "[Presence]") {
      userId
    },
    projects(teamMemberId: $teamMemberId) @live {
      id
    }
  }
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
    resolveCached: {presence: (source) => (doc) => source.id.startsWith(doc.userId)},
    resolveChannelKey: {
      team: () => teamId
    }
  });
  const {agenda, team} = queryResult.data;
  const myTeamMemberId = `${userId}::${teamId}`;
  return {
    agenda,
    isFacilitating: myTeamMemberId === team.activeFacilitator,
    localPhaseItem: localPhaseItem && Number(localPhaseItem),
    members: resolveMeetingMembers(queryResult.data, userId),
    team
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
  };

  constructor(props) {
    super(props);
    const {bindHotkey, params: {teamId}} = props;
    // subscribe to all teams, but don't do anything with that open subscription
    handleRedirects({}, this.props);
    bindHotkey(['enter', 'right'], this.gotoNext);
    bindHotkey('left', this.gotoPrev);
    bindHotkey('i c a n t h a c k i t', () => cashay.mutate('killMeeting', {variables: {teamId}}));
  }

  componentWillReceiveProps(nextProps) {
    // make sure we still have a facilitator. if we don't elect a new one
    const {dispatch, team: {activeFacilitator}, members} = nextProps;
    if (!activeFacilitator) return;
    // if the meeting has started, find the facilitator
    const facilitatingMemberIdx = members.findIndex((m) => m.isFacilitating);
    const facilitatingMember = members[facilitatingMemberIdx];
    if (!facilitatingMember || facilitatingMember.isConnected === true) return;
    // check the old value because it's possible that we're trying before the message from the Presence sub comes in
    const {members: oldMembers} = this.props;
    const oldFacilitatingMember = oldMembers[facilitatingMemberIdx];
    if (!oldFacilitatingMember || oldFacilitatingMember.isConnected === false) return;
    // if the facilitator isn't connected, then make the first connected user elect a new one
    const onlineMembers = members.filter((m) => m.isConnected);
    const callingMember = onlineMembers[0];
    const nextFacilitator = members.find((m) => m.isFacilitator && m.isConnected) || callingMember;
    if (callingMember.isSelf) {
      const options = {variables: {facilitatorId: nextFacilitator.id}};
      cashay.mutate('changeFacilitator', options);
    }
    const facilitatorIntro = nextFacilitator.isSelf ? 'You are' : `${nextFacilitator} is`;
    dispatch(showInfo({
      title: `${facilitatingMember.preferredName} Disconnected!`,
      message: `${facilitatorIntro} the new facilitator`
    }));
  }

  shouldComponentUpdate(nextProps) {
    const safeRoute = handleRedirects(this.props, nextProps);
    if (safeRoute) {
      return true;
    }
    const {dispatch, isFacilitating, team: {id: teamId}} = this.props;
    // if we call router.push
    if (Date.now() - infiniteLoopTimer < 1000) {
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
          return false;
        }
        this.gotoItem(1, CHECKIN);
        dispatch(showError({
          title: 'Awh shoot',
          message: 'You found a glitch! We saved your work, but forgot where you were. We sent the bug to our team.'
        }));
        // TODO send to server
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
      agenda,
      isFacilitating,
      members,
      params: {localPhase, teamId},
      router,
      team
    } = this.props;
    const {meetingPhase} = team;
    let nextPhase;
    let nextPhaseItem;
    // if it's a link on the sidebar
    if (maybeNextPhase) {
      // if we click the Agenda link on the sidebar and we're already past that, goto the next reasonable area
      if (maybeNextPhase === FIRST_CALL && phaseOrder(meetingPhase) > phaseOrder(FIRST_CALL)) {
        nextPhase = agenda.length ? AGENDA_ITEMS : LAST_CALL;
      } else {
        const maxPhaseOrder = isFacilitating ? phaseOrder(meetingPhase) + 1 : phaseOrder(meetingPhase);
        if (phaseOrder(maybeNextPhase) > maxPhaseOrder) return;
        nextPhase = maybeNextPhase;
      }
      // if we're going to an area that has items, try going to the facilitator item, or the meeting item, or just 1
      if (hasPhaseItem(nextPhase)) {
        nextPhaseItem = maybeNextPhaseItem || getBestPhaseItem(nextPhase, team);
      }
    } else {
      const localPhaseOrder = phaseOrder(localPhase);
      if (hasPhaseItem(localPhase)) {
        const totalPhaseItems = localPhase === AGENDA_ITEMS ? agenda.length : members.length;
        nextPhase = maybeNextPhaseItem > totalPhaseItems ? phaseArray[localPhaseOrder + 1] : localPhase;
      } else {
        nextPhase = phaseArray[localPhaseOrder + 1];
      }

      // Never return to the FIRST_CALL after it's been visited
      if (nextPhase === FIRST_CALL && phaseOrder(meetingPhase) > phaseOrder(FIRST_CALL)) {
        nextPhase = agenda.length ? AGENDA_ITEMS : LAST_CALL;
      }
      if (nextPhase === localPhase) {
        nextPhaseItem = Math.max(1, maybeNextPhaseItem);
      } else {
        nextPhaseItem = hasPhaseItem(nextPhase) ? 1 : '';
      }
    }

    if (nextPhase === AGENDA_ITEMS && agenda.length === 0) {
      nextPhaseItem = undefined;
      nextPhase = LAST_CALL;
    }
    // nextPhase is undefined if we're at the summary
    if (nextPhase) {
      if (isFacilitating) {
        const variables = {teamId};
        if (nextPhase === SUMMARY) {
          cashay.mutate('endMeeting', {variables: {teamId}});
          return;
        }
        if (nextPhase !== localPhase) {
          variables.nextPhase = nextPhase;
        }
        if (nextPhaseItem !== '') {
          variables.nextPhaseItem = nextPhaseItem;
        }
        cashay.mutate('moveMeeting', {variables});
      }
      if (phaseOrder(nextPhase) <= phaseOrder(meetingPhase)) {
        const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
        router.push(pushURL);
      }
    }
  };

  gotoNext = () => {
    const nextPhaseItem = this.props.localPhaseItem + 1;
    const nextPhase = nextPhaseItem ? undefined : phaseArray[phaseOrder(this.props.params.localPhase) + 1];
    return this.gotoItem(nextPhaseItem, nextPhase);
  }
  gotoPrev = () => this.gotoItem(this.props.localPhaseItem - 1);

  render() {
    const {
      agenda,
      isFacilitating,
      members,
      params: { teamId, localPhase, localPhaseItem },
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
    const agendaPhaseItem = meetingPhase === AGENDA_ITEMS && meetingPhaseItem || 0;
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
    const phaseStateProps = { // DRY
      localPhaseItem,
      members,
      team
    };
    return (
      <MeetingLayout title={`Action Meeting for ${teamName}`}>
        <Sidebar
          agendaPhaseItem={agendaPhaseItem}
          facilitatorPhase={facilitatorPhase}
          gotoItem={this.gotoItem}
          localPhase={localPhase}
          isFacilitating={isFacilitating}
          meetingPhase={meetingPhase}
          teamName={teamName}
          teamId={teamId}
        />
        <MeetingMain>
          <MeetingAvatars>
            <AvatarGroup avatars={members} localPhase={localPhase} />
          </MeetingAvatars>
          {localPhase === LOBBY && <MeetingLobby members={members} team={team}/>}
          {localPhase === CHECKIN &&
            <MeetingCheckin gotoItem={this.gotoItem} gotoNext={this.gotoNext} {...phaseStateProps} />
          }
          {localPhase === UPDATES &&
            <MeetingUpdatesContainer gotoItem={this.gotoItem} gotoNext={this.gotoNext} {...phaseStateProps} />
          }
          {localPhase === FIRST_CALL && <MeetingAgendaFirstCall gotoNext={this.gotoNext}/>}
          {localPhase === AGENDA_ITEMS &&
            <MeetingAgendaItems
              agendaItem={agenda[localPhaseItem - 1]}
              isLast={localPhaseItem === agenda.length}
              gotoNext={this.gotoNext}
              members={members}
            />
          }
          {localPhase === LAST_CALL &&
            <MeetingAgendaLastCallContainer
              {...phaseStateProps}
              gotoNext={this.gotoNext}
              isFacilitating={isFacilitating}
            />
          }
          {!inSync &&
            <RejoinFacilitatorButton onClickHandler={rejoinFacilitator}/>
          }
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
