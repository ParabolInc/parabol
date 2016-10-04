import React, {Component, PropTypes} from 'react';
import Action from 'universal/components/Action/Action';

const updateAnalyticsPage = (lastPage, nextPage) => {
  if (typeof window !== 'undefined' &&
    typeof window.analytics !== 'undefined') {
    window.analytics.page('', nextPage, {
      title: document && document.title || '',
      referrer: lastPage,
      path: nextPage
    });
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
