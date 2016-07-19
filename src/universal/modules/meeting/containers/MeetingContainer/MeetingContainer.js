import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {HotKeys} from 'react-hotkeys';
import {cashay} from 'cashay';

import {teamQueryString, teamQueryOptions} from './cashayHelpers';

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

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/'
};


const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  console.log(teamId);
  console.log(teamQueryOptions(teamId));
  return {
    authToken: state.authToken,
    team: cashay.query(teamQueryString, teamQueryOptions(teamId))
  };
};

@connect(mapStateToProps)
export default class MeetingContainer extends Component {
  static propTypes = {
    authToken: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    team: PropTypes.object
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
    const {team} = this.props;
    console.log(team);
    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        <div>Narf!</div>
      </HotKeys>
    );
  }
}
