import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const DashAlert = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.bar)}>
      {children}
    </div>
  );
};

DashAlert.propTypes = {
  children: PropTypes.any,
  colorPalette: PropTypes.oneOf([
    'cool',
    'warm',
    'dark',
    'mid',
    'light'
  ]),
  styles: PropTypes.object
};

const styleThunk = (customTheme, props) => ({
  bar: {
    backgroundColor: appTheme.palette[props.colorPalette],
    color: '#fff', // NOTE: Override this with nested components (TA)
    fontSize: appTheme.typography.s4,
    lineHeight: '1.375rem',
    padding: '.625rem 1rem',
    textAlign: 'center',
    width: '100%'
  }
});

export default withStyles(styleThunk)(DashAlert);
