import React, {Component, PropTypes} from 'react';
import Action from 'universal/components/Action/Action';
import {injectStyleOnce} from 'aphrodite-local-styles/lib/inject';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';

const updateAnalyticsPage = (lastPage, nextPage) => {
  if (typeof window !== 'undefined' &&
    typeof window.analytics !== 'undefined') {
    try {
      const traits = window.analytics && window.analytics.user().traits();
      const props = Object.assign({}, traits, {
        title: document && document.title || '',
        referrer: lastPage,
        path: nextPage
      });
      const options = Object.assign({}, { context: { traits } });
      // track the page view for the user:
      window.analytics.page('', nextPage, props, options);
    } catch (e) {
      console.warn(`call to analytics.js failed: ${e}`);
    }
  }
};

export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    const {location: {pathname: nextPage}} = this.props;
    updateAnalyticsPage('', nextPage);
    injectGlobals(injectStyleOnce, globalStyles);
  }

  componentWillReceiveProps(nextProps) {
    const {location: {pathname: lastPage}} = this.props;
    const {location: {pathname: nextPage}} = nextProps;
    if (lastPage !== nextPage) {
      updateAnalyticsPage(lastPage, nextPage);
    }
  }

  render() {
    return <Action {...this.props} />;
  }
}
