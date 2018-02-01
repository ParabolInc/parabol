import PropTypes from 'prop-types';
import React, {Component} from 'react';
import makeReducer from 'universal/redux/makeReducer';

export default (reducerObj) => (ComposedComponent) => {
  class WithReducer extends Component {
    static contextTypes = {
      store: PropTypes.object
    };

    componentWillMount() {
      const {store} = this.context;
      const newReducers = makeReducer(reducerObj);
      store.replaceReducer(newReducers);
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }
  return WithReducer;
};
