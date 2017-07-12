import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

const LoadingComponent = (props) => {
  const {spinnerSize = 40, styles} = props;

  return (
    <div className={css(styles.loadingComponent)}>
      <Spinner fillColor="cool" width={spinnerSize}/>
    </div>
  );
};

LoadingComponent.propTypes = {
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

const styleThunk = (theme, {width = ui.settingsPanelMaxWidth, height = '20rem'}) => ({
  loadingComponent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height,
    width
  }
});

export default withStyles(styleThunk)(LoadingComponent);
