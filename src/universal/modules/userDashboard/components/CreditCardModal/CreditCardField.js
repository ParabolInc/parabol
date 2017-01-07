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
    label,
    maxLength,
    meta: {touched, error},
    placeholder,
    styles,
    topField
  } = props;

  const inputStyle = css(
    styles.field,
    topField && styles.topField
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
    if (isNaN(parseInt(e.key))) {
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
  placeholder: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string
  })
};

const styleThunk = () => ({
  field: {
    appearance: 'none',
    backgroundColor: '#fff',
    border: '0',
    boxShadow: 'none',
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s5,
    lineHeight: appTheme.typography.s6,
    margin: '0',
    padding: `.5rem ${ui.fieldPaddingHorizontal} .5rem 2rem`,
    outline: 0,
    width: '100%',

    ...makePlaceholderStyles(appTheme.palette.mid80l)
  },

  iconAndInput: {
    position: 'relative'
  },

  topField: {}
});

export default withStyles(styleThunk)(CreditCardField);
