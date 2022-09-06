import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import UnderlineInput from './InputField/UnderlineInput'
import TinyLabel from './TinyLabel'

interface Props {
  autoFocus?: boolean
  dirty: boolean
  error: string | undefined
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}

const Label = styled(TinyLabel)({
  fontSize: 12,
  fontWeight: 600
})

const PasswordInputField = (props: Props) => {
  const {autoFocus, dirty, error, onChange, onBlur, value} = props

  const {t} = useTranslation()

  return (
    <React.Fragment>
      <Label>{t('PasswordInputField.Password')}</Label>
      <UnderlineInput
        ariaLabel={t('PasswordInputField.Password')}
        autoFocus={autoFocus}
        error={dirty ? (error as string) : undefined}
        name='password'
        onBlur={onBlur}
        onChange={onChange}
        placeholder='********'
        type='password'
        value={value}
      />
    </React.Fragment>
  )
}

export default PasswordInputField
