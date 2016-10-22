import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Action from 'universal/components/Action/Action';
import {injectStyleOnce} from 'aphrodite-local-styles/lib/inject';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import {segmentEventPage} from 'universal/redux/segmentActions';

const updateAnalyticsPage = (dispatch, lastPage, nextPage) => {
  if (typeof document === 'undefined') return;
  const name = document && document.title || '';
  const properties = {
    title: name,
    referrer: lastPage,
    path: nextPage
  };
  dispatch(segmentEventPage(name, null, properties));
};

@connect()
export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    const {dispatch, location: {pathname: nextPage}} = this.props;
    updateAnalyticsPage(dispatch, '', nextPage);
    injectGlobals(injectStyleOnce, globalStyles);
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, location: {pathname: lastPage}} = this.props;
    const {location: {pathname: nextPage}} = nextProps;
    if (lastPage !== nextPage) {
      updateAnalyticsPage(dispatch, lastPage, nextPage);
    }
  }

  render() {
    return <Action {...this.props} />;
  }
}
