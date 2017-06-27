import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Action from 'universal/components/Action/Action';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';

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
    /*
     * mutative. handling context any other way is just dangerous
     * segment wants params by name (eg teamId, orgId) but those
     * are not known until we hit the leaf routes
     * so we need to pass in the previousLocation
     * so the leaf routes can use that as a referrer
     */
    previousLocation.lastPath = this.props.location.pathname;
  }

  render() {
    return <Action {...this.props} />;
  }
}
