import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from '../../components/Sidebar/Sidebar';
import {withRouter} from 'react-router';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingCheckin from 'universal/modules/meeting/components/MeetingCheckin/MeetingCheckin';
import MeetingUpdatesContainer
  from 'universal/modules/meeting/containers/MeetingUpdatesContainer/MeetingUpdatesContainer';
import MeetingAgendaItemsContainer
  from 'universal/modules/meeting/containers/MeetingAgendaItemsContainer/MeetingAgendaItemsContainer';
import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import {
  LOBBY,
  CHECKIN,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
//  SUMMARY
} from 'universal/utils/constants';
import MeetingAgendaFirstCall from 'universal/modules/meeting/components/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';

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
    sort: {teamMembers: (a, b) => a.checkInOrder > b.checkInOrder},
    resolveCached: {presence: (source) => (doc) => source.id.startsWith(doc.userId)}
  });
  const {team} = queryResult.data;
  return {
    members: resolveMeetingMembers(queryResult.data, userId),
    team: queryResult.data.team,
    localPhaseItem: localPhaseItem && Number(localPhaseItem),
    isFacilitating: `${userId}::${teamId}` === team.activeFacilitator
  };
};

@socketWithPresence
@connect(mapStateToProps)
@withRouter
export default class MeetingContainer extends Component {
  static propTypes = {
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
    const {localPhaseItem, params, router, team} = props;
    const {localPhase} = params;
    // subscribe to all teams, but don't do anything with that open subscription
    cashay.subscribe('teams');
    handleRedirects(team, localPhase, localPhaseItem, router);
  }

  componentWillReceiveProps(nextProps) {
    const {localPhaseItem, router, params, team} = nextProps;
    const {localPhase, teamId} = params;
    const {team: oldTeam} = this.props;

    // only needs to run when the url changes or the team subscription initializes
    // make sure the url is legit, but only run once (when the initial team subscription comes back)
    handleRedirects(team, localPhase, localPhaseItem, router);

    // is the facilitator making moves?
    if (team.facilitatorPhaseItem !== oldTeam.facilitatorPhaseItem ||
      team.facilitatorPhase !== oldTeam.facilitatorPhase) {
      // were we n'sync?
      const inSync = localPhase === oldTeam.facilitatorPhase && localPhaseItem === oldTeam.facilitatorPhaseItem;
      if (inSync) {
        const pushURL = makePushURL(teamId, team.facilitatorPhase, team.facilitatorPhaseItem);
        router.replace(pushURL);
      }
    }
  }

  render() {
    const {isFacilitating, localPhaseItem, members, params, team} = this.props;
    const {teamId, localPhase} = params;
    const {facilitatorPhase, name: teamName} = team;

    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName || members.length === 0) {
      return <LoadingView />;
    }
    const phaseStateProps = { // DRY
      isFacilitating,
      localPhaseItem,
      members,
      team
    };
    return (
      <MeetingLayout>
        <Sidebar
          facilitatorPhase={facilitatorPhase}
          localPhase={localPhase}
          teamName={teamName}
          teamId={teamId}
        />
        <MeetingMain>
          <MeetingSection paddingTop="2rem">
            <AvatarGroup avatars={members} localPhase={localPhase}/>
          </MeetingSection>
          {localPhase === LOBBY && <MeetingLobby {...phaseStateProps} />}
          {localPhase === CHECKIN && <MeetingCheckin {...phaseStateProps} />}
          {localPhase === UPDATES && <MeetingUpdatesContainer {...phaseStateProps} />}
          {localPhase === FIRST_CALL && <MeetingAgendaFirstCall {...phaseStateProps} />}
          {localPhase === AGENDA_ITEMS && <MeetingAgendaItemsContainer {...phaseStateProps} />}
          {localPhase === LAST_CALL && <MeetingAgendaLastCall {...phaseStateProps} />}
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
