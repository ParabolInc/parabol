import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

const WelcomeHeader = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

WelcomeHeader.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignContent: 'center',
    display: 'flex !important',
    flex: '1',
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '64rem',
    padding: '4rem',
    position: 'relative'
  }
});

export default withStyles(styleThunk)(WelcomeHeader);
