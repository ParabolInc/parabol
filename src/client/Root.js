import React from 'react';
import {Presets, Plugins, LookRoot} from 'react-look';
import {Router, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import routesFactory from 'universal/routes/index';

const lookConfig = Presets['react-dom'];
lookConfig.styleElementId = '_look';

if (!__PRODUCTION__) {
  lookConfig.plugins.push(Plugins.friendlyClassName);
}

export default function Root({store}) {
  const routes = routesFactory(store);
  return (
    <LookRoot config={lookConfig}>
      <Provider store={store}>
        <div>
          <Router history={browserHistory} routes={routes} />
        </div>
      </Provider>
    </LookRoot>
  );
}

Root.propTypes = {
  store: React.PropTypes.object.isRequired
};
