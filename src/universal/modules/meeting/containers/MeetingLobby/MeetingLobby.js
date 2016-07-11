import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {HotKeys} from 'react-hotkeys';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

import AuthEngine from 'universal/redux/AuthEngine';

let styles = {};

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/'
};

const mapStateToProps = state => ({
  authToken: state.authToken
});

@connect(mapStateToProps)
@requireAuth()
@reduxSocket({}, {AuthEngine})
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
    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div className={styles.viewport}>
          <div className={styles.main}>
            <div className={styles.contentGroup}>
              HI GUY
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
