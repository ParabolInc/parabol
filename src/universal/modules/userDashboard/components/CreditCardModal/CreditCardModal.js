import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {reduxForm, Field} from 'redux-form';
import CreditCardField from './CreditCardField';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import FontAwesome from 'react-fontawesome';
import makeCreditCardSchema from 'universal/validation/makeCreditCardSchema';
import formError from 'universal/styles/helpers/formError';
import {normalizeExpiry, normalizeNumeric} from './normalizers';
import shouldValidate from 'universal/validation/shouldValidate';

const lockIconStyles = {
  lineHeight: appTheme.typography.s5,
  marginRight: '.2em'
};

const validate = (values, props) => {
  const {stripeCard} = props;
  // stripeCard loads async, so until it loads, don't bother validating
  if (stripeCard) {
    const schema = makeCreditCardSchema(stripeCard);
    return schema(values).errors;
  }
  return {};
};

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
    styles,
    submitting,
    syncFormError
  } = props;
  const anyError = error || syncFormError;
  return (
    <DashModal onBackdropClick={closePortal} inputModal isClosing={isClosing} closeAfter={closeAfter}>
      <div className={css(styles.modalBody)}>
        <div className={css(styles.iconAvatarBlock)}>
          <IconAvatar colorPalette="mid" icon={cardTypeIcon} size="large" />
        </div>
        <Type align="center" colorPalette="mid" lineHeight="1.875rem" marginBottom=".25rem" scale="s6">
          {crudAction} Credit Card
        </Type>
        <Type align="center" colorPalette="mid" lineHeight={appTheme.typography.s5} scale="s3">
          <FontAwesome name="lock" style={lockIconStyles} /> Secured by <b>Stripe</b>
        </Type>
        {dirty && anyError && <div className={css(styles.error)}>{anyError}</div>}
        <form onSubmit={handleSubmit(addStripeBilling)}>
          <div className={css(styles.cardInputs)}>
            <div className={css(styles.creditCardNumber)}>
              <Field
                autoFocus
                component={CreditCardField}
                iconName="credit-card"
                maxLength="20"
                name="creditCardNumber"
                normalize={normalizeNumeric}
                placeholder="Card number"
                shortcutHint="Credit card number"
                topField
                onChange={checkCardType}
              />
            </div>
            <div className={css(styles.cardDetails)}>
              <div className={css(styles.expiry)}>
                <Field
                  component={CreditCardField}
                  iconName="calendar"
                  maxLength="5"
                  name="expiry"
                  placeholder="MM/YY"
                  shortcutHint="Expiration date"
                  normalize={normalizeExpiry}
                />
              </div>
              <div>
                <Field
                  component={CreditCardField}
                  iconName="lock"
                  maxLength="4"
                  name="cvc"
                  normalize={normalizeNumeric}
                  placeholder="CVC"
                  shortcutHint="3-digit code on the back of your card"
                />
              </div>
            </div>
          </div>
          <div className={css(styles.buttonGroup)}>
            <div className={css(styles.updateButton)}>
              <Button
                colorPalette="cool"
                disabled={submitting}
                isBlock
                label={crudAction}
                buttonSize="medium"
                type="submit"
                onClick={handleSubmit(addStripeBilling)}
              />
            </div>
            <div className={css(styles.cancelButton)}>
              <Button
                colorPalette="gray"
                disabled={submitting}
                isBlock
                label="Cancel"
                buttonSize="medium"
                onClick={closePortal}
              />
            </div>
          </div>
        </form>
      </div>
    </DashModal>
  );
};

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
  styles: PropTypes.object,
  submitting: PropTypes.bool,
  syncFormError: PropTypes.string
};

const inputInnerBorder = `1px solid ${appTheme.palette.mid30l}`;

const styleThunk = () => ({
  modalBody: {
    alignItems: 'center',
    background: ui.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },

  iconAvatarBlock: {
    margin: '0 0 .5rem'
  },

  cardInputs: {
    border: `1px solid ${appTheme.palette.mid60l}`,
    borderRadius: ui.borderRadiusSmall,
    display: 'flex',
    flexDirection: 'column',
    margin: '1.25rem 0',
    // required for to clip 0 border radius for input
    overflow: 'hidden',
    width: '100%'
  },

  creditCardNumber: {
    borderBottom: inputInnerBorder
  },

  cardDetails: {
    display: 'flex'
  },

  expiry: {
    borderRight: inputInnerBorder
  },

  error: {
    ...formError,
    marginTop: '1rem',
    fontSize: appTheme.typography.s2
  },

  buttonGroup: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%'
  },

  cancelButton: {
    flexGrow: '1',
    paddingRight: '.625rem'
  },

  updateButton: {
    flexGrow: '4',
    paddingLeft: '.625rem'
  }
});

export default reduxForm({form: 'creditCardInfo', validate, shouldValidate})(
  withStyles(styleThunk)(
    CreditCardModal
  )
);
