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
    bottom: PropTypes.bool,
    extraProps: PropTypes.object,
    history: PropTypes.object.isRequired,
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
    const {location: {pathname: nextPath}, bottom, match: {params}} = this.props;
    if (bottom === true) {
      const {store: {dispatch}, previousLocation: {lastPath}} = this.context;
      updateAnalyticsPage(dispatch, lastPath, nextPath, params);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {bottom, mod} = nextProps;
    if (mod !== this.props.mod) {
      this.loadMod(nextProps);
    }
    if (bottom === true) {
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
