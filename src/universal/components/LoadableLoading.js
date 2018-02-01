import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner';
import withStyles from 'universal/styles/withStyles';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';

/*
 * A component to handle the loading, long loading, and error states for react-loadable
 * The below shows a blue spinner while webpack chunk is being fetched
 * If loading takes a long time (timedOut) then the spinner turns red
 * If there is an error, such as a disconnect, an error message will appear
 * Easy to test in chrome by setting Network speed
 */

const LoadableLoading = (props) => {
  const {error, timedOut, pastDelay, spinnerSize = 40, styles, width, height} = props;
  if (!error && !pastDelay && !timedOut) return <div />;
  if (error) {
    return <ErrorComponent error={error} width={width} height={height} />;
  }
  return (
    <div className={css(styles.loadingComponent)} style={{width, height}}>
      <Spinner fillColor={timedOut ? 'warm' : 'cool'} width={spinnerSize} />
    </div>
  );
};

LoadableLoading.propTypes = {
  error: PropTypes.string,
  timedOut: PropTypes.bool,
  pastDelay: PropTypes.bool,
  spinnerSize: PropTypes.number,
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
  loadingComponent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default withStyles(styleThunk)(LoadableLoading);
