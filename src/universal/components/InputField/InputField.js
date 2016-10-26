import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Textarea from 'react-textarea-autosize';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import FieldShortcutHint from 'universal/components/FieldShortcutHint/FieldShortcutHint';
import IconButton from 'universal/components/IconButton/IconButton';

const InputField = (props) => {
  const {
    autoFocus,
    hasErrorText,
    helpText,
    input,
    isWider,
    colorPalette,
    buttonDisabled,
    buttonIcon,
    hasButton,
    isLarger,
    label,
    onButtonClick,
    placeholder,
    shortcutHint,
    styles,
    useTextarea
  } = props;

  const inputStyles = css(
    // allow hotkeys to be triggered when inside a field input
    styles.field,
    styles[colorPalette],
    isLarger && styles.fieldLarger,
    isWider && styles.fieldWider,
    useTextarea && styles.textarea
  );

  const makeLabelNameForInput = () => {
    let labelForName = null;
    if (input && input.name) {
      labelForName = input.name;
    }
    return labelForName;
  };

  return (
    <FieldBlock>
      {label &&
        <FieldLabel label={label} htmlFor={makeLabelNameForInput()} />
      }
      <div className={css(styles.inputBlock)}>
        {useTextarea ?
          <Textarea
            {...input}
            autoFocus={autoFocus}
            className={`${inputStyles} mousetrap`}
            placeholder={placeholder}
          /> :
          <input
            {...input}
            autoFocus={autoFocus}
            className={`${inputStyles} mousetrap`}
            placeholder={placeholder}
          />
        }
        {hasButton &&
          <div className={css(styles.buttonBlock)}>
            <IconButton
              disabled={buttonDisabled}
              iconName={buttonIcon}
              iconSize="2x"
              onClick={onButtonClick}
            />
          </div>
        }
      </div>
      {helpText && <FieldHelpText hasErrorText={hasErrorText} helpText={helpText} />}
      {shortcutHint && <FieldShortcutHint disabled={buttonDisabled} hint={shortcutHint} />}
    </FieldBlock>
  );
};

InputField.defaultProps = {
  colorPalette: 'cool'
};

InputField.propTypes = {
  hasErrorText: PropTypes.bool,
  helpText: PropTypes.any,
  autoFocus: PropTypes.bool,
  buttonDisabled: PropTypes.bool,
  buttonIcon: PropTypes.string,
  hasButton: PropTypes.bool,
  isLarger: PropTypes.bool,
  label: PropTypes.string,
  onButtonClick: PropTypes.func,
  placeholder: PropTypes.string,
  shortcutHint: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  isWider: PropTypes.bool,
  styles: PropTypes.object,
  colorPalette: PropTypes.oneOf([
    'cool',
    'warm'
  ]),
  useTextarea: PropTypes.bool
};

const fieldLightGray = appTheme.palette.dark50l;

const styleThunk = () => ({
  field: {
    border: 0,
    borderBottom: `1px dashed ${fieldLightGray}`,
    boxShadow: 'none',
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    lineHeight: 1.5,
    margin: '0 0 .5rem',
    padding: `.125rem ${ui.fieldPaddingHorizontal}`,
    width: '100%',

    '::placeholder': {
      color: fieldLightGray
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderStyle: 'solid',
      outline: 'none'
    },
    ':active': {
      borderStyle: 'solid',
      outline: 'none'
    }
  },

  cool: {
    '::selection': {
      backgroundColor: appTheme.palette.cool10l
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: appTheme.palette.cool50l,
      color: appTheme.palette.cool,
    },
    ':active': {
      borderColor: appTheme.palette.cool50l,
      color: appTheme.palette.cool,
    }
  },

  warm: {
    '::selection': {
      backgroundColor: appTheme.palette.warm10l
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: appTheme.palette.warm50l,
      color: appTheme.palette.warm,
    },
    ':active': {
      borderColor: appTheme.palette.warm50l,
      color: appTheme.palette.warm,
    }
  },

  // NOTE: Modifies field
  fieldLarger: {
    borderBottomWidth: '2px',
    fontSize: appTheme.typography.s6,
    fontWeight: 400
  },

  // NOTE: Modifies field
  fieldWider: {
    minWidth: '30rem'
  },

  inputBlock: {
    position: 'relative'
  },

  buttonBlock: {
    left: '100%',
    padding: '0 0 0 1rem',
    position: 'absolute',
    top: '.375rem'
  },

  textarea: {
    minHeight: '6rem'
  }
});

export default withStyles(styleThunk)(InputField);
