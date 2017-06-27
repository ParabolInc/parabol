import React, {Component} from 'react';
import PropTypes from 'prop-types';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {segmentEventPage} from 'universal/redux/segmentActions';

const updateAnalyticsPage = (dispatch, lastPath, nextPath, params) => {
  if (typeof document === 'undefined' || typeof window.analytics === 'undefined') return;
  const name = document && document.title || '';
  const properties = {
    title: name,
    referrer: lastPath,
    path: nextPath,
    params
  };
  dispatch(segmentEventPage(name, null, properties));
};

class Bundle extends Component {
  static contextTypes = {
    store: PropTypes.object,
    previousLocation: PropTypes.object
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
    const {location: {pathname: nextPath}, isAbstractRoute, match: {params}} = this.props;
    if (!isAbstractRoute) {
      const {store: {dispatch}, previousLocation: {lastPath}} = this.context;
      updateAnalyticsPage(dispatch, lastPath, nextPath, params);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {isAbstractRoute, mod} = nextProps;
    if (mod !== this.props.mod) {
      this.loadMod(nextProps);
    }
    if (!isAbstractRoute) {
      const {location: {pathname: nextPath}, match: {params}} = nextProps;
      const {location: {pathname: lastPath}} = this.props;
      if (lastPath !== nextPath) {
        updateAnalyticsPage(this.context.store.dispatch, lastPath, nextPath, params);
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
