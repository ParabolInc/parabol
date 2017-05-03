import React from 'react';
import {Route} from 'react-router-dom';
import PropTypes from 'prop-types';

const RouteWithProps = ({component: Component, extraProps, ...rest}) => (
  <Route {...rest} render={(routeProps) => <Component {...routeProps} extraProps={extraProps} />} />
);

RouteWithProps.propTypes = {
  component: PropTypes.any.isRequired,
  extraProps: PropTypes.object.isRequired
};

export default RouteWithProps;
