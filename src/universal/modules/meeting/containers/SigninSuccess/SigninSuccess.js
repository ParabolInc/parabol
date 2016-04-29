import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {createMeetingAndRedirect} from 'universal/modules/meeting/ducks/meeting';

const SIGNIN_ACTION_CREATE_MEETING = 'createmeeting';

const mapStateToProps = state => ({
  meeting: state.getIn(['meeting', 'instance'])
});
// @connectData(fetchData)
@connect(mapStateToProps)
export default class SigninSuccess extends Component {
  static propTypes = {
    meeting: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  componentWillMount() {
    // TODO if meeting exists in client cache, do something (go to it? check credentials?)
    const {dispatch, params, meeting} = this.props; // eslint-disable-line no-unused-vars
    const {action} = params || {};
    switch (action) {
      case SIGNIN_ACTION_CREATE_MEETING:
        dispatch(createMeetingAndRedirect());
        break;
      default:
        dispatch(push('/404'));
    }
  }
  render() {
    return (
      <div>
        Engaging warp drive...
      </div>
    );
  }
}
