import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

export default (ComposedComponent) => {
  // eslint-disable-next-line react/prefer-stateless-function
  return class WithAtmosphere extends Component {
    static contextTypes = {
      atmosphere: PropTypes.object
    };
    static displayName = `WithAtmosphere(${getDisplayName(ComposedComponent)})`;

    render() {
      const {atmosphere} = this.context;
      return <ComposedComponent {...this.props} atmosphere={atmosphere} />;
    }
  };
};
