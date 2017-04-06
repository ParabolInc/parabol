import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import FontAwesome from 'react-fontawesome';

const CreditCardField = (props) => {
  const {
    autoFocus,
    iconName,
    input,
    maxLength,
    meta: {touched, error},
    placeholder,
    styles,
    topField
  } = props;

  const inputStyle = css(
    styles.field,
    topField && styles.topField,
    touched && error && styles.error
  );

  const iconStyle = {
    color: appTheme.palette.mid50l,
    display: 'block',
    fontSize: ui.iconSize,
    left: '.5rem',
    lineHeight: appTheme.typography.s6,
    position: 'absolute',
    textAlign: 'center',
    top: '.5rem',
    width: '1rem'
  };

  const requireNumeric = (e) => {
    // keep Enter around to let them submit
    if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) {
      e.preventDefault();
    }
  };

  return (
    <div className={css(styles.iconAndInput)}>
      <FontAwesome
        name={iconName}
        style={iconStyle}
      />
      <input
        {...input}
        autoFocus={autoFocus}
        className={inputStyle}
        maxLength={maxLength}
        placeholder={placeholder}
        onKeyPress={requireNumeric}
        type="text"
      />
    </div>

  );
};

CreditCardField.propTypes = {
  autoFocus: PropTypes.bool,
  iconName: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  maxLength: PropTypes.string,
  meta: PropTypes.object,
  placeholder: PropTypes.string,
  styles: PropTypes.object,
  topField: PropTypes.bool
};

const styleThunk = () => ({
  field: {
    ...ui.fieldBaseStyles,
    backgroundColor: '#fff',
    border: 0,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s5,
    lineHeight: appTheme.typography.s6,
    padding: `.5rem ${ui.fieldPaddingHorizontal} .5rem 2rem`,
    ...makePlaceholderStyles(ui.fieldPlaceholderColor)
  },

  error: {
    boxShadow: `inset 0 0 1px 1px ${ui.fieldErrorBorderColor}`,
    ...makePlaceholderStyles(ui.fieldErrorPlaceholderColor)
  },

  iconAndInput: {
    position: 'relative'
  },

  topField: {}
});

export default withStyles(styleThunk)(CreditCardField);
