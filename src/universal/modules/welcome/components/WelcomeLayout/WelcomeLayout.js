import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const WelcomeLayout = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};
WelcomeLayout.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignContent: 'center',
    backgroundColor: '#fff',
    display: 'flex !important',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '0',
    minHeight: '100vh',
    padding: '0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(WelcomeLayout);
