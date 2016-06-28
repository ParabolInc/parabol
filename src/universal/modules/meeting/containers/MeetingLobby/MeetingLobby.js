import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {HotKeys} from 'react-hotkeys';
import {localStorageVars} from 'universal/utils/clientOptions';
import Setup0GetStarted from '../../components/Setup0GetStarted/Setup0GetStarted';
import Setup1InviteTeam from '../../components/Setup1InviteTeam/Setup1InviteTeam';
import Setup2InviteTeam from '../../components/Setup2InviteTeam/Setup2InviteTeam';
import Sidebar from '../../components/Sidebar/Sidebar';
import ensureMeetingAndTeamLoaded from
  '../../decorators/ensureMeetingAndTeamLoaded/ensureMeetingAndTeamLoaded';

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

// const meetingQueryString = `
//   query($meetingId: ID!) {
//     payload: getMeetingById(meetingId: $meetingId) {
//       id,
//       createdAt,
//       updatedAt,
//       lastUpdatedBy,
//       team {
//         id,
//         name
//       },
//       content
//     }
//   }`;

const cashayOpts = {
  component: 'MeetingLobby'
};

const mapStateToProps = (state, props) => {
  const auth = state.get('auth');
  const meeting = state.getIn(['meetingModule', 'meeting']);
  cashayOpts.variables = {
    meetingId: props.params.id
  };
  return {
    isAuthenticated: auth.get('isAuthenticated'),
    meeting: meeting && meeting.toJS(),
    socketState: state.getIn(['socket', 'socketState']),
    socketSubs: state.getIn(['socket', 'subs']).toJS(),
    socketId: state.getIn(['socket', 'id']),
    setup: state.getIn(['meetingModule', 'setup']).toJS(),
    shortcuts: state.getIn(['meetingModule', 'shortcuts']).toJS(),
    team: state.getIn(['meetingModule', 'team']).toJS(),
    userId: auth.getIn(['user', 'id'])
  };
};

@reduxSocket({authTokenName: localStorageVars.authTokenName})
@connect(mapStateToProps)
@ensureMeetingAndTeamLoaded // catch for those who just landed at this url
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
    const {dispatch, meeting, setup, shortcuts, team} = this.props;

    const teamName = team.instance.name || 'Team Name';

    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div className={styles.viewport}>
          <div className={styles.main}>
            <div className={styles.contentGroup}>
              {(() => {
                switch (meeting.navigation) {
                  case NAVIGATE_SETUP_1_INVITE_TEAM:
                    return (
                      <Setup1InviteTeam
                        dispatch={dispatch}
                        setup={setup}
                      />
                    );
                  case NAVIGATE_SETUP_2_INVITE_TEAM:
                    return (
                      <Setup2InviteTeam
                        dispatch={dispatch}
                        setup={setup}
                        team={team}
                      />
                    );
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
              {/* <SetupField /> */}
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
