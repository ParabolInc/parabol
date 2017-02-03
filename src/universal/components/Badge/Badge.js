import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const Badge = (props) => {
  const {
    styles,
    value
  } = props;

  return (
    <div className={css(styles.badge)}>
      {value}
    </div>
  );
};

Badge.propTypes = {
  colorPalette: PropTypes.oneOf([
    'cool',
    'dark',
    'mid',
    'warm'
  ]),
  styles: PropTypes.object,
  value: PropTypes.number
};

Badge.defaultProps = {
  value: 0
};

const styleThunk = (customTheme, {colorPalette}) => ({
  badge: {
    backgroundColor: appTheme.palette[colorPalette] || appTheme.palette.warm,
    borderRadius: '1rem',
    boxShadow: '1px 1px 2px rgba(0, 0, 0, .5)',
    color: '#fff',
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    height: '1rem',
    lineHeight: '1rem',
    minWidth: '1rem',
    padding: '0 .25rem',
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(Badge);
