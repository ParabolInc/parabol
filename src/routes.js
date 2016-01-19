import React from 'react';
import { IndexRoute, Route } from 'react-router';
// import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import {
    App,
    LandingLayout,
    Login,
    AppLayout,
    MeetingLayout,
/*    LoginSuccess, */
    NotFound,
  } from 'containers';

export default (store) => { // eslint-disable-line
  /*
  const requireLogin = (nextState, replaceState, cb) => {
    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        // oops, not logged in, so can't be here!
        replaceState(null, '/');
      }
      cb();
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth);
    } else {
      checkAuth();
    }
  };
  */

  /**
   * Please keep routes in alphabetical order
   */
  /**
   * NB, a reminder on how to require authentication:
   *
   *  <Route onEnter={requireLogin}>
   *    <Route path="chat" component={Chat}/>
   *    <Route path="loginSuccess" component={LoginSuccess}/>
   *  </Route>
   */
  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={LandingLayout}/>

      <Route path="meeting/:id" component={MeetingLayout} />
      <Route path="applayout" component={AppLayout} />

      { /* Routes requiring login */ }

      { /* Routes */ }
      <Route path="login" component={Login}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
