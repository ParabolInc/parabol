import React, {Component} from 'react';
import look, { StyleSheet } from 'react-look';
import { connect } from 'react-redux';
import { ensureState } from 'redux-optimistic-ui';
import { reduxSocket } from 'redux-socket-cluster';
import { localStorageVars } from 'universal/utils/clientOptions';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import Sidebar from '../../components/Sidebar/Sidebar';
import ensureMeetingId from '../../decorators/ensureMeetingId/ensureMeetingId';

let styles = {};

const mapStateToProps = state => {
  const myState = ensureState(state);
  const auth = myState.get('auth');
  const meeting = myState.get('meeting');
  return {
    meeting: meeting && meeting.toJS(),
    userId: auth.getIn(['user', 'id']),
    socketState: myState.getIn(['socket', 'socketState']),
    socketSubs: myState.getIn(['socket', 'subs']).toJS(),
    socketId: myState.getIn(['socket', 'id']),
    isAuthenticated: auth.get('isAuthenticated')
  };
};

@reduxSocket({authTokenName: localStorageVars.authTokenName})
@connect(mapStateToProps)
@ensureMeetingId // catch for those who just landed at this url
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class MeetingLayout extends Component {
  render() {
    return (
      <div className={styles.viewport}>
        <div className={styles.main}>
          <div className={styles.contentGroup}>
            <SetupHeader
              heading="Let’s get started!"
              subHeading="What do you call your team?"
            />
            <AdvanceLink
              href="/action-ui/set-up/"
              icon="arrow-circle-right"
              label="Set-up"
            />
          </div>
        </div>

        <Sidebar
          shortUrl="https://prbl.io/a/b7s8x9"
          teamName="Engineering"
          timerValue="30:00"
        />
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
    justifyContent: 'center'
  }
});
