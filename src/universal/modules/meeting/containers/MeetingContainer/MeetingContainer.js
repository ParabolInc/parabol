import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingAvatars from 'universal/modules/meeting/components/MeetingAvatars/MeetingAvatars';
import Sidebar from '../../components/Sidebar/Sidebar';
import {withRouter} from 'react-router';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingCheckin from 'universal/modules/meeting/components/MeetingCheckin/MeetingCheckin';
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
import {TEAMS} from 'universal/subscriptions/constants';
import hasPhaseItem from 'universal/modules/meeting/helpers/hasPhaseItem';
import withHotkey from 'react-hotkey-hoc';
import getBestPhaseItem from 'universal/modules/meeting/helpers/getBestPhaseItem';

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
        isFacilitator: team.activeFacilitator === teamMember.id,
        isSelf: teamMember.id.startsWith(userId)
      };
    }
  }
  return resolveMeetingMembers.cache;
};

const meetingContainerQuery = `
query{
  team @cached(id: $teamId, type: "Team") {
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

const mapStateToProps = (state, props) => {
  const {params: {localPhaseItem, teamId}} = props;
  const {sub: userId} = state.auth.obj;
  const queryResult = cashay.query(meetingContainerQuery, {
    op: 'meetingContainerQuery',
    key: teamId,
    variables: {teamId},
    sort: {
      agenda: (a, b) => a.sortOrder - b.sortOrder,
      teamMembers: (a, b) => a.checkInOrder - b.checkInOrder
    },
    resolveCached: {presence: (source) => (doc) => source.id.startsWith(doc.userId)}
  });
  const {agenda, team} = queryResult.data;
  return {
    agenda,
    members: resolveMeetingMembers(queryResult.data, userId),
    team,
    localPhaseItem: localPhaseItem && Number(localPhaseItem),
    isFacilitating: `${userId}::${teamId}` === team.activeFacilitator
  };
};

@socketWithPresence
@connect(mapStateToProps)
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
    const {bindHotkey, localPhaseItem, params, router, team} = props;
    const {localPhase} = params;
    // subscribe to all teams, but don't do anything with that open subscription
    cashay.subscribe(TEAMS);
    handleRedirects(team, localPhase, localPhaseItem, {}, router);
    bindHotkey(['enter', 'right'], this.gotoNext);
    bindHotkey('left', this.gotoPrev);
    bindHotkey('i c a n t h a c k i t', this.endMeeting);
  }

  shouldComponentUpdate(nextProps) {
    const {localPhaseItem, router, params: {localPhase}, team} = nextProps;
    const {team: oldTeam} = this.props;

    // only needs to run when the url changes or the team subscription initializes
    // make sure the url is legit, but only run once (when the initial team subscription comes back)
    return handleRedirects(team, localPhase, localPhaseItem, oldTeam, router);
  }

  endMeeting = (redirOrEvent) => {
    const {params: {teamId}} = this.props;
    if (redirOrEvent === true) {
      this.gotoItem(null, SUMMARY);
    }
    cashay.mutate('endMeeting', {variables: {teamId}});
  };

  gotoItem = (maybeNextPhaseItem, maybeNextPhase) => {
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
        nextPhaseItem = maybeNextPhaseItem || getBestPhaseItem(AGENDA_ITEMS, team);
      }
    } else {
      const localPhaseOrder = phaseOrder(localPhase);
      if (hasPhaseItem(localPhase)) {
        const totalPhaseItems = localPhase === AGENDA_ITEMS ? agenda.length : members.length;
        nextPhase = maybeNextPhaseItem > totalPhaseItems ? phaseArray[localPhaseOrder + 1] : localPhase;
      } else {
        nextPhase = (localPhase === FIRST_CALL && !agenda.length) ? LAST_CALL : phaseArray[localPhaseOrder + 1];
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
    // nextPhase is undefined if we're at the summary
    if (nextPhase) {
      if (isFacilitating) {
        const variables = {teamId};
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

  gotoNext = () => this.gotoItem(this.props.localPhaseItem + 1);
  gotoPrev = () => this.gotoItem(this.props.localPhaseItem - 1);

  render() {
    const {agenda, localPhaseItem, members, params, team} = this.props;
    const {teamId, localPhase} = params;
    const {facilitatorPhase, meetingPhase, meetingPhaseItem, name: teamName} = team;
    const agendaPhaseItem = meetingPhase === AGENDA_ITEMS && meetingPhaseItem || 0;
    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName || members.length === 0) {
      return <LoadingView />;
    }
    const phaseStateProps = { // DRY
      localPhaseItem,
      members,
      team
    };
    return (
      <MeetingLayout>
        <Sidebar
          agendaPhaseItem={agendaPhaseItem}
          facilitatorPhase={facilitatorPhase}
          gotoItem={this.gotoItem}
          localPhase={localPhase}
          teamName={teamName}
          teamId={teamId}
        />
        <MeetingMain>
          <MeetingAvatars>
            <AvatarGroup avatars={members} localPhase={localPhase}/>
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
            <MeetingAgendaItems agendaItem={agenda[localPhaseItem - 1]} gotoNext={this.gotoNext} members={members}/>
          }
          {localPhase === LAST_CALL &&
            <MeetingAgendaLastCallContainer {...phaseStateProps} endMeeting={this.endMeeting}/>
          }
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
