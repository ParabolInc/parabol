import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';

import withStyles from 'universal/styles/withStyles';

const PlainButton = ({styles, extraStyles, ...props}) => (
  <button
    className={
      extraStyles
        ? css(styles.root, extraStyles)
        : css(styles.root)
    }
    {...props}
  >
    {props.children}
  </button>
);

PlainButton.propTypes = {
  children: PropTypes.node,
  extraStyles: PropTypes.object,
  styles: PropTypes.object.isRequired
};

const styleThunk = () => ({
  root: {
    appearance: 'none',
    background: 'inherit',
    border: 0,
    borderRadius: 0,
    margin: 0,
    padding: 0
  }
});

export default withStyles(styleThunk)(PlainButton);
