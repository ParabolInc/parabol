import React, {PropTypes, Component} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import layoutStyle from 'universal/styles/layout';
import Notifications from 'universal/modules/notifications/containers/Notifications/Notifications';
import {injectStyleOnce} from 'aphrodite/lib/inject';
import {injectGlobals} from 'hepha';
import globalStyles from 'universal/styles/theme/globalStyles';

const Action = (props) => {
  const {children, styles} = props;
  injectGlobals(injectStyleOnce, globalStyles);
  return (
    <div className={css(styles.app)}>
      <Notifications />
      {children}
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
    maxWidth: layoutStyle.maxWidth,
    minHeight: '100vh',
    padding: 0
  }
});

export default withStyles(styleThunk)(Action);
