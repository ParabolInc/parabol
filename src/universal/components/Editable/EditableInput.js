import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const EditableInput = (props) => {
  const {autoFocus, handleSubmit, input, inputStyles, meta: {error}, styles, submitOnBlur} = props;
  const handleBlur = (e) => {
    // if we don't submit on the blur, or there are errors, then blur
    if (!submitOnBlur || !handleSubmit(e)) {
      input.onBlur();
    }
  };
  return (
    <div>
      <input
        {...input}
        autoFocus={autoFocus}
        className={inputStyles}
        onBlur={handleBlur}
      />
      <div className={css(styles.error)}>{error}</div>
    </div>
  );
};

const styleThunk = (customTheme, props) => ({
  error: {
    color: appTheme.palette.warm,
    fontSize: '.85rem'
  }
});

export default withStyles(styleThunk)(EditableInput)
