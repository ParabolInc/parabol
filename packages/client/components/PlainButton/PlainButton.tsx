import styled from '@emotion/styled'
import {ButtonHTMLAttributes} from 'react'

const disabledStyles = {
  cursor: 'not-allowed',
  opacity: 0.5,
  ':hover,:focus,:active,:disabled': {
    boxShadow: 'none'
  },
  ':hover,:focus': {
    opacity: 0.5
  },
  ':active': {
    animation: 'none'
  }
}

export interface PlainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  waiting?: boolean
}

const PlainButton = styled('button')<PlainButtonProps>(
  {
    appearance: 'none',
    background: 'inherit',
    border: 0,
    borderRadius: 0,
    color: 'inherit',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    margin: 0,
    outline: 0,
    padding: 0,
    textAlign: 'inherit'
  },
  ({disabled, waiting}) => (disabled || waiting ? disabledStyles : undefined),
  ({waiting}) => ({cursor: waiting ? 'wait' : undefined})
)

export default PlainButton
