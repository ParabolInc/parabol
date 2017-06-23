import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';

const PlainInputField = (props) => {
  const {
    autoFocus,
    colorPalette,
    disabled,
    input,
    meta: {touched, error},
    placeholder,
    styles,
    spellCheck = true
  } = props;

  const inputStyles = css(
    // allow hotkeys to be triggered when inside a field input
    styles.field,
    colorPalette ? styles[colorPalette] : styles.white,
    // !disabled && styles.boxShadow,
    disabled && styles.disabled,
  );

  return (
    <FieldBlock>
      <div className={css(styles.inputBlock)}>
        <input
          {...input}
          spellCheck={spellCheck}
          autoFocus={autoFocus}
          className={inputStyles}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
      {touched && error && <FieldHelpText hasErrorText helpText={error} />}
    </FieldBlock>
  );
};

PlainInputField.propTypes = {
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  spellCheck: PropTypes.bool,
  styles: PropTypes.object,
  colorPalette: PropTypes.oneOf([
    'cool',
    'gray',
    'link',
    'warm',
    'white'
  ]),
  meta: PropTypes.object.isRequired
};

// const boxShadow = 'inset 0 0 1px rgba(0, 0, 0, .5)';

const styleThunk = () => ({
  field: {
    ...ui.fieldBaseStyles,
    // border: 0,
    // boxShadow: 'none',
    fontSize: '.9375rem',
    lineHeight: '1.375rem'
  },

  cool: makeFieldColorPalette('cool'),
  gray: makeFieldColorPalette('gray'),
  link: makeFieldColorPalette('link'),
  warm: makeFieldColorPalette('warm'),
  white: makeFieldColorPalette('white'),

  // boxShadow: {
  //   ':focus': {
  //     boxShadow
  //   },
  //   ':active': {
  //     boxShadow
  //   }
  // },

  disabled: ui.fieldDisabled,

  inputBlock: {
    position: 'relative'
  }
});

export default withStyles(styleThunk)(PlainInputField);
