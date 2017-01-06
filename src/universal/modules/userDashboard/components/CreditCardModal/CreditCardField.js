import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

const CreditCardField = (props) => {
  const {
    autoFocus,
    iconName,
    input,
    label,
    meta: {touched, error},
    placeholder,
    styles,
    topField
  } = props;

  const inputStyle = css(
    styles.field,
    topField && styles.topField
  );
  return (
    <div className={css(styles.iconAndInput)}>
      <FontAwesome name={iconName} className={css(styles.icon)}/>
      <input
        {...input}
        autoFocus={autoFocus}
        className={inputStyle}
        placeholder={placeholder}
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
    border: '0',
    boxShadow: 'none',
    fontSize: appTheme.typography.s3,
    lineHeight: '1.75rem',
    margin: '0',
    padding: `.125rem ${ui.fieldPaddingHorizontal} .125rem 1.5rem`,
    outline: 0,
    width: '100%'
  },
  icon: {
    color: 'gray',
    left: 0,
    lineHeight: '2rem',
    margin: '0 .25rem',
    position: 'absolute',
  },
  iconAndInput: {
    position: 'relative'
  },
  topField: {}
});

export default withStyles(styleThunk)(CreditCardField);
