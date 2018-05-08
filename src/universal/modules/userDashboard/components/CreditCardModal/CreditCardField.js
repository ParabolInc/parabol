import PropTypes from 'prop-types';
import React from 'react';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import styled, {css, cx} from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const fieldStyles = css({
  ...ui.fieldBaseStyles,
  backgroundColor: ui.palette.white,
  border: 0,
  borderRadius: 0,
  boxShadow: 'none',
  color: appTheme.palette.dark,
  fontSize: '.9375rem',
  lineHeight: appTheme.typography.s6,
  padding: `.5rem ${ui.fieldPaddingHorizontal} .5rem 2rem`,
  ':focus, :active': {
    ...makePlaceholderStyles(ui.placeholderColorFocusActive)
  }
});

const fieldErrorStyles = css({
  // boxShadow: `inset 0 0 .0625rem .0625rem ${ui.fieldErrorBorderColor}`,
  ...makePlaceholderStyles(ui.fieldErrorPlaceholderColor)
});

const FieldBlock = styled('div')({
  position: 'relative'
});

const FieldIcon = styled(StyledFontAwesome)(({hasError}) => ({
  color: hasError ? ui.colorError : ui.hintColor,
  display: 'block',
  fontSize: ui.iconSize,
  left: '.5rem',
  lineHeight: appTheme.typography.s6,
  opacity: 0.5,
  position: 'absolute',
  textAlign: 'center',
  top: '.5rem',
  width: '1rem'
}));

const CreditCardField = (props) => {
  const {
    autoComplete,
    autoFocus,
    iconName,
    input,
    maxLength,
    meta: {touched, error},
    placeholder
  } = props;

  const requireNumeric = (e) => {
    // keep Enter around to let them submit
    if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) {
      e.preventDefault();
    }
  };

  const hasError = touched && error;
  const fieldClassName = cx(fieldStyles, hasError && fieldErrorStyles);

  return (
    <FieldBlock>
      <FieldIcon hasError={hasError} name={iconName} />
      <input
        {...input}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={fieldClassName}
        maxLength={maxLength}
        placeholder={placeholder}
        onKeyPress={requireNumeric}
        type="text"
      />
    </FieldBlock>
  );
};

CreditCardField.propTypes = {
  autoComplete: PropTypes.string,
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
  placeholder: PropTypes.string
};

export default CreditCardField;
