import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';

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

let styles = {};

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  return {
    authToken: state.authToken,
    meetingSub: cashay.subscribe(meetingSubString, subscriber, meetingSubOptions(teamId)),
    team: cashay.query(teamQueryString, teamQueryOptions(teamId)).data.team,
  };
};

@socketWithPresence
@connect(mapStateToProps)
@look
export default class MeetingContainer extends Component {
  static propTypes = {
    authToken: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    meetingSub: PropTypes.object.isRequired,
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
    };
  }

  render() {
    // const {team} = this.props;
    const {meeting} = this.props.meetingSub.data;
    const {presence} = this.props.presenceSub.data;
    const socketsPresent = presence.map(con => con.id).join(', ');
    const usersPresent = presence.map(con => con.userId).join(', ');

    return (
      <div className={styles.viewport}>
        <div className={styles.main}>
          <div className={styles.contentGroup}>
            <div>HI GUY</div>
            <div>Your meeting id is: {meeting.id}</div>
            <div>Your userId is: {this.props.user.id}</div>
            <div>Folks present: {usersPresent}</div>
            <div>Sockets present: {socketsPresent}</div>
            {/* <SetupField /> */}
          </div>
        </div>
      </div>
    );
  }
}

styles = StyleSheet.create({
  viewport: {
    backgroundColor: '#fff',
    display: 'flex !important',
    minHeight: '100vh'
  },

  main: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    order: 2
  },

  contentGroup: {
    alignItems: 'center',
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2rem'
  }
});
