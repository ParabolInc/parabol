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

const presenceSubscriber = (subscriptionString, handlers, variables) => {
  const {channelfy} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect({}, {AuthEngine});
  const {add, update, remove, error} = handlers;
  console.log('in the subscriber');
  socket.subscribe(channelName, {waitForAuth: true});
};

const mapStateToProps = (state, props) => {
  const meetingVariables = {meetingId: props.params.meetingId};
  console.log('meetingVars', meetingVariables)
  const meetingSubOptions = {
    component: 'meetingSub',
    variables: meetingVariables
  };

  const presenceSubOptions = {
    component: 'presenceSub',
    variables: meetingVariables
  };

  return {
    authToken: state.authToken,
    meetingSub: cashay.subscribe(meetingSubscriptionString, subscriber, meetingSubOptions),
    presenceSub: cashay.subscribe(presenceSubscriptionString, presenceSubscriber, presenceSubOptions)
  };
};

const onConnect = (options, hocOptions, socket) => {
  const sendToServer = request => {
    return new Promise((resolve) => {
      socket.emit('graphql', request, (error, response) => {
        console.log('resolving', response)
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
    // children included here for multi-part landing pages (FAQs, pricing, cha la la)
    // children: PropTypes.element,
    dispatch: PropTypes.func.isRequired,
    meeting: PropTypes.object.isRequired,
    setup: PropTypes.object.isRequired,
    shortcuts: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const options = {
      variables: {
        meetingId: props.params.meetingId
      }
    };

    const authEngine = new AuthEngine()
    const socket = socketCluster.connect({}, {AuthEngine});
    socket.on('message', msg => console.log('MSG' + msg))
    cashay.mutate('soundOff', options)
  }
  render() {
    const {meeting} = this.props.meetingSub.data;
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
