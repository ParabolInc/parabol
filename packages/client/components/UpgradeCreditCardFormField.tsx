import {CreditCard, DateRange, Lock} from '@mui/icons-material'
import React from 'react'
import UpgradeCreditCardFormFieldBlock from './UpgradeCreditCardFormFieldBlock'
import UpgradeCreditCardFormFieldIcon from './UpgradeCreditCardFormFieldIcon'

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
    <UpgradeCreditCardFormFieldBlock className={className} hasError={hasError}>
      <UpgradeCreditCardFormFieldIcon hasError={hasError}>
        {
          {
            credit_card: <CreditCard />,
            date_range: <DateRange />,
            lock: <Lock />
          }[iconName]
        }
      </UpgradeCreditCardFormFieldIcon>
      <input
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
    </UpgradeCreditCardFormFieldBlock>
  )
}

export default UpgradeCreditCardFormField
