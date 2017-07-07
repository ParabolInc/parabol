import PropTypes from 'prop-types';
import React, { Component } from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

export default (subscribeThunk) => (ComposedComponent) => {
  class WithSubscriptions extends Component {
    static contextTypes = {
      store: PropTypes.object
    };
    static displayName = `WithSubscriptions(${getDisplayName(ComposedComponent)})`;

    componentDidMount() {
      this.unsubscribe = subscribeThunk(this.props);
    }

    componentWillUnmount() {
      console.log('unmounting', this.unsubscribe)
      this.unsubscribe();
    }
    render() {
      return <ComposedComponent {...this.props} unsubscribe={this.unsubscribe} />;
    }
  }
  return WithSubscriptions;
};
