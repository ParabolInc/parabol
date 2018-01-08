import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

export default (subscription, options = {}) => (ComposedComponent) => {
  class WithSubscriptions extends Component {
    static contextTypes = {
      atmosphere: PropTypes.object,
      store: PropTypes.object
    };
    static displayName = `WithSubscriptions(${getDisplayName(ComposedComponent)})`;
    static timeouts = {};

    componentDidMount() {
      const {unsubDelay, unsubKey} = options;
      this._queryKey = unsubKey ? unsubKey(this.props) : WithSubscriptions.displayName;
      if (unsubDelay) {
        const {displayName, timeouts} = WithSubscriptions;
        const key = unsubKey ? unsubKey(this.props) : displayName;
        clearTimeout(timeouts[key]);
        delete timeouts[key];
      }
      const {atmosphere} = this.context;
      const maybeKeyArray = subscription(atmosphere, null, this.props);
      // TODO fixme when we use this
      // atmosphere.registerQuery(this._queryKey, subscriptions, subParams, variables, this.releaseComponent);
      const keyArray = Array.isArray(maybeKeyArray) ? maybeKeyArray : [maybeKeyArray];
      keyArray.forEach((subKey) => atmosphere.safeSocketUnsubscribe(subKey));
    }

    componentWillUnmount() {
      // by default, never unsub! Keeping a little extra state on the server is far cheaper than a refetch
      const {unsubDelay, unsubKey} = options;

      // setTimeout has a signed 32bit max
      if (unsubDelay <= 2147483647) {
        const {displayName, timeouts} = WithSubscriptions;
        const key = unsubKey ? unsubKey(this.props) : displayName;
        timeouts[key] = setTimeout(() => {
          this.unsubscribe();
          delete timeouts[key];
        }, unsubDelay);
      }
    }

    render() {
      return <ComposedComponent {...this.props} unsubscribe={this.unsubscribe} />;
    }
  }
  return WithSubscriptions;
};
