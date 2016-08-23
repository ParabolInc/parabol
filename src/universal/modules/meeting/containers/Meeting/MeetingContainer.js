import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from '../../components/Sidebar/Sidebar';
import {withRouter} from 'react-router';
import getLocalPhase from 'universal/modules/meeting/helpers/getLocalPhase';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM, TEAM_MEMBERS, AGENDA} from 'universal/subscriptions/constants';
import {resolveProjectsByMember} from 'universal/subscriptions/computedSubs';
import resolveMeetingMembers from 'universal/subscriptions/computed/resolveMeetingMembers';
import MeetingLobby from 'universal/modules/meeting/components/MeetingLobby/MeetingLobby';
import MeetingCheckin from 'universal/modules/meeting/components/MeetingCheckin/MeetingCheckin';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import {LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY} from 'universal/utils/constants';

const teamSubQuery = subscriptions.find(sub => sub.channel === TEAM).string;
const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
const agendaSubQuery = subscriptions.find(sub => sub.channel === AGENDA).string;

const mapStateToProps = (state, props) => {
  const {params: {localPhaseItem, teamId}} = props;
  const {sub: userId} = state.auth.obj;
  const variables = {teamId};
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    key: teamId,
    op: TEAM_MEMBERS,
    variables,
  }).data;
  const {team} = cashay.subscribe(teamSubQuery, subscriber, {
    key: teamId,
    op: TEAM,
    variables
  }).data;
  const projects = cashay.computed('projectSubs', [teamMembers], resolveProjectsByMember);
  const members = cashay.computed('meetingMembers', [teamId, userId], resolveMeetingMembers);
  return {
    members,
    projects,
    team,
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
    localPhaseItem: PropTypes.number,
    members: PropTypes.array,
    params: PropTypes.shape({
      localPhase: PropTypes.string,
      teamId: PropTypes.string.isRequired
    }).isRequired,
    projects: PropTypes.object.isRequired,
    router: PropTypes.object,
    team: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const {localPhaseItem, params, router, team} = props;
    const {localPhase} = params;
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
    const {isFacilitating, localPhaseItem, dispatch, members, params, projects, team} = this.props;
    const {teamId, localPhase} = params;
    const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, meetingPhaseItem, name: teamName} = team;

    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName || members.length === 0) {
      return <LoadingView />;
    }
    // declare if this user is the facilitator
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
          {localPhase === LOBBY && <MeetingLobby isFacilitating={isFacilitating} members={members} team={team}/>}
          {localPhase === CHECKIN &&
            <MeetingCheckin
              isFacilitating={isFacilitating}
              localPhaseItem={localPhaseItem}
              members={members}
              team={team}
            />
          }
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
