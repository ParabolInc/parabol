import React from 'react';
import {Router, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import routesFactory from 'universal/routes/index';


export default function Root({store}) {
  const routes = routesFactory(store);
  return (
    <Provider store={store}>
      <div>
        <Router history={browserHistory} routes={routes}/>
      </div>
    </Provider>
  );
}

Root.propTypes = {
  store: React.PropTypes.object.isRequired
};
