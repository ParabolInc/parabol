import React from 'react'
import styled from 'react-emotion'
import StyledError from 'universal/components/StyledError'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'

const TextArea = styled('textarea')({
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.medium,
  ...makeFieldColorPalette('gray'),
  minHeight: '5.75rem'
})

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  name?: string
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void
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
