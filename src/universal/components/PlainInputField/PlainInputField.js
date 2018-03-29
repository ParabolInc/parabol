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
    disabled,
    fieldSize,
    input,
    meta: {touched, error},
    placeholder,
    styles,
    spellCheck = true
  } = props;

  const inputStyles = css(
    // allow hotkeys to be triggered when inside a field input
    styles.field,
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
      {touched && error && <FieldHelpText fieldSize={fieldSize} hasErrorText helpText={error} indent />}
    </FieldBlock>
  );
};

PlainInputField.propTypes = {
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
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
  meta: PropTypes.object.isRequired
};

const styleThunk = (theme, {disabled, fieldSize}) => {
  const size = fieldSize || ui.fieldSizeOptions[1];
  return ({
    field: {
      ...ui.fieldBaseStyles,
      ...ui.fieldSizeStyles[size],
      ...makeFieldColorPalette('gray', !disabled)
    },

    disabled: ui.fieldDisabled,

    inputBlock: {
      position: 'relative'
    }
  });
};

export default withStyles(styleThunk)(PlainInputField);
