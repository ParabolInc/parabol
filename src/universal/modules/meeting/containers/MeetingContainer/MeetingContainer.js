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

import {
  teamSubString,
  teamMembersSubString,
} from './cashayHelpers';

const createMembers = (teamMembers, presence, user) => {
  return teamMembers.map((member) => {
    return {
      ...member,
      isConnected: Boolean(presence.find(connection => connection.userId === member.userId)),
      isSelf: user.id === member.userId
    };
  }).sort((a, b) => b.checkInOrder <= a.checkInOrder);
};

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  return {
    teamSub: cashay.subscribe(teamSubString, subscriber, {component: 'Meeting::teamSub', variables}),
    memberSub: cashay.subscribe(teamMembersSubString, subscriber, {component: 'Meeting::memberSub', variables})
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
      members: []
    };
  }

  componentWillReceiveProps(nextProps) {
    // build the members array by aggregating everything
    const {teamMembers} = nextProps.memberSub.data;
    const {presence} = nextProps.presenceSub.data;
    const {user} = nextProps;
    if (presence !== this.props.presenceSub.data.presence ||
    teamMembers !== this.props.teamSub.data.teamMembers ||
    user !== this.props.user) {
      this.setState({
        members: createMembers(teamMembers, presence, user)
      });
    }
  }

  render() {
    const {children, dispatch, location, params, router, teamSub} = this.props;
    const {teamId, localPhaseItem} = params;
    const {team} = teamSub.data;
    const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, meetingPhaseItem, name: teamName} = team;

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

    // grab the localPhase from the url
    const pathnameArray = location.pathname.split('/');
    const teamIdIdx = pathnameArray.indexOf(teamId);
    const localPhase = pathnameArray[teamIdIdx + 1];

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
          localPhaseItem: Number(localPhaseItem),
          facilitatorPhase,
          facilitatorPhaseItem,
          meetingPhase,
          meetingPhaseItem,
          members: this.state.members,
          teamName
        })}
      </MeetingLayout>
    );
  }
}
