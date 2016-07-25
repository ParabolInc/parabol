import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';

import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingCheckinLayout from 'universal/modules/meeting/components/MeetingCheckinLayout/MeetingCheckinLayout';
import MeetingLobbyLayout from 'universal/modules/meeting/components/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingUpdatesLayout from 'universal/modules/meeting/components/MeetingUpdatesLayout/MeetingUpdatesLayout';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import {
  teamSubString,
  teamMembersSubString,
} from './cashayHelpers';

/**
 * MeetingContainer
 *
 * We make action meetings happen.
 *
 * At it's most fundamental, you can think of many of the phases of an
 * action meeting as set of list transformations:
 *
 * Check-In:
 *   [team member, ...] -> [check-in status, ...]
 * Project Updates:
 *   [team member, ...] -> [updated project, ...]
 * Agenda processing:
 *   [agenda item, ...] -> [new project/action, ...]
 *
 */

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
  };

  constructor(props) {
    super(props);
    /**
     * For now, I'm sketching everything out as state on this container
     * until I figure out where it goes (cashay, redux-form, redux, state)...
     */
    this.state = {
      members: [],
      checkins: [],
      shortUrl: `https://prbl.io/m/${props.params.teamId}`
    };
  }

  // componentWillReceiveProps(nextProps) {
  //   const {team} = nextProps.teamSub.data;
  //   // const {teamMembers} = nextProps.memberSub.data;
  //   const {presence} = nextProps.presenceSub.data;
  //   this.createParticipants(team, teamMembers, presence);
  //   this.setMembersState(teamMembers, presence);
  //   this.setCheckinsState();
  // }

  onCheckinNextTeammateClick = () => {
    this.setState({phase: 'updates'});
  }

  onStartMeetingClick = () => {
    this.setState({phase: 'checkin'});
  }

  setCheckinsState() {
    const {
      checkins: stateCheckins,
      members: stateMembers
    } = this.state;
    const checkins = [];

    stateMembers.forEach((member) => {
      const existingCheckin = stateCheckins.find(m => m.id === member.id);
      if (!existingCheckin) {
        // Create new checkin state:
        checkins.push({
          id: member.id,
          state: 'invited',
          isCurrent: false
        });
      } else {
        checkins.push(existingCheckin);
      }
    });

    this.setState({checkins});
  }

  setMembersState(teamMembers, presence) {
    const {members: stateMembers} = this.state;
    const members = [];

    teamMembers.forEach((teamMember) => {
      const {user: {id: userId}} = teamMember;
      const existingMember = stateMembers.find(m => m.id === userId);
      const onlinePresence = presence.find(con => con.userId === userId) ?
        'online' : 'offline';
      if (!existingMember) {
        // Create new member:
        members.push({
          id: teamMember.user.id,
          connection: onlinePresence,
          hasBadge: false,
          image: teamMember.user.picture,
          name: teamMember.user.preferredName,
          size: 'small'
        });
      } else {
        // Update online status of existing members:
        members.push({
          ...existingMember,
          connection: onlinePresence
        });
      }
    });

    this.setState({members});
  }

  render() {
    const {checkins, members, shortUrl} = this.state;
    const {teamSub, memberSub, params} = this.props;
    const {teamId, phase, phaseItem} = params;
    console.log(memberSub.data);
    const {facilitatorPhase, facilitatorPhaseItem, name: teamName} = teamSub.data.team;
    // use the phase from the url, next the phase from the facilitator, next goto lobby (meeting hasn't started)
    const safeFacilitatorPhase = facilitatorPhase || 'lobby';
    // console.log('safefac', facilitatorPhase, safeFacilitatorPhase)
    const localPhase = phase || safeFacilitatorPhase;
    // a phase item isn't necessarily an integer, so there's no default value
    const localPhaseItem = phaseItem || facilitatorPhaseItem;
    // console.log(teamSub, memberSub);
    // console.log('params', this.props.params)

    return (
      <MeetingLayout>
        <Sidebar
          facilitatorPhase={safeFacilitatorPhase}
          localPhase={localPhase}
          shortUrl={shortUrl}
          teamName={teamName}
          members={members}
        />
        {localPhase === 'lobby' &&
        <MeetingLobbyLayout
          members={members}
          onStartMeetingClick={this.onStartMeetingClick}
          shortUrl={shortUrl}
          teamName={teamName}
        />
        }
        {localPhase === 'checkin' &&
        <MeetingCheckinLayout
          checkins={checkins}
          members={members}
          onCheckinNextTeammateClick={this.onCheckinNextTeammateClick}
        />
        }
        {localPhase === 'updates' &&
        <MeetingUpdatesLayout
          members={members}
        />
        }
      </MeetingLayout>
    );
  }
}
