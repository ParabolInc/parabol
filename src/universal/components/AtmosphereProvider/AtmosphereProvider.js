import PropTypes from 'prop-types';
import React, {Children, Component} from 'react';
import Atmosphere from 'universal/Atmosphere';

let atmosphere = new Atmosphere();

export const resetAtmosphere = () => {
  atmosphere = new Atmosphere();
};

class AtmosphereProvider extends Component {
  static childContextTypes = {
    atmosphere: PropTypes.object
  };

  static propTypes = {
    children: PropTypes.element.isRequired
  };

  getChildContext() {
    return {
      atmosphere
    };
  }

  constructor(props) {
    super(props);
    if (__CLIENT__) {
      atmosphere.getAuthToken(window);
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default AtmosphereProvider;
