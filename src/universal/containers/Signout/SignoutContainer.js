import PropTypes from 'prop-types';
import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import signout from './signout';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

class SignoutContainer extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {store: {dispatch}} = this.context;
    const {atmosphere, history} = this.props;
    signout(atmosphere, dispatch, history);
  }

  render() { return null; }
}

export default withAtmosphere(SignoutContainer);
