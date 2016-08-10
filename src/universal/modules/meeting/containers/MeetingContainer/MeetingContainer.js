import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';
import {withRouter} from 'react-router';
import {createMembers, reset as resetDuck} from 'universal/modules/meeting/ducks/meetingDuck';
import getLocalPhase from 'universal/modules/meeting/helpers/getLocalPhase';
import handleRedirects from 'universal/modules/meeting/helpers/handleRedirects';
import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import {
  teamSubString,
  teamMembersSubString,
} from './cashayHelpers';

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  return {
    members: state.meeting.members,
    memberSub: cashay.subscribe(teamMembersSubString, subscriber, {op: 'memberSub', variables}),
    teamSub: cashay.subscribe(teamSubString, subscriber, {op: 'teamSub', variables})
  };
};

@socketWithPresence
@connect(mapStateToProps)
@withRouter
export default class MeetingContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    members: PropTypes.array,
    memberSub: PropTypes.object.isRequired,
    params: PropTypes.shape({
      localPhaseItem: PropTypes.string,
      teamId: PropTypes.string.isRequired
    }).isRequired,
    presenceSub: PropTypes.object.isRequired,
    router: PropTypes.object,
    teamSub: PropTypes.object.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillReceiveProps(nextProps) {
    const {presence} = nextProps.presenceSub.data;
    const {team} = nextProps.teamSub.data;
    const {teamMembers} = nextProps.memberSub.data;
    const {children, dispatch, user, router, params: {localPhaseItem}, location: {pathname}} = nextProps;
    const oldTeam = this.props.teamSub.data.team;

    // only needs to run when the url changes or the team subscription initializes
    // make sure the url is legit, but only run once (when the initial team subscription comes back)
    handleRedirects(team, children, localPhaseItem, pathname, router);

    if (presence !== this.props.presenceSub.data.presence ||
      teamMembers !== this.props.memberSub.data.teamMembers ||
      team.activeFacilitator !== oldTeam.activeFacilitator ||
      user.id !== this.props.user.id) {
      // build the members array by aggregating everything
      dispatch(createMembers(teamMembers, presence, team, user));
    }

    // is the facilitator making moves?
    if (team.facilitatorPhaseItem !== oldTeam.facilitatorPhaseItem ||
      team.facilitatorPhase !== oldTeam.facilitatorPhase) {
      const {teamId, localPhaseItem: oldLocalPhaseItem} = this.props.params;
      const oldLocalPhase = getLocalPhase(pathname, teamId);
      // were we n'sync?
      const inSync = oldLocalPhase === oldTeam.facilitatorPhase && oldLocalPhaseItem === oldTeam.facilitatorPhaseItem;
      if (inSync) {
        const pushURL = makePushURL(teamId, team.facilitatorPhase, team.facilitatorPhaseItem);
        router.push(pushURL);
      }
    }
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch(resetDuck());
  }

  render() {
    const {children, dispatch, location, members, params, teamSub} = this.props;
    const {teamId, localPhaseItem} = params;
    const {team} = teamSub.data;
    const {
      activeFacilitator, facilitatorPhase, facilitatorPhaseItem,
      meetingPhase, meetingPhaseItem, name: teamName
    } = team;

    // if we have a team.name, we have an initial subscription success to the team object
    if (!teamName || !members.length) {
      return <LoadingView />;
    }
    // debugger
    const localPhase = getLocalPhase(location.pathname, teamId);
    // declare if this user is the facilitator

    const self = members.find(m => m.isSelf);
    const isFacilitator = self && self.id === activeFacilitator;
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
          {children && React.cloneElement(children, {
            dispatch,
            isFacilitator,
            localPhaseItem,
            facilitatorPhase,
            facilitatorPhaseItem,
            meetingPhase,
            meetingPhaseItem,
            members,
            teamName
          })}
        </MeetingMain>
      </MeetingLayout>
    );
  }
}
