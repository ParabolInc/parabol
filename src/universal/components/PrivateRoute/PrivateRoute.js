import React from 'react';
import {Route} from 'react-router-dom';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import PropTypes from 'prop-types';

const PrivateRoute = ({component, ...rest}) => {
  const Component = requireAuth(component);
  return <Route {...rest} render={(routeProps) => <Component {...routeProps} />} />;
};

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired
};


export default PrivateRoute;
