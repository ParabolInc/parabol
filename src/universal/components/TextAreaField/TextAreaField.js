import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
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
    styles
  } = props;

  const inputStyles = css(
    styles.field,
    disabled && styles.disabled,
    readOnly && styles.readOnly,
  );

  return (
    <FieldBlock>
      {label && <FieldLabel label={label} htmlFor={input.name} />}
      <div className={css(styles.inputBlock)}>
        <Textarea
          {...input}
          autoFocus={autoFocus}
          className={inputStyles}
          defaultValue={input.value}
          disabled={disabled || readOnly}
          placeholder={placeholder}
          value={undefined}
        />
      </div>
      {touched && error && <FieldHelpText hasErrorText helpText={error} />}
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
  styles: PropTypes.object
};

const styleThunk = () => ({
  field: {
    ...ui.fieldBaseStyles,
    ...makeFieldColorPalette('gray'),
    minHeight: '5.75rem'
  },
  disabled: ui.fieldDisabled,
  readOnly: ui.fieldReadOnly
});

export default withStyles(styleThunk)(TextAreaField);
