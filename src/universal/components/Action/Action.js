import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import {Route} from 'react-router-dom';
import LandingBundle from 'universal/modules/landing/containers/Landing/LandingBundle';
import WelcomeBundle from 'universal/modules/welcome/containers/Welcome/WelcomeBundle';

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <Route exact path="/" component={LandingBundle} />
      <Route path="/welcome" component={WelcomeBundle} />
    </div>
  );
};

Action.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  app: {
    margin: 0,
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(Action);
