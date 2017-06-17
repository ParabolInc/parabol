import React from 'react';
import {Route} from 'react-router-dom';
import PropTypes from 'prop-types';
import Bundle from '../Bundle/Bundle';

const AsyncRoute = ({mod, exact, path, isPrivate, bottom, extraProps}) => {
  return (
    <Route
      exact={exact} path={path}
      render={({history, location, match}) => (
        <Bundle
          bottom={bottom}
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
  bottom: PropTypes.bool,
  exact: PropTypes.bool,
  extraProps: PropTypes.object,
  isPrivate: PropTypes.bool,
  mod: PropTypes.func.isRequired,
  path: PropTypes.string
};

export default AsyncRoute;
