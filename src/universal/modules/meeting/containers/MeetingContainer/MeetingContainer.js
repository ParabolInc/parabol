import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';
import {LOBBY} from 'universal/utils/constants';
import {withRouter} from 'react-router';
import isSkippingAhead from 'universal/modules/meeting/helpers/isSkippingAhead';
import {createMembers} from 'universal/modules/meeting/ducks/meetingDuck';
import getLocalPhase from 'universal/modules/meeting/helpers/getLocalPhase';

import {
  teamSubString,
  teamMembersSubString,
} from './cashayHelpers';

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  return {
    teamSub: cashay.subscribe(teamSubString, subscriber, {component: 'Meeting::teamSub', variables}),
    memberSub: cashay.subscribe(teamMembersSubString, subscriber, {component: 'Meeting::memberSub', variables}),
    members: state.meeting.members
  };
};

@socketWithPresence
@connect(mapStateToProps)
@withRouter
export default class MeetingContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    teamSub: PropTypes.object.isRequired,
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired
    }).isRequired,
    presenceSub: PropTypes.object.isRequired,
    memberSub: PropTypes.object.isRequired,
    children: PropTypes.any,
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      localPhase: null,
      localPhaseItem: null
    };
  }

  componentWillReceiveProps(nextProps) {
    // build the members array by aggregating everything
    const {presence} = nextProps.presenceSub.data;
    const {team} = nextProps.teamSub.data;
    const {teamMembers} = nextProps.memberSub.data;
    const {user, router} = nextProps;
    const oldTeam = this.props.teamSub.data.team;
    if (presence !== this.props.presenceSub.data.presence ||
      teamMembers !== this.props.memberSub.data.teamMembers ||
      team.activeFacilitator !== oldTeam.activeFacilitator ||
      user.id !== this.props.user.id) {
      nextProps.dispatch(createMembers(teamMembers, presence, team, user))
    }


    // is the facilitator making moves?

    // console.log('facilitator changed!', team, oldTeam)
    if (team.facilitatorPhaseItem !== oldTeam.facilitatorPhaseItem ||
      team.facilitatorPhase !== oldTeam.facilitatorPhase
    ) {
      const {teamId, localPhaseItem: oldLocalPhaseItem} = this.props.params;
      const oldLocalPhase = getLocalPhase(this.props.location.pathname, teamId);
      // were we n'sync?
      const inSync = oldLocalPhase === oldTeam.facilitatorPhase && oldLocalPhaseItem === oldTeam.facilitatorPhaseItem;
      if (inSync) {
        const pushURL = makePushURL(teamId, team.facilitatorPhase, team.facilitatorPhaseItem);
        router.push(pushURL);
      }
    }
  }

  render() {
    const {children, dispatch, location, members, params, router, teamSub, user} = this.props;
    const {teamId, localPhaseItem} = params;
    const {team} = teamSub.data;
    const {activeFacilitator, facilitatorPhase, facilitatorPhaseItem, meetingPhase, meetingPhaseItem, name: teamName} = team;

    // if we have a team.id, we have an initial subscription success
    if (!team.id) {
      // TODO put a spinner here
      return <div>RIDE THAT RENDER TRAIN</div>
    }
    // make the short url a long url
    if (!children) {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.replace(pushURL);
    }

    const localPhase = getLocalPhase(location.pathname, teamId);
    // don't let anyone in the lobby after the meeting has started
    if (localPhase === LOBBY && facilitatorPhase && facilitatorPhase !== LOBBY) {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.replace(pushURL);
    }

    // don't let anyone skip to the next phase
    if (isSkippingAhead(localPhase, meetingPhase)) {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.replace(pushURL);
    }

    // declare if this user is the facilitator
    const self = members.find(m => m.isSelf);
    const isFacilitator = self && self.id === activeFacilitator;
    const isSynced = localPhase === facilitatorPhase && localPhaseItem === facilitatorPhaseItem;
    return (
      <MeetingLayout>
        <Sidebar
          facilitatorPhase={facilitatorPhase}
          localPhase={localPhase}
          teamName={teamName}
          teamId={team.id}
        />
        {children && React.cloneElement(children, {
          dispatch,
          isFacilitator,
          isSynced,
          localPhaseItem,
          facilitatorPhase,
          facilitatorPhaseItem,
          meetingPhase,
          meetingPhaseItem,
          members,
          teamName
        })}
      </MeetingLayout>
    );
  }
}
