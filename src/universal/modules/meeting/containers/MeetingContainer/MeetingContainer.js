import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';

import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingLobbyLayout from 'universal/modules/meeting/components/MeetingLobbyLayout/MeetingLobbyLayout';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import {
  meetingSubString,
  meetingSubOptions,
  teamQueryString,
  teamQueryOptions
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
  const {params: {teamId}} = props;
  return {
    authToken: state.authToken,
    meetingSub: cashay.subscribe(meetingSubString, subscriber, meetingSubOptions(teamId)),
    members: state.members,
    team: cashay.query(teamQueryString, teamQueryOptions(teamId)).data.team,
  };
};

@socketWithPresence
@connect(mapStateToProps)
export default class MeetingContainer extends Component {
  static propTypes = {
    authToken: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    meetingSub: PropTypes.object.isRequired,
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired
    }).isRequired,
    presenceSub: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    /**
     * For now, I'm sketching everything out as state on this container
     * until I figure out where it goes (cashay, redux-form, redux, state)...
     */
    this.state = {
      members: [],
      phase: 'lobby'
    };
  }

  componentWillReceiveProps(nextProps) {
    const {members: stateMembers} = this.state;
    const {teamMembers} = nextProps.team;
    const newMembers = [];
    teamMembers.forEach((teamMember) => {
      const existingMember = stateMembers.find(m => m.id === teamMember.id);
      if (!existingMember) {
        newMembers.push({
          id: teamMember.id,
          connection: 'online',
          hasBadge: false,
          image: teamMember.cachedUser.picture,
          size: 'small'
        });
      }
    });
    this.setState({ members: stateMembers.concat(newMembers) });
  }

  render() {
//    const {meeting} = this.props.meetingSub.data;
//    const {presence} = this.props.presenceSub.data;
//    const socketsPresent = presence.map(con => con.id).join(', ');
//    const usersPresent = presence.map(con => con.userId).join(', ');
    const {members, phase} = this.state;
    const {team} = this.props;

    const shortUrl = `https://prbl.io/m/${this.props.params.teamId}`;


        // <div className={styles.viewport}>
        //   <div className={styles.main}>
        //     <div className={styles.contentGroup}>
        //       <div>HI GUY</div>
        //       <div>Your meeting id is: {meeting.id}</div>
        //       <div>Your userId is: {this.props.user.id}</div>
        //       <div>Folks present: {usersPresent}</div>
        //       <div>Sockets present: {socketsPresent}</div>
        //       {/* <SetupField /> */}
        //     </div>
        //   </div>
        // </div>

    return (
      <MeetingLayout>
        <Sidebar
          facilitatorLocation={phase}
          location={phase}
          shortUrl={shortUrl}
          teamName={team.name}
          members={members}
        />
        {phase === 'lobby' &&
          <MeetingLobbyLayout
            members={members}
            shortUrl={shortUrl}
            teamName={team.name}
            timerValue="30:00"
          />
        }
      </MeetingLayout>
    );
  }
}
