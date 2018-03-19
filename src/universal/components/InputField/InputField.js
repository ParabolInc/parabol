import PropTypes from 'prop-types';
import React from 'react';
import {css, cx} from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import FieldShortcutHint from 'universal/components/FieldShortcutHint/FieldShortcutHint';

const underlineStyles = {
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
};

const getStyles = ({disabled, fieldSize}) => {
  const size = fieldSize || ui.fieldSizeOptions[1];
  return ({
    field: {
      ...ui.fieldBaseStyles,
      ...ui.fieldSizeStyles[size]
    },

    cool: makeFieldColorPalette('cool', !disabled),
    gray: makeFieldColorPalette('gray', !disabled),
    warm: makeFieldColorPalette('warm', !disabled),
    white: makeFieldColorPalette('white', !disabled),

    disabled: ui.fieldDisabled,
    readOnly: ui.fieldReadOnly,

    fieldLarger: {
      fontSize: appTheme.typography.s6,
      fontWeight: 400,
      lineHeight: '2.625rem'
    },

    fieldWider: {
      minWidth: '30rem'
    },

    inputBlock: {
      position: 'relative'
    },

    underline: {
      borderRadius: 0,
      ...underlineStyles,

      ':hover': {
        underlineStyles
      },
      ':focus': {
        underlineStyles
      },
      ':active': {
        underlineStyles
      }
    }
  });
};

const InputField = (props) => {
  const {
    className,
    autoFocus,
    shortcutDisabled,
    colorPalette,
    disabled,
    fieldSize,
    input,
    isLarger,
    isWider,
    label,
    meta: {autofilled, dirty, error, invalid, touched},
    onButtonClick,
    placeholder,
    readyOnly,
    shortcutHint,
    type,
    underline
  } = props;

  const styles = getStyles(props);

  const inputClassName = cx(
    // allow hotkeys to be triggered when inside a field input
    css(styles.field),
    css(colorPalette ? styles[colorPalette] : styles.white),
    disabled && css(styles.disabled),
    isLarger && css(styles.fieldLarger),
    readyOnly && css(styles.readyOnly),
    isWider && css(styles.fieldWider),
    underline && css(styles.underline),
    className
  );

  let ref;
  const submitOnEnter = (e) => {
    if (e.key === 'Enter') {
      // let's manually blur here so if a parent calls untouch it occur after the blur (which calls touch by default)
      ref.blur();
      input.onBlur();
      onButtonClick(e);
    }
  };

  return (
    <FieldBlock>
      {label &&
        <FieldLabel
          customStyles={{paddingBottom: ui.fieldLabelGutter}}
          fieldSize={fieldSize}
          htmlFor={input.name}
          indent
          label={label}
        />
      }
      <div className={css(styles.inputBlock)}>
        <input
          {...input}
          type={type || 'text'}
          autoFocus={autoFocus}
          className={inputClassName}
          disabled={disabled || readyOnly}
          placeholder={placeholder}
          onKeyDown={onButtonClick && submitOnEnter}
          ref={(c) => { ref = c; }}
        />
      </div>
      {touched && !autofilled && dirty && invalid && <FieldHelpText fieldSize={fieldSize} hasErrorText helpText={error} indent />}
      {shortcutHint && <FieldShortcutHint disabled={shortcutDisabled} hint={shortcutHint} />}
    </FieldBlock>
  );
};

InputField.propTypes = {
  className: PropTypes.string,
  hasErrorText: PropTypes.bool,
  helpText: PropTypes.any,
  autoFocus: PropTypes.bool,
  shortcutDisabled: PropTypes.bool,
  buttonIcon: PropTypes.string,
  hasButton: PropTypes.bool,
  disabled: PropTypes.bool,
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
  isLarger: PropTypes.bool,
  readyOnly: PropTypes.bool,
  label: PropTypes.string,
  onButtonClick: PropTypes.func,
  placeholder: PropTypes.string,
  shortcutHint: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    value: PropTypes.string
  }),
  type: PropTypes.string,
  isWider: PropTypes.bool,
  styles: PropTypes.object,
  colorPalette: PropTypes.oneOf([
    'cool',
    'gray',
    'warm',
    'white'
  ]),
  meta: PropTypes.object.isRequired,
  underline: PropTypes.bool
};

export default InputField;
