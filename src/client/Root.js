import React, {Component} from 'react';
import { Presets, LookRoot } from 'react-look';
import {Router, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import routes from '../universal/routes/index';
import {syncHistoryWithStore} from 'react-router-redux';
import {ensureState} from 'redux-optimistic-ui';

const lookConfig = Presets['react-dom'];
lookConfig.styleElementId = '_look';

export default class Root extends Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  }

  render() {
    const {store} = this.props;
    const history = syncHistoryWithStore(browserHistory, store, {selectLocationState: state => ensureState(state).get('routing')});
    return (
      <LookRoot config={lookConfig}>
        <Provider store={store}>
          <div>
            <Router history={history} routes={routes(store)}/>
          </div>
        </Provider>
      </LookRoot>
    );
  }
}
