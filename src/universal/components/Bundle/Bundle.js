import PropTypes from 'prop-types';
import React, {Component} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {segmentEventPage} from 'universal/redux/segmentActions';

const updateAnalyticsPage = (dispatch, lastPath, nextPath, title, params) => {
  if (typeof document === 'undefined' || typeof window.analytics === 'undefined') return;
  const properties = {
    title,
    referrer: lastPath,
    path: nextPath,
    params
  };
  dispatch(segmentEventPage(name, null, properties));
};

class Bundle extends Component {
  static contextTypes = {
    analytics: PropTypes.object,
    store: PropTypes.object
  };

  static propTypes = {
    extraProps: PropTypes.object,
    history: PropTypes.object.isRequired,
    isAbstractRoute: PropTypes.bool,
    isPrivate: PropTypes.bool,
    location: PropTypes.object.isRequired,
    match: PropTypes.object,
    mod: PropTypes.func.isRequired
  };

  state = {
    mod: null
  };

  componentWillMount() {
    this.loadMod(this.props);
  }

  componentDidMount() {
    const {location: {pathname: nextPath}, isAbstractRoute, match: {params}} = this.props;
    if (!isAbstractRoute) {
      const {store: {dispatch}} = this.context;
      // can't use setTimeout, since react rendering is not guaranteed sync
      // use requestIdleCallback to ensure that rendering eg '/me' has completed
      window.requestIdleCallback(() => {
        const {analytics: {lastPath, title}} = this.context;
        updateAnalyticsPage(dispatch, lastPath, nextPath, title, params);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {mod} = nextProps;
    if (mod !== this.props.mod) {
      this.loadMod(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    // use cDU to allow helmet to update the document title for the subcomponents
    const {isAbstractRoute} = this.props;
    if (!isAbstractRoute) {
      const {location: {pathname: nextPath}, match: {params}} = this.props;
      const {location: {pathname: lastPath}} = prevProps;
      if (lastPath !== nextPath) {
        const {store: {dispatch}, analytics: {title}} = this.context;
        updateAnalyticsPage(dispatch, lastPath, nextPath, title, params);
      }
    }
  }

  loadMod(props) {
    this.setState({Mod: null});
    const {isPrivate, mod} = props;
    mod().then((res) => {
      let component = res.default;
      if (isPrivate) {
        component = requireAuth(component);
      }
      this.setState({
        Mod: component
      });
    });
  }

  render() {
    const {Mod} = this.state;
    if (!Mod) return null;
    const {history, location, match, extraProps} = this.props;
    return <Mod {...extraProps} history={history} location={location} match={match} />;
  }
}

export default Bundle;
