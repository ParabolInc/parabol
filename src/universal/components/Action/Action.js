import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Notifications from 'universal/modules/notifications/containers/Notifications/Notifications';

const Action = (props) => {
  const {children, styles} = props;
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
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(Action);
