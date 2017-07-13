import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

const defaultMessage = 'An error has occurred! We\'ll alert the developers. Try refreshing the page';
const LoadingComponent = (props) => {
  const {error, styles} = props;
  throw error;
  return (
    <div className={css(styles.errorComponent)}>
      <div>{defaultMessage}</div>
      <div>Error: {error.message}</div>
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
    width
  }
});

export default withStyles(styleThunk)(LoadingComponent);
