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
  styles: PropTypes.object
};

const styleThunk = () => ({
  fieldBlock: {
    margin: '0 auto',
    maxWidth: '100%',
    minWidth: '20rem'
  }
});

export default withStyles(styleThunk)(FieldBlock);
