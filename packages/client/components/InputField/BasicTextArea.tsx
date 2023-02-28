import styled from '@emotion/styled'
import React from 'react'
import makeFieldColorPalette from '../../styles/helpers/makeFieldColorPalette'
import ui from '../../styles/ui'
import StyledError from '../StyledError'

const TextArea = styled('textarea')<{disabled?: boolean}>(({disabled}) => ({
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.medium,
  ...makeFieldColorPalette('white', !disabled),
  minHeight: '5.75rem',
  ...(disabled && {...ui.fieldDisabled})
}))

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  error?: string | undefined | null
  name?: string
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  value: string
}

const BasicTextArea = (props: Props) => {
  const {autoFocus, disabled, error, name, onBlur, onChange, placeholder, value} = props

  return (
    <React.Fragment>
      <TextArea
        autoFocus={autoFocus}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
      />
      {error && <StyledError>{error}</StyledError>}
    </React.Fragment>
  )
}

export default BasicTextArea
