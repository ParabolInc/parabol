import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const defaultMessage = 'An error has occurred! We’ll alert the developers. Try refreshing the page';
const LoadingComponent = (props) => {
  const {error, styles} = props;
  console.error(error);
  // raven.captureException(error.);
  return (
    <div className={css(styles.errorComponent)}>
      <div>{defaultMessage}</div>
      {/* <div>Error: {error._error}</div> */}
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

const styleThunk = (theme, {width = ui.settingsPanelMaxWidth, height = '20rem'}) => ({
  errorComponent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: height,
    textAlign: 'center',
    width
  }
});

export default withStyles(styleThunk)(LoadingComponent);
