import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import PrimaryButton from '../../../../components/PrimaryButton'
import UpgradeCreditCardFormField from '../../../../components/UpgradeCreditCardFormField'
import UpgradeCreditCardNumberFormField from '../../../../components/UpgradeCreditCardNumberFormField'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import useScript from '../../../../hooks/useScript'
import useSegmentTrack from '../../../../hooks/useSegmentTrack'
import UpdateCreditCardMutation from '../../../../mutations/UpdateCreditCardMutation'
import UpgradeToTeamTierMutation from '../../../../mutations/UpgradeToTeamTierMutation'
import {CompletedHandler} from '../../../../types/relayMutations'
import StripeClientManager, {StripeError} from '../../../../utils/StripeClientManager'
import CreditCardErrorLine from './CreditCardErrorLine'
import {CreditCardModalActionType} from './CreditCardModal'
import CreditCardPricingLine from './CreditCardPricingLine'

const Form = styled('form')({
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 24px 24px',
  // required to clip 0 border radius for input
  overflow: 'hidden',
  width: '100%'
})

const CreditCardNumber = styled(UpgradeCreditCardNumberFormField)({
  marginBottom: 8
})

const CardDetails = styled('div')({
  display: 'flex'
})

const CardExpiry = styled(UpgradeCreditCardFormField)({
  marginRight: 8
})

const CardCvc = styled(UpgradeCreditCardFormField)({})

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 8,
  width: '100%'
})

const UpgradeButton = styled(PrimaryButton)({
  flexGrow: 1
})

const UpgradeLaterButton = styled(PlainButton)({
  fontSize: 14,
  paddingLeft: 8,
  paddingRight: 8
})

const paramToInputLookup = {
  exp_year: 'expiry',
  exp_month: 'expiry',
  number: 'creditCardNumber',
  cvc: 'cvc'
} as const

const CTALabel = {
  update: 'Update',
  upgrade: 'Upgrade',
  squeeze: 'Upgrade Now'
} as const

interface Props {
  activeUserCount?: number
  actionType: CreditCardModalActionType
  orgId: string
  onSuccess?: () => void
  onLater?: (e: React.FormEvent) => void
}

const CreditCardForm = (props: Props) => {
  const {activeUserCount, actionType, onSuccess, onLater, orgId} = props
  const atmosphere = useAtmosphere()
  const isStripeLoaded = useScript('https://js.stripe.com/v2/')
  const [stripeClientManager] = useState(() => new StripeClientManager())
  const {submitting, submitMutation, onError, error, onCompleted} = useMutationProps()
  const {fields, onChange, setDirtyField, validateField} = useForm({
    creditCardNumber: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCardNumber,
      validate: stripeClientManager.validateCardNumber
    },
    cvc: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCVC,
      validate: stripeClientManager.validateCVC
    },
    expiry: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeExpiry,
      validate: stripeClientManager.validateExpiry
    }
  })
  useSegmentTrack('Credit Card Modal Opened', {actionType})

  useEffect(() => {
    if (isStripeLoaded) {
      stripeClientManager.init()
    }
  }, [isStripeLoaded])

  const handleError = (param: string, fallback = 'Invalid details') => {
    const inputField = paramToInputLookup[param as keyof typeof paramToInputLookup]
    if (inputField) {
      // set submitting to false and clear general error
      onCompleted()
      fields[inputField].setError(StripeError[inputField])
    } else {
      onError(new Error(fallback))
    }
  }
  const asyncValidateAndSubmit = async () => {
    const [expMonth, expYear] = fields.expiry.value.split('/')
    const {error, id: stripeToken} = await stripeClientManager.createToken({
      number: fields.creditCardNumber.value,
      exp_month: Number(expMonth),
      exp_year: Number(expYear),
      cvc: fields.cvc.value
    })
    if (error) {
      handleError(error.param!)
      return
    }

    const handleCompleted: CompletedHandler = (data) => {
      const {error} = Object.values<any>(data)[0] ?? {}
      onCompleted()
      if (error) {
        handleError(error.message, error.message)
        return
      }
      onSuccess?.()
    }

    if (actionType === 'update') {
      UpdateCreditCardMutation(
        atmosphere,
        {orgId, stripeToken},
        {onError, onCompleted: handleCompleted}
      )
    } else {
      UpgradeToTeamTierMutation(
        atmosphere,
        {orgId, stripeToken},
        {onError, onCompleted: handleCompleted}
      )
    }
  }
  useEffect(() => {
    if (!submitting) return
    // if any synchronous field errors, reset submitting & primary error & return
    if (
      Object.keys(fields)
        .map((name) => fields[name as keyof typeof fields].error)
        .filter(Boolean).length !== 0
    ) {
      onCompleted()
      return
    }
    asyncValidateAndSubmit()
  }, [submitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    // these 3 calls internally call dispatch (or setState), which are asynchronous in nature.
    // To get the current value of `fields`, we have to wait for the component to rerender
    // the useEffect hook above will continue the process if submitting === true
    setDirtyField()
    validateField()
    submitMutation()
  }

  return (
    <>
      <CreditCardErrorLine
        stripeClientManager={stripeClientManager}
        fields={fields as any}
        serverError={error ? error.message : undefined}
      />
      <Form onSubmit={handleSubmit}>
        <CreditCardNumber
          {...fields.creditCardNumber}
          autoFocus
          name={'creditCardNumber'}
          onBlur={() => setDirtyField('creditCardNumber')}
          onChange={onChange}
        />
        <CardDetails>
          <CardExpiry
            {...fields.expiry}
            autoComplete='cc-exp'
            iconName='date_range'
            maxLength={5}
            name={'expiry'}
            onChange={onChange}
            onBlur={() => setDirtyField('expiry')}
            placeholder='MM/YY'
          />
          <CardCvc
            {...fields.cvc}
            autoComplete='cc-csc'
            iconName={'lock'}
            name={'cvc'}
            maxLength={5}
            onBlur={() => setDirtyField('cvc')}
            onChange={onChange}
            placeholder='CVC'
          />
        </CardDetails>
        <CreditCardPricingLine activeUserCount={activeUserCount} actionType={actionType} />
        <ButtonGroup>
          {actionType === 'squeeze' && (
            <UpgradeLaterButton onClick={onLater}>Upgrade Later</UpgradeLaterButton>
          )}
          <UpgradeButton size='medium' onClick={handleSubmit} waiting={submitting} type={'submit'}>
            {CTALabel[actionType]}
          </UpgradeButton>
        </ButtonGroup>
      </Form>
    </>
  )
}

export default CreditCardForm
