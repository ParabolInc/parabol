import React from 'react';
import {Route} from 'react-router-dom';
import PropTypes from 'prop-types';
import Bundle from "../Bundle/Bundle";

const AsyncRoute = ({mod, exact, path, isPrivate, ...extra}) => (
  <Route exact={exact} path={path}
    render={({history, location, match}) => (
      <Bundle extra={extra} history={history} isPrivate={isPrivate} location={location} match={match} mod={mod}/>
    )}
  />
);

AsyncRoute.propTypes = {
  extra: PropTypes.object,
  mod: PropTypes.func.isRequired
};

export default AsyncRoute;
