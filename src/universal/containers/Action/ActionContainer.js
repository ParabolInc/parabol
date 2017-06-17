import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Action from 'universal/components/Action/Action';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import {withRouter} from 'react-router-dom';

const previousLocation = {
  lastPath: ''
};

@withRouter
export default class ActionContainer extends Component {
  static childContextTypes = {
    previousLocation: PropTypes.object
  };

  static propTypes = {
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.object
  };

  getChildContext() {
    return {previousLocation};
  }

  componentWillMount() {
    injectGlobals(globalStyles);
  }

  componentWillReceiveProps() {
    // mutative. handling context any other way is just dangerous
    previousLocation.lastPath = this.props.location.pathname;
  }

  render() {
    return <Action {...this.props} />;
  }
}
