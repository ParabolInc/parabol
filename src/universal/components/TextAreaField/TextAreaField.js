import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import Textarea from 'react-textarea-autosize';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';

const TextAreaField = (props) => {
  const {
    autoFocus,
    disabled,
    input,
    label,
    meta: {touched, error},
    placeholder,
    readOnly,
    styles,
  } = props;

  const inputStyles = css(
    styles.field,
    disabled && styles.disabled,
    readOnly && styles.readOnly,
  );

  return (
    <FieldBlock>
      {label && <FieldLabel label={label} htmlFor={input.name}/>}
      <div className={css(styles.inputBlock)}>
          <Textarea
            {...input}
            autoFocus={autoFocus}
            className={inputStyles}
            disabled={disabled || readOnly}
            placeholder={placeholder}
          />
      </div>
      {touched && error && <FieldHelpText hasErrorText helpText={error}/>}
    </FieldBlock>
  );
};

TextAreaField.propTypes = {
  hasErrorText: PropTypes.bool,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  meta: PropTypes.object.isRequired,
};

const readOnlyStyles = {
  borderColor: 'transparent',
  ':focus': {
    borderColor: 'transparent'
  },
  ':active': {
    borderColor: 'transparent'
  }
};

const styleThunk = () => ({
  field: {
    appearance: 'none',
    border: 0,
    borderBottom: '1px solid transparent',
    borderRadius: 0,
    boxShadow: 'none',
    display: 'block', // Todo: make inlineBlock wrapper (TA)
    fontFamily: appTheme.typography.sansSerif,
    fontSize: appTheme.typography.s4,
    lineHeight: '1.75rem',
    margin: '0',
    minHeight: '6rem',
    padding: `.125rem ${ui.fieldPaddingHorizontal}`,
    width: '100%',
    // always gray theme, keeps the UI consistent
    backgroundColor: appTheme.palette.mid10l,
    borderColor: appTheme.palette.mid40l,
    color: appTheme.palette.dark,
    placeholder: makePlaceholderStyles(appTheme.palette.mid70l),
    '::selection': {
      backgroundColor: appTheme.palette.mid20l
    },
    ':focus': {
      borderColor: appTheme.palette.dark,
      outline: 'none'
    },
    ':active': {
      borderColor: appTheme.palette.dark,
      outline: 'none'
    },
  },

  disabled: {
    ...readOnlyStyles,
    cursor: 'not-allowed'
  },

  readOnly: {
    ...readOnlyStyles,
    cursor: 'default'
  }
});

export default withStyles(styleThunk)(TextAreaField);
