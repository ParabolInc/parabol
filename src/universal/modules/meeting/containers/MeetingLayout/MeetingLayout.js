import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import { connect } from 'react-redux';
import { ensureState } from 'redux-optimistic-ui';
import { reduxSocket } from 'redux-socket-cluster';
import { HotKeys } from 'react-hotkeys';
import { localStorageVars } from 'universal/utils/clientOptions';
import Setup0GetStarted from '../../components/Setup0GetStarted/Setup0GetStarted';
import Setup1InviteTeam from '../../components/Setup1InviteTeam/Setup1InviteTeam';
import Setup2InviteTeam from '../../components/Setup2InviteTeam/Setup2InviteTeam';
import Sidebar from '../../components/Sidebar/Sidebar';
import ensureMeetingId from '../../decorators/ensureMeetingId/ensureMeetingId';

import {
  NAVIGATE_SETUP_0_GET_STARTED,
  NAVIGATE_SETUP_1_INVITE_TEAM,
  NAVIGATE_SETUP_2_INVITE_TEAM
} from '../../ducks/meeting.js';

let styles = {};

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/',
};

const mapStateToProps = state => {
  const myState = ensureState(state);
  const auth = myState.get('auth');
  const meeting = myState.getIn(['meetingModule', 'meeting']);
  return {
    isAuthenticated: auth.get('isAuthenticated'),
    meeting: meeting && meeting.toJS(),
    socketState: myState.getIn(['socket', 'socketState']),
    socketSubs: myState.getIn(['socket', 'subs']).toJS(),
    socketId: myState.getIn(['socket', 'id']),
    setup: myState.getIn(['meetingModule', 'setup']).toJS(),
    shortcuts: myState.getIn(['meetingModule', 'shortcuts']).toJS(),
    userId: auth.getIn(['user', 'id'])
  };
};

@reduxSocket({authTokenName: localStorageVars.authTokenName})
@connect(mapStateToProps)
@ensureMeetingId // catch for those who just landed at this url
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class MeetingLayout extends Component {
  static propTypes = {
    // children included here for multi-part landing pages (FAQs, pricing, cha la la)
    // children: PropTypes.element,
    dispatch: PropTypes.func.isRequired,
    meeting: PropTypes.object.isRequired,
    setup: PropTypes.object.isRequired,
    shortcuts: PropTypes.object.isRequired
  };

  render() {
    const { dispatch, meeting, setup, shortcuts } = this.props;

    const team = meeting.instance.team;
    const teamName = meeting.instance.team.name || 'Team Name';

    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div className={styles.viewport}>
          <div className={styles.main}>
            <div className={styles.contentGroup}>
              {(() => {
                switch (meeting.navigation) {
                  case NAVIGATE_SETUP_1_INVITE_TEAM:
                    return <Setup1InviteTeam dispatch={dispatch} setup={setup} />;
                  case NAVIGATE_SETUP_2_INVITE_TEAM:
                    return <Setup2InviteTeam dispatch={dispatch} setup={setup} />;
                  case NAVIGATE_SETUP_0_GET_STARTED:
                  default:
                    return (
                      <Setup0GetStarted
                        dispatch={dispatch}
                        shortcuts={shortcuts}
                        team={team}
                      />
                    );
                }
              })()}
              { /* <SetupField /> */ }
            </div>
          </div>

          <Sidebar
            shortUrl="https://prbl.io/a/b7s8x9"
            teamName={teamName}
            timerValue="30:00"
          />
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
