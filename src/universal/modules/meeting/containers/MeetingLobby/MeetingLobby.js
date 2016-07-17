import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import subscriber from 'universal/subscriptions/subscriber';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {MEETING} from 'universal/subscriptions/constants';

let styles = {};

const meetingSubscriptionString = subscriptions.find(sub => sub.channel === MEETING).string;
const mapStateToProps = (state, props) => {
  const meetingSubOptions = {
    variables: {meetingId: props.params.meetingId},
    component: 'meetingSub'
  };
  return {
    meetingSub: cashay.subscribe(meetingSubscriptionString, subscriber, meetingSubOptions),
  };
};

@socketWithPresence
@connect(mapStateToProps)
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class MeetingLobby extends Component {
  static propTypes = {
    meetingSub: PropTypes.object.isRequired,
    presenceSub: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
  };

  render() {
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

// TODO: Scrub !important after inline-style-prefix-all
//       dependency of react-look is updated to write
//       non-vendor property last in order. (TA)

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
