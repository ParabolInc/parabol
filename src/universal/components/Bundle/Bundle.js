import React, {Component} from 'react';
import PropTypes from 'prop-types';
import promiseAllObj from 'universal/utils/promiseAllObj';
import makeReducer from 'universal/redux/makeReducer';

class Bundle extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    match: PropTypes.object,
    promises: PropTypes.object.isRequired
  };

  state = {
    mod: null
  };

  async componentWillMount() {
    const {promises} = this.props;
    const {component, ...asyncReducers} = await promiseAllObj(promises);
    if (Object.keys(asyncReducers).length > 0) {
      const {store} = this.context;
      const newReducers = makeReducer(asyncReducers);
      store.replaceReducer(newReducers);
    }
    this.setState({
      Mod: component
    });
  }

  render() {
    const {Mod} = this.state;
    const {match} = this.props;
    return Mod ? <Mod match={match}/> : null;
  }
}

export default Bundle;
