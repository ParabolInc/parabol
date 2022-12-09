import {CreditCard} from '@mui/icons-material'
import Cleave from 'cleave.js/react'
import React from 'react'
import UpgradeCreditCardFormFieldBlock from './UpgradeCreditCardFormFieldBlock'
import UpgradeCreditCardFormFieldIcon from './UpgradeCreditCardFormFieldIcon'

interface Props {
  autoFocus?: boolean
  className?: string
  error: string | undefined
  dirty: boolean
  maxLength?: number
  onBlur?: (e: React.FocusEvent) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  name: string
}

const UpgradeCreditCardNumberFormField = (props: Props) => {
  const {autoFocus, className, dirty, error, name, onBlur, onChange, value} = props

  const hasError = dirty && !!error
  return (
    <UpgradeCreditCardFormFieldBlock className={className} hasError={hasError}>
      <UpgradeCreditCardFormFieldIcon hasError={hasError}>
        <CreditCard />
      </UpgradeCreditCardFormFieldIcon>
      <Cleave
        placeholder={'Card number'}
        options={{creditCard: true}}
        autoComplete='cc-number'
        autoFocus={autoFocus}
        onBlur={onBlur}
        onChange={onChange}
        name={name}
        type='text'
        value={value}
      />
    </UpgradeCreditCardFormFieldBlock>
  )
}

export default UpgradeCreditCardNumberFormField
