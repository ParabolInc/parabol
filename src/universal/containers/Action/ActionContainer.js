import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Action from 'universal/components/Action/Action';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import {segmentEventPage} from 'universal/redux/segmentActions';
import {withRouter} from 'react-router-dom';

const updateAnalyticsPage = (dispatch, lastPage, nextPage) => {
  if (typeof document === 'undefined' || typeof window.analytics === 'undefined') return;
  const name = document && document.title || '';
  const properties = {
    title: name,
    referrer: lastPage,
    path: nextPage
  };
  dispatch(segmentEventPage(name, null, properties));
};

@withRouter
export default class ActionContainer extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.object
  };

  componentWillMount() {
    const {dispatch} = this.context.store;
    const {location: {pathname: nextPage}} = this.props;
    updateAnalyticsPage(dispatch, '', nextPage);
    injectGlobals(globalStyles);
  }

  componentDidUpdate(prevProps) {
    const {location: {pathname: lastPage}} = prevProps;
    const {location: {pathname: nextPage}} = this.props;
    console.log('loc', this.props)
    if (lastPage !== nextPage) {
      const {dispatch} = this.context.store;
      /*
       * Perform page update after component renders. That way,
       * document.title will be current after any child <Helmet />
       * element(s) are rendered.
       */
      updateAnalyticsPage(dispatch, lastPage, nextPage);
    }
  }

  render() {
    return <Action {...this.props} />;
  }
}
