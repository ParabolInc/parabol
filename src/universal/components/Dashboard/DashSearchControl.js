import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const DashSearchControl = (props) => {
  const {onChange, placeholder, styles} = props;
  return (
    <input
      className={css(styles.dashSearchInput)}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

DashSearchControl.propTypes = {
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  dashSearchInput: {
    appearance: 'none',
    display: 'block',
    border: 0,
    fontSize: '1.25rem',
    outline: 'none',
    padding: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(DashSearchControl);
