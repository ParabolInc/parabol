import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';
import look, { StyleSheet } from 'react-look';
import { connect } from 'react-redux';
import { ensureState } from 'redux-optimistic-ui';
import { reduxSocket } from 'redux-socket-cluster';
import { localStorageVars } from 'universal/utils/clientOptions';
import {loadMeeting, updateEditing, updateContent} from '../../ducks/meeting';
import { push } from 'react-router-redux';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import Sidebar from '../../components/Sidebar/Sidebar';
import ensureMeetingId from '../../decorators/ensureMeetingId/ensureMeetingId';

const mapStateToProps = state => {
  state = ensureState(state);
  const auth = state.get('auth');
  const meeting = state.get('meeting');
  return {
    meeting: meeting && meeting.toJS(),
    userId: auth.getIn(['user', 'id']),
    socketState: state.getIn(['socket', 'socketState']),
    socketSubs: state.getIn(['socket', 'subs']).toJS(),
    socketId: state.getIn(['socket', 'id']),
    isAuthenticated: auth.get('isAuthenticated')
  };
}

const socketClusterListeners = {
  unsubscribe(props) {
    const {meeting, socketId, dispatch} = props;
    dispatch(updateEditing(meeting.instance.id, socketId, false));
  }
}
@reduxSocket({authTokenName: localStorageVars.authTokenName})
@connect(mapStateToProps)
@ensureMeetingId // catch for those who just landed at this url
@look
export default class MeetingLayout extends Component {
  constructor(props) {
    super(props);
    const {dispatch, socketSubs, socketId, meeting} = props;

    // TODO lock it down? invite only, password, etc.
    if (!socketSubs.length) {
      // TODO this is ugly, but we'll have to use this until i finish building Cashay
      dispatch(loadMeeting(meeting.instance.id));
    }
  }

  render() {
    const {meeting: {instance}, dispatch} = this.props;
    const {content, currentEditors} = instance;
    const isActive = Boolean(currentEditors.length);

    return (
      <div className={styles.viewport}>
        <div className={styles.main}>
          <div className={styles.contentGroup}>
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

const styles = StyleSheet.create({
  viewport: {
    backgroundColor: '#fff',
    display: 'flex',
    minHeight: '100vh'
  },

  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    order: 2
  },

  contentGroup: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  }
});
