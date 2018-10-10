import * as React from 'react'
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles'
import styled, {css, cx} from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

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
})

const fieldErrorStyles = css({
  // boxShadow: `inset 0 0 .0625rem .0625rem ${ui.fieldErrorBorderColor}`,
  ...makePlaceholderStyles(ui.fieldErrorPlaceholderColor)
})

const FieldBlock = styled('div')({
  position: 'relative'
})

const FieldIcon = styled(Icon)(({hasError}) => ({
  color: hasError ? ui.colorError : ui.hintColor,
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  left: '.5rem',
  lineHeight: appTheme.typography.s6,
  opacity: 0.5,
  position: 'absolute',
  textAlign: 'center',
  top: '.5rem'
}))

type Props = {|
  autoComplete: string,
  autoFocus: string,
  hasError: boolean,
  iconName: string,
  maxLength: number,
  onChange: (SyntheticKeyboardEvent<*>) => void,
  placeholder: string,
  error: string,
  value: string
|}

const UpgradeCreditCardFormField = (props: Props) => {
  const {
    autoComplete,
    autoFocus,
    hasError,
    iconName,
    maxLength,
    onChange,
    placeholder,
    value
  } = props

  const requireNumeric = (e) => {
    // keep Enter around to let them submit
    if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) {
      e.preventDefault()
    }
  }

  // TODO move to styled layout
  const fieldClassName = cx(fieldStyles, hasError && fieldErrorStyles)

  return (
    <FieldBlock>
      <FieldIcon hasError={hasError}>{iconName}</FieldIcon>
      <input
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={fieldClassName}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        onKeyPress={requireNumeric}
        type='text'
        value={value}
      />
    </FieldBlock>
  )
}

export default UpgradeCreditCardFormField
