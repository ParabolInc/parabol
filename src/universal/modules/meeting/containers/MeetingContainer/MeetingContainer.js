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
    this.state = {
      members: [],
      shortUrl: `https://prbl.io/m/${props.params.teamId}`
    };
  }

  componentWillReceiveProps(nextProps) {
    const {team} = nextProps.teamSub.data;
    const {teamMembers} = nextProps.memberSub.data;
    const {presence} = nextProps.presenceSub.data;
    this.createParticipants(team, teamMembers, presence);
  }

  createParticipants = (team, teamMembers, presence) => {
    const {checkedInMembers, facilitatorPhase} = team;
    const inLobby = !facilitatorPhase || facilitatorPhase === 'lobby';
    this.setState({
      members: teamMembers.map(member => {

        // ternary state boolean
        let isCheckedIn;
        if (!inLobby && Array.isArray(checkedInMembers)) {
          isCheckedIn = Boolean(checkedInMembers.find(teamMemberId => teamMemberId === member.id))
        }
        return {
          ...member,
          isConnected: Boolean(presence.find(connection => connection.userId === member.userId)),
          isCheckedIn,
          size: 'small'
        };
      })
    });
  };

  render() {
    const {checkins, members, shortUrl} = this.state;
    const {teamSub, memberSub, params} = this.props;
    const {teamId, phase, phaseItem} = params;
    const {facilitatorPhase, facilitatorPhaseItem, name: teamName} = teamSub.data.team;

    // use the phase from the url, next the phase from the facilitator, next goto lobby (meeting hasn't started)
    const safeFacilitatorPhase = facilitatorPhase || 'lobby';
    const localPhase = phase || safeFacilitatorPhase;

    // a phase item isn't necessarily an integer, so there's no default value
    const localPhaseItem = phaseItem || facilitatorPhaseItem;

    return (
      <MeetingLayout>
        <Sidebar
          facilitatorPhase={safeFacilitatorPhase}
          localPhase={localPhase}
          shortUrl={shortUrl}
          teamName={teamName}
        />
        {localPhase === 'lobby' &&
        <MeetingLobbyLayout
          members={members}
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
