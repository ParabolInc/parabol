import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider';
import ActionContainer from 'universal/containers/Action/ActionContainer';

export default function Root({store, atmosphere}) {
  return (
    <Provider store={store}>
      <AtmosphereProvider atmosphere={atmosphere}>
        <Router>
          <ActionContainer />
        </Router>
      </AtmosphereProvider>
    </Provider>
  );
}

Root.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};
