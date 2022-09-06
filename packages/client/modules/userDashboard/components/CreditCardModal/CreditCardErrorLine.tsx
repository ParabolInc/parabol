import styled from '@emotion/styled'
import {Error as ErrorIcon, Lock as LockIcon} from '@mui/icons-material'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import CreditCardIcon from '../../../../components/CreditCardIcon'
import {UseFormField} from '../../../../hooks/useForm'
import {PALETTE} from '../../../../styles/paletteV3'
import StripeClientManager, {CardTypeIcon} from '../../../../utils/StripeClientManager'

const LineIcon = styled('div')({
  '& svg': {
    fontSize: 19
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

interface Props {
  serverError?: string
  fields: {
    creditCardNumber: UseFormField
    expiry: UseFormField
    cvc: UseFormField
  }
  stripeClientManager: StripeClientManager
}

const Line = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  display: 'flex',
  padding: '8px 24px'
})

const Error = styled('div')<{isError: boolean}>(({isError}) => ({
  alignItems: 'center',
  color: isError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: 'flex',
  flex: 1,
  lineHeight: '24px',
  minHeight: 24
}))

const Message = styled('div')({
  fontSize: 15,
  paddingLeft: 4
})

const CreditCardErrorLine = (props: Props) => {
  const {fields, serverError, stripeClientManager} = props

  const {t} = useTranslation()

  const [cardTypeIcon, setCardTypeIcon] = useState<CardTypeIcon>()
  const {creditCardNumber, cvc, expiry} = fields
  const primaryError =
    serverError ||
    (creditCardNumber.dirty && creditCardNumber.error) ||
    (expiry.dirty && expiry.error) ||
    (cvc.dirty && cvc.error)
  useEffect(() => {
    const icon = stripeClientManager.cardTypeIcon(creditCardNumber.value)
    setCardTypeIcon(icon)
  }, [creditCardNumber.value])
  return (
    <Line>
      <Error isError={!!primaryError}>
        <LineIcon>{primaryError ? <ErrorIcon /> : <LockIcon />}</LineIcon>
        <Message>
          {primaryError || (
            <>
              {t('CreditCardErrorLine.SecuredBy')}
              <b>{t('CreditCardErrorLine.Stripe')}</b>
            </>
          )}
        </Message>
      </Error>
      {cardTypeIcon ? <CreditCardIcon cardTypeIcon={cardTypeIcon} /> : null}
    </Line>
  )
}

export default CreditCardErrorLine
