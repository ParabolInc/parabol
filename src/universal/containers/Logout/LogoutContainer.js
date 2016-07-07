import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {show} from 'universal/modules/notifications/ducks/notifications';
import {removeAuthToken} from 'universal/redux/authDuck';

const logoutSuccess = {
  title: 'Tootles!',
  message: 'You\'ve been logged out successfully.',
  level: 'success'
};

@connect()
export default class LogoutContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {dispatch} = this.props;
    dispatch((thunkDispatch) => Promise.all([
      thunkDispatch(removeAuthToken()),
      thunkDispatch(push('/')),
      thunkDispatch(show(logoutSuccess))
    ]));
  }

  render() { return <div/>; }
}
