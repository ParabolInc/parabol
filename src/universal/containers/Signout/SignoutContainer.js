import PropTypes from 'prop-types';
import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import signout from './signout';

export default class SignoutContainer extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    history: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {store: {dispatch}} = this.context;
    const {history} = this.props;
    signout(dispatch, history);
  }

  render() { return null; }
}
