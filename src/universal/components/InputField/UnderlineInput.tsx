import React from 'react'
import styled from 'react-emotion'
import StyledError from 'universal/components/StyledError'
import {PALETTE} from '../../styles/paletteV2'
import {FONT_FAMILY} from '../../styles/typographyV2'
import BORDER = PALETTE.BORDER
import TEXT = PALETTE.TEXT

const Input = styled('input')({
  appearance: 'none',
  borderWidth: 0,
  borderBottom: `0.0625rem solid ${BORDER.LIGHT}`,
  borderRadius: 0,
  boxShadow: 'none',
  color: TEXT.MAIN,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '.875rem',
  lineHeight: '1.375rem',
  margin: 0,
  outline: 0,
  padding: '.3125rem 1rem .3125rem 0',
  width: '100%',
  ':hover,:focus,:active': {
    borderColor: BORDER.MAIN
  }
})

const ErrorMessage = styled(StyledError)({
  fontSize: '.8125rem',
  marginTop: '.5rem'
})

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  innerRef?: React.RefObject<HTMLInputElement>
  name?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  value: string
}

const UnderlineInput = (props: Props) => {
  const {
    autoFocus,
    disabled,
    error,
    innerRef,
    name,
    onBlur,
    onChange,
    placeholder,
    type = 'text',
    value
  } = props
  return (
    <React.Fragment>
      <Input
        autoFocus={autoFocus}
        disabled={Boolean(disabled)}
        innerRef={innerRef}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </React.Fragment>
  )
}

export default UnderlineInput
