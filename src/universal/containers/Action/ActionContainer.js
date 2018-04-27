import {injectGlobal} from 'react-emotion';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Action from 'universal/components/Action/Action';
import globalStyles from 'universal/styles/theme/globalStyles';
import * as E from 'emotion-server';
import A from 'universal/Atmosphere';

const analytics = {
  lastPath: '',
  title: ''
};

@withRouter
class ActionContainer extends Component {
  static childContextTypes = {
    analytics: PropTypes.shape({
      lastPath: PropTypes.string,
      title: PropTypes.string
    })
  };

  static propTypes = {
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.object
  };

  constructor(props) {
    super(props);
    injectGlobal(globalStyles);
  }

  getChildContext() {
    return {analytics};
  }

  componentWillReceiveProps() {
    /*
     * mutative. handling context any other way is just dangerous
     * segment wants params by name (eg teamId, orgId) but those
     * are not known until we hit the leaf routes
     * so we need to pass in the analytics
     * so the leaf routes can use that as a referrer
     */
    analytics.lastPath = this.props.location.pathname;
  }

  render() {
    return <Action {...this.props} />;
  }
}

export default ActionContainer;
export const Atmosphere = A;
export const EmotionServer = E;
