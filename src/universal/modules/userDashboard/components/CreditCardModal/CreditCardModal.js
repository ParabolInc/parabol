import PropTypes from 'prop-types'
import React from 'react'
import {reduxForm, Field} from 'redux-form'
import CreditCardField from './CreditCardField'
import makeCreditCardSchema from 'universal/validation/makeCreditCardSchema'
import formError from 'universal/styles/helpers/formError'
import {normalizeExpiry, normalizeNumeric} from './normalizers'
import shouldValidate from 'universal/validation/shouldValidate'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import DashModal from 'universal/components/Dashboard/DashModal'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import Type from 'universal/components/Type/Type'
import PrimaryButton from 'universal/components/PrimaryButton'
import RaisedButton from 'universal/components/RaisedButton'

const inputBorder = '.0625rem solid transparent'
const borderBottom = '.125rem solid transparent'

const LockIcon = styled(StyledFontAwesome)({
  lineHeight: appTheme.typography.s5,
  marginRight: '.2em'
})

const ModalBody = styled('div')({
  alignItems: 'center',
  background: ui.backgroundColor,
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const StyledIconAvatar = styled(IconAvatar)({
  margin: '0 0 .5rem'
})

const CardInputs = styled('div')({
  borderRadius: ui.borderRadiusSmall,
  display: 'flex',
  flexDirection: 'column',
  margin: '1.25rem 0',
  // required to clip 0 border radius for input
  overflow: 'hidden',
  width: '100%'
})

const CreditCardNumber = styled('div')({
  borderBottom
})

const CardDetails = styled('div')({
  display: 'flex'
})

const CardExpiry = styled('div')({
  borderRight: inputBorder
})

const CardCvc = styled('div')({
  borderLeft: inputBorder
})

const ErrorMsg = styled('div')({
  ...formError,
  marginTop: '1rem',
  fontSize: appTheme.typography.s2
})

const ButtonGroup = styled('div')({
  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'space-between',
  width: '100%'
})

const CancelButton = styled(RaisedButton)({
  flexGrow: '1',
  marginRight: '.625rem',
  paddingLeft: 0,
  paddingRight: 0
})

const UpdateButton = styled(PrimaryButton)({
  flexGrow: '4',
  marginLeft: '.625rem',
  paddingLeft: 0,
  paddingRight: 0
})

const validate = (values, props) => {
  const {stripeCard} = props
  // stripeCard loads async, so until it loads, don't bother validating
  if (stripeCard) {
    const schema = makeCreditCardSchema(stripeCard)
    return schema(values).errors
  }
  return {}
}

const CreditCardModal = (props) => {
  const {
    addStripeBilling,
    cardTypeIcon,
    checkCardType,
    closeAfter,
    closePortal,
    crudAction,
    dirty,
    error,
    handleSubmit,
    isClosing,
    submitting,
    syncFormError
  } = props
  const anyError = error || syncFormError
  const actionLabel = `${crudAction} Credit Card`
  return (
    <DashModal
      onBackdropClick={closePortal}
      inputModal
      isClosing={isClosing}
      closeAfter={closeAfter}
    >
      <ModalBody>
        <StyledIconAvatar icon={cardTypeIcon} size='large' />
        <Type
          align='center'
          colorPalette='dark'
          lineHeight='1.875rem'
          marginBottom='.25rem'
          scale='s6'
        >
          {actionLabel}
        </Type>
        <Type align='center' colorPalette='dark' lineHeight={appTheme.typography.s5} scale='s3'>
          <LockIcon name='lock' />
          {' Secured by '}
          <b>{'Stripe'}</b>
        </Type>
        {dirty && anyError && <ErrorMsg>{anyError}</ErrorMsg>}
        <form onSubmit={handleSubmit(addStripeBilling)}>
          <CardInputs>
            <CreditCardNumber>
              <Field
                autoComplete='cc-number'
                autoFocus
                component={CreditCardField}
                iconName='credit-card'
                maxLength='20'
                name='creditCardNumber'
                normalize={normalizeNumeric}
                placeholder='Card number'
                shortcutHint='Credit card number'
                onChange={checkCardType}
              />
            </CreditCardNumber>
            <CardDetails>
              <CardExpiry>
                <Field
                  autoComplete='cc-exp'
                  component={CreditCardField}
                  iconName='calendar'
                  maxLength='5'
                  name='expiry'
                  placeholder='MM/YY'
                  shortcutHint='Expiration date'
                  normalize={normalizeExpiry}
                />
              </CardExpiry>
              <CardCvc>
                <Field
                  autoComplete='cc-csc'
                  component={CreditCardField}
                  iconName='lock'
                  maxLength='4'
                  name='cvc'
                  normalize={normalizeNumeric}
                  placeholder='CVC'
                  shortcutHint='3-digit code on the back of your card'
                />
              </CardCvc>
            </CardDetails>
          </CardInputs>
          <ButtonGroup>
            <UpdateButton
              size='medium'
              depth={1}
              disabled={submitting}
              onClick={handleSubmit(addStripeBilling)}
              type='submit'
              waiting={submitting}
            >
              {actionLabel}
            </UpdateButton>
            <CancelButton
              size='medium'
              disabled={submitting}
              onClick={closePortal}
              type='button'
              waiting={submitting}
            >
              {'Cancel'}
            </CancelButton>
          </ButtonGroup>
        </form>
      </ModalBody>
    </DashModal>
  )
}

CreditCardModal.propTypes = {
  addStripeBilling: PropTypes.func,
  cardTypeIcon: PropTypes.string,
  checkCardType: PropTypes.func,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  crudAction: PropTypes.string,
  dirty: PropTypes.bool,
  error: PropTypes.string,
  handleToken: PropTypes.func,
  handleSubmit: PropTypes.func,
  isClosing: PropTypes.bool,
  isUpdate: PropTypes.bool,
  orgId: PropTypes.string,
  submitting: PropTypes.bool,
  syncFormError: PropTypes.string
}

export default reduxForm({form: 'creditCardInfo', validate, shouldValidate})(CreditCardModal)
