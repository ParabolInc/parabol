import styled from '@emotion/styled'
import {CreditCard, DateRange, Lock} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const FieldBlock = styled('div')({
  alignItems: 'center',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  display: 'flex'
})

interface StyleProps {
  hasError: boolean
}

const FieldIcon = styled('div')<StyleProps>(({hasError}) => ({
  color: hasError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  height: 24,
  width: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  svg: {
    fontSize: 18
  },
  opacity: 0.5,
  marginLeft: 8
}))

interface Props {
  autoComplete: string
  autoFocus?: boolean
  className?: string
  error: string | undefined
  dirty: boolean
  //FIXME 6062: change to React.ComponentType
  iconName: string
  maxLength: number
  onBlur?: (e: React.FocusEvent) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  value: string
  name: string
}

const Input = styled('input')<StyleProps>(({hasError}) => ({
  appearance: 'none',
  backgroundColor: '#FFFFFF',
  border: 0,
  borderRadius: 4,
  boxShadow: 'none',
  color: PALETTE.SLATE_700,
  fontSize: '.9375rem',
  lineHeight: '24px',
  outline: 0,
  padding: '7px 8px', // account for top/bottom border
  width: '100%',
  '::placeholder': {
    color: hasError ? PALETTE.TOMATO_500 : undefined
  }
}))

const UpgradeCreditCardFormField = (props: Props) => {
  const {
    autoComplete,
    autoFocus,
    className,
    dirty,
    error,
    iconName,
    name,
    maxLength,
    onBlur,
    onChange,
    placeholder,
    value
  } = props

  const requireNumeric = (e: React.KeyboardEvent) => {
    // keep Enter around to let them submit
    if (e.key !== 'Enter' && isNaN(parseInt(e.key, 10))) {
      e.preventDefault()
    }
  }
  const hasError = dirty && !!error
  return (
    <FieldBlock className={className}>
      <FieldIcon hasError={hasError}>
        {
          {
            credit_card: <CreditCard />,
            date_range: <DateRange />,
            lock: <Lock />
          }[iconName]
        }
      </FieldIcon>
      <Input
        hasError={hasError}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onChange={onChange}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        onKeyPress={requireNumeric}
        type='text'
        value={value}
      />
    </FieldBlock>
  )
}

export default UpgradeCreditCardFormField
