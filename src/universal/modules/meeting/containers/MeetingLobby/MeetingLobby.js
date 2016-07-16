import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {HotKeys} from 'react-hotkeys';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import AuthEngine from 'universal/redux/AuthEngine';
import {cashay, Transport} from 'cashay';
import subscriptions from 'universal/redux/subscriptions';
import subscriber from 'universal/redux/subscriber';
import socketCluster from 'socketcluster-client';


let styles = {};

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/'
};

const meetingSubscriptionString = subscriptions.find(sub => sub.channel === 'meeting').string;
const presenceSubscriptionString = subscriptions.find(sub => sub.channel === 'presence').string;
const userSubscriptionString = subscriptions.find(sub => sub.channel === 'user').string;

const presenceSubscriber = (subscriptionString, variables, handlers, getCachedResult) => {
  const {channel, channelfy} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect();
  const {add, update, remove, error} = handlers;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.watch(channelName, data => {
    if (data.type === 'SOUNDOFF') {
      const options = {
        variables: {
          meetingId: variables.meetingId,
          targetId: data.targetId
        }
      };
      console.log('SOUNDOFF CALLED BY:', data.targetId);
      cashay.mutate('present', options);
    }
    if (data.type === 'PRESENT') {
      const {presence} = getCachedResult();
      const alreadyPresent = presence.find(user => user === data.user);
      if (!alreadyPresent) {
        add(data.user);
      }
      console.log('PRESENT', data.user);
    }
  });
};

const mapStateToProps = (state, props) => {
  const meetingVariables = {meetingId: props.params.meetingId};
  const meetingSubOptions = {
    component: 'meetingSub',
    variables: meetingVariables
  };

  const presenceSubOptions = {
    component: 'presenceSub',
    variables: meetingVariables
  };

  return {
    meetingSub: cashay.subscribe(meetingSubscriptionString, subscriber, meetingSubOptions),
    presenceSub: cashay.subscribe(presenceSubscriptionString, presenceSubscriber, presenceSubOptions)
  };
};

const onConnect = (options, hocOptions, socket) => {
  const sendToServer = request => {
    return new Promise((resolve) => {
      socket.emit('graphql', request, (error, response) => {
        resolve(response);
      });
    });
  };
  const priorityTransport = new Transport(sendToServer);
  cashay.create({priorityTransport});
};
const onDisconnect = () => cashay.create({priorityTransport: null});

@reduxSocket({}, {AuthEngine, socketCluster, onConnect, onDisconnect, keepAlive: 0})
@connect(mapStateToProps)
@requireAuth
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class MeetingLobby extends Component {
  static propTypes = {
    meetingSub: PropTypes.object.isRequired,
    presenceSub: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const options = {
      variables: {
        meetingId: props.params.meetingId
      }
    };
    cashay.mutate('soundOff', options);
    cashay.mutate('present', options);
  }

  render() {
    const {meeting} = this.props.meetingSub.data;
    const {presence} = this.props.presenceSub.data;
    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div className={styles.viewport}>
          <div className={styles.main}>
            <div className={styles.contentGroup}>
              <div>HI GUY</div>
              <div>Your meeting id is: {meeting.id}</div>
              <div>Your userId is: {this.props.user.id}</div>
              <div>Folks present: {presence}</div>
              {/* <SetupField /> */}
            </div>
          </div>
        </div>
      </HotKeys>
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
