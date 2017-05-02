import PropTypes from 'prop-types';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
// import routesFactory from 'universal/routes/index';
import ActionContainer from 'universal/containers/Action/ActionContainer';

export default function Root({store}) {
  // const routes = routesFactory(store);
  return (
    <Provider store={store}>
      <div>
        <Router>
          <ActionContainer/>
        </Router>
      </div>
    </Provider>
  );
}

Root.propTypes = {
  store: PropTypes.object.isRequired
};
