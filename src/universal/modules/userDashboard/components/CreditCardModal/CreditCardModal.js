import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {reduxForm, Field} from 'redux-form';
import CreditCardField from './CreditCardField';
import FontAwesome from 'react-fontawesome';
import makeCreditCardSchema from 'universal/validation/makeCreditCardSchema';
import formError from 'universal/styles/helpers/formError';
import {normalizeExpiry, normalizeNumeric} from './normalizers';
import shouldValidate from 'universal/validation/shouldValidate';

const lockIconStyles = {
  lineHeight: appTheme.typography.s5,
  marginRight: '.2em'
};
const cardIconStyles = {
  display: 'block',
  fontSize: ui.iconSize2x,
  lineHeight: '3rem'
};

const validate = (values, props) => {
  const {stripeCard} = props;
  const schema = makeCreditCardSchema(stripeCard);
  return schema(values).errors;
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
    syncFormError,
  } = props;
  const anyError = error || syncFormError;
  return (
    <DashModal onBackdropClick={closePortal} inputModal isClosing={isClosing} closeAfter={closeAfter}>
      <div className={css(styles.modalBody)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name={cardTypeIcon} style={cardIconStyles}/>
          </div>
        </div>
        <Type align="center" colorPalette="mid" lineHeight="1.875rem" marginBottom=".25rem" scale="s6">
          {crudAction} Credit Card
        </Type>
        <Type align="center" colorPalette="mid" lineHeight={appTheme.typography.s5} scale="s3">
          <FontAwesome name="lock" style={lockIconStyles}/> Secured by <b>Stripe</b>
        </Type>
        {dirty && anyError && <div className={css(styles.error)}>{anyError}</div>}
        <form className={css(styles.cardInputs)} onSubmit={handleSubmit(addStripeBilling)}>
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
        </form>
        <div className={css(styles.buttonGroup)}>
          <div className={css(styles.cancelButton)}>
            <Button
              colorPalette="gray"
              disabled={submitting}
              isBlock
              label="Cancel"
              size="small"
              onClick={closePortal}
            />
          </div>
          <div className={css(styles.updateButton)}>
            <Button
              colorPalette="cool"
              disabled={submitting}
              isBlock
              label={crudAction}
              size="small"
              type="submit"
              onClick={handleSubmit(addStripeBilling)}
            />
          </div>
        </div>
      </div>
    </DashModal>
  );
};

CreditCardModal.propTypes = {
  isUpdate: PropTypes.bool,
  closePortal: PropTypes.func,
  handleToken: PropTypes.func,
  orgId: PropTypes.string,
};

const avatarPlaceholderSize = '4rem';
const inputInnerBorder = `1px solid ${appTheme.palette.mid30l}`;

const styleThunk = () => ({
  // TODO this is copied from the add
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#fff',
    border: `2px solid ${appTheme.palette.mid50l}`,
    borderRadius: '100%',
    color: appTheme.palette.mid50l,
    display: 'flex',
    height: avatarPlaceholderSize,
    justifyContent: 'center',
    lineHeight: avatarPlaceholderSize,
    margin: '0 0 .5rem',
    textAlign: 'center',
    width: avatarPlaceholderSize,
  },

  avatarPlaceholderInner: {
    height: '3rem',
    width: '3rem'
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  },

  cancelButton: {
    flexGrow: '1'
  },

  updateButton: {
    flexGrow: '4',
    marginLeft: '1rem'
  },

  creditCardNumber: {
    borderBottom: inputInnerBorder
  },
  cardDetails: {
    display: 'flex'
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

  error: {
    ...formError,
    marginTop: '1rem',
    fontSize: appTheme.typography.s2
  },

  expiry: {
    borderRight: inputInnerBorder
  },

  modalBody: {
    alignItems: 'center',
    background: ui.dashBackgroundColor,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },

  reassure: {
    marginBottom: '2rem'
  },

  stripeName: {
    fontWeight: 700
  }
});

export default reduxForm({form: 'creditCardInfo', validate, shouldValidate})(
  withStyles(styleThunk)(
    CreditCardModal
  )
);
