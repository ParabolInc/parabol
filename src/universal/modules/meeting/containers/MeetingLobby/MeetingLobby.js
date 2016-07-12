import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {HotKeys} from 'react-hotkeys';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import AuthEngine from 'universal/redux/AuthEngine';
import {cashay} from 'cashay';
import subscriptions from 'universal/redux/subscriptions';
import subscriber from 'universal/redux/subscriber';
import socketCluster from 'socketcluster-client';

let styles = {};

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/'
};

const meetingSubscriptionString = subscriptions.find(sub => sub.channel === 'meeting').string;

const mapStateToProps = (state, props) => {
  const options = {
    variables: {
      meetingId: props.params.meetingId
    }
  };
  return {
    authToken: state.authToken,
    result: cashay.subscribe(meetingSubscriptionString, subscriber, options)
  };
};

@reduxSocket({}, {AuthEngine, socketCluster, keepAlive: 0})
@connect(mapStateToProps)
@requireAuth
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class MeetingLobby extends Component {
  static propTypes = {
    // children included here for multi-part landing pages (FAQs, pricing, cha la la)
    // children: PropTypes.element,
    dispatch: PropTypes.func.isRequired,
    meeting: PropTypes.object.isRequired,
    setup: PropTypes.object.isRequired,
    shortcuts: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
  };

  render() {
    const {meeting} = this.props.result.data;
    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div className={styles.viewport}>
          <div className={styles.main}>
            <div className={styles.contentGroup}>
              <div>HI GUY</div>
              <div>Your meeting id is: {meeting.id}</div>
              <div>It was created at: {meeting.createdAt}</div>
              {/* <SetupField /> */}
            </div>
          </div>
        </div>
      </HotKeys>
    );
    // <Sidebar
    //   shortUrl="https://prbl.io/a/b7s8x9"
    //   teamName={teamName}
    //   timerValue="30:00"
    // />
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
