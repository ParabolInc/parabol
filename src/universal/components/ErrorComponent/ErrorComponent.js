import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';

const defaultMessage = 'An error has occurred! We’ll alert the developers. Try refreshing the page';
const LoadingComponent = (props) => {
  const {error, styles} = props;
  console.error(error);
  // raven.captureException(error.);
  return (
    <div className={css(styles.errorComponent)}>
      <div>{defaultMessage}</div>
      {/* <div>Error: {error}</div> */}
    </div>
  );
};

LoadingComponent.propTypes = {
  error: PropTypes.object,
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  styles: PropTypes.object
};

const styleThunk = () => ({
  errorComponent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%'
  }
});

export default withStyles(styleThunk)(LoadingComponent);
