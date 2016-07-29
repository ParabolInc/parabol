import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {push} from 'react-router-redux';

import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';
import {phases} from 'universal/utils/constants';

import {
  teamSubString,
  teamMembersSubString,
} from './cashayHelpers';

const {LOBBY, CHECKIN, UPDATES} = phases;

const createParticipants = (teamMembers, presence, user) => {
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
    memberSub: cashay.subscribe(teamMembersSubString, subscriber, {component: 'Meeting::memberSub', variables}),
  };
};

@socketWithPresence
@connect(mapStateToProps)
export default class MeetingContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    teamSub: PropTypes.object.isRequired,
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired
    }).isRequired,
    presenceSub: PropTypes.object.isRequired,
    memberSub: PropTypes.object.isRequired,
    children: PropTypes.any
  };

  render() {
    const {children, dispatch, location, memberSub, params, presenceSub, teamSub, user} = this.props;
    const {teamId} = params;
    const {team} = teamSub.data;
    const {facilitatorPhase, facilitatorPhaseItem, meetingPhaseItem, name: teamName} = team;
    if (facilitatorPhase) {
      if (!children) {
        dispatch(push(`/meeting/${teamId}/${facilitatorPhase}/${facilitatorPhaseItem}`));
      }
    } else {
      // TODO return a spinner
    }
    const {teamMembers} = memberSub.data;
    const {presence} = presenceSub.data;
    const members = createParticipants(teamMembers, presence, user);
    const safeFacilitatorPhase = facilitatorPhase || LOBBY;
    // grab the localPhase from the url
    const pathnameArray = location.pathname.split('/');
    const teamIdIdx = pathnameArray.indexOf(teamId);
    const localPhase = pathnameArray[teamIdIdx + 1] || LOBBY;
    return (
      <MeetingLayout>
        <Sidebar
          facilitatorPhase={safeFacilitatorPhase}
          localPhase={localPhase}
          teamName={teamName}
          teamId={team.id}
        />
        {children && React.cloneElement(children, {
          dispatch,
          facilitatorPhase,
          facilitatorPhaseItem,
          members,
          teamName,
          meetingPhaseItem
        })}
      </MeetingLayout>
    );
  }
}
