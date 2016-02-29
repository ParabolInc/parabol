import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import connectData from 'helpers/connectData';
import { pushState } from 'redux-router';
import { setSigninAction } from 'redux/modules/auth';
import * as meetingActions from 'redux/modules/meeting';

const SIGNIN_ACTION_CREATE_MEETING = 'createmeeting';
const SIGNIN_ACTION_404 = '404';

async function fetchData(getState, dispatch, location, params) { // eslint-disable-line no-unused-vars
  await dispatch(setSigninAction(params.action));
  switch (params.action) {
    case SIGNIN_ACTION_CREATE_MEETING:
      await dispatch(meetingActions.create());
      break;
    default:
      await dispatch(setSigninAction(SIGNIN_ACTION_404));
  }
}
@connectData(fetchData)
@connect(
  state => ({
    meeting: state.meeting.instance,
    signinAction: state.auth.signinAction
  }),
  {pushState})
export default class SigninSuccess extends Component {
  static propTypes = {
    meeting: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    signinAction: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const { props } = this;

    switch (props.signinAction) {
      case SIGNIN_ACTION_CREATE_MEETING:
        const { meeting } = this.props;
        props.pushState(null, '/meeting/' + meeting.id);
        break;
      default:
        // TODO: redirect to a real error:
        props.pushState(null, '/signin/404');
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
