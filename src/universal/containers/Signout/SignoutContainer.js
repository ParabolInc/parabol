import PropTypes from 'prop-types';
import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import signout from './signout';


@connect()
@withRouter
export default class SignoutContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {dispatch, router} = this.props;
    signout(dispatch, router);
  }

  render() { return null; }
}
