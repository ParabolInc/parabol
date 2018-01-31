import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withStyles from 'universal/styles/withStyles';

class PlainButton extends Component {
  componentDidMount() {
    this.focus();
  }

  componentDidUpdate() {
    this.focus();
  }

  focus = () => {
    if (this.el && this.props.isActive) {
      this.el.focus();
    }
  }

  render() {
    const {styles, extraStyles, ...props} = this.props;
    const justButtonProps = { ...props };
    delete justButtonProps.isActive;
    return (
      <button
        className={
          extraStyles
            ? css(styles.root, ...(Array.isArray(extraStyles) ? extraStyles : [extraStyles]))
            : css(styles.root)
        }
        ref={(el) => { this.el = el; }}
        {...justButtonProps}
      >
        {props.children}
      </button>
    );
  }
}



PlainButton.propTypes = {
  children: PropTypes.node,
  extraStyles: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isActive: PropTypes.bool,
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
