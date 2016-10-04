import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    title,
    styles
  } = props;
  const hasNotification = activeMeetings.length > 0;
  return (
    <div className={css(styles.root)}>
      <Helmet title={title} {...head} />
      {hasNotification && <NotificationBar activeMeetings={activeMeetings} />}
      <div className={css(styles.main)}>
        {children}
      </div>
    </div>
  );
};

DashLayout.propTypes = {
  activeMeetings: PropTypes.array.isRequired,
  children: PropTypes.any,
  styles: PropTypes.object,
  title: PropTypes.string
};


const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flexDirection: 'column',
    minHeight: '100vh'
  },

  main: {
    display: 'flex !important',
    flex: 1,
    position: 'relative'
  },
});

export default withStyles(styleThunk)(DashLayout);
