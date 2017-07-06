import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const FieldBlock = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.fieldBlock)}>
      {children}
    </div>
  );
};

FieldBlock.propTypes = {
  children: PropTypes.any,
  maxWidth: PropTypes.string,
  styles: PropTypes.object,
  width: PropTypes.string
};

const styleThunk = (custom, {maxWidth, width}) => ({
  fieldBlock: {
    margin: '0 auto',
    maxWidth: maxWidth || '20rem',
    width: width || '100%'
  }
});

export default withStyles(styleThunk)(FieldBlock);
