import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Action from 'universal/components/Action/Action';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import {segmentEventPage} from 'universal/redux/segmentActions';

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
    injectGlobals(globalStyles);
  }

  componentDidUpdate(prevProps) {
    const {location: {pathname: lastPage}} = prevProps;
    const {dispatch, location: {pathname: nextPage}} = this.props;
    if (lastPage !== nextPage) {
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
