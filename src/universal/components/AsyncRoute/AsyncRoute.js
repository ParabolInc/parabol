import React from 'react';
import {Route} from 'react-router-dom';
import PropTypes from 'prop-types';
import Bundle from '../Bundle/Bundle';

const AsyncRoute = ({mod, exact, path, isAbstract, isPrivate, extraProps}) => {
  return (
    <Route
      exact={exact}
      path={path}
      render={({history, location, match}) => (
        <Bundle
          isAbstractRoute={isAbstract}
          extraProps={extraProps}
          history={history}
          isPrivate={isPrivate}
          location={location}
          match={match}
          mod={mod}
        />
      )}
    />
  );
};

AsyncRoute.propTypes = {
  exact: PropTypes.bool,
  extraProps: PropTypes.object,
  isAbstract: PropTypes.bool,
  isPrivate: PropTypes.bool,
  mod: PropTypes.func.isRequired,
  path: PropTypes.string
};

export default AsyncRoute;
