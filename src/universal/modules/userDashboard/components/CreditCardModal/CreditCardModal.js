import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {reduxForm, Field, SubmissionError} from 'redux-form';
import CreditCardField from './CreditCardField';
import FontAwesome from 'react-fontawesome';
import withAsync from 'react-async-hoc';
import {stripeKey} from 'universal/utils/clientOptions';
import makeCreditCardSchema from 'universal/validation/makeCreditCardSchema';

const lockIconStyles = {
  lineHeight: appTheme.typography.s5,
  marginRight: '.2em'
};
const cardIconStyles = {
  display: 'block',
  fontSize: ui.iconSize2x,
  lineHeight: '3rem'
};

const stripeFieldLookup = {
  exp_year: {
    name: 'expiry',
    message: 'The expiration year is invalid'
  },
  exp_month: {
    name: 'expiry',
    message: 'The expiration month is invalid'
  },
  number: {
    name: 'creditCardNumber',
    message: 'The credit card number is invalid'
  },
  cvc: {
    name: 'cvc',
    message: 'The cvc is invalid'
  }
};

const normalizeExpiry = (value = '', previousValue = '') => {
  const month = value.substr(0, 2);
  // left pad
  if (month.length === 1 && month > 1) {
    return `0${month}/`;
  }
  // if backspacing or typing a month > 12
  if ((previousValue.length === 3 && value.length === 2) || parseInt(month) > 12) {
    return value[0];
  }
  const numValue = value.replace(/[^\d]/g, '');
  if (numValue.length >= 2) {
    const prefix = `${numValue.substr(0, 2)}/`;
    const year = numValue.substr(2);
    const currentYear = String((new Date()).getFullYear()).substr(2);
    // only 201x+
    if (year.length === 0 || year.length === 1 && year < currentYear[0]) {
      return prefix;
    }
    // only 2017+
    if (year.length > 0 && year < currentYear) {
      return `${prefix}${year[0]}`;
    }
    // final value
    return `${prefix}${numValue.substr(2)}`;
  }
  // correct month (october+)
  return value;
};

const normalizeNumeric = (value) => value.replace(/[^\d]/g, '');

const validate = (values) => {
  const schema = makeCreditCardSchema();
  return schema(values).errors;
};

const CreditCardModal = (props) => {
  const {createToken, handleSubmit, onBackdropClick, orgId, styles} = props;
  const updateStripeBilling = async (submittedData) => {
    const {creditCardNumber: number, expiry, cvc} = submittedData;
    const [exp_month, exp_year] = expiry.split('/');
    const {error, id} = await createToken({number, exp_month, exp_year, cvc})
    if (error) {
      const errorMessage = {_error: error.message};
      const field = stripeFieldLookup[error.param];
      if (field) {
        errorMessage[field.name] = field.message;
      }
      throw new SubmissionError(errorMessage)
    }
    const variables = {
      orgId,
      stripeToken: id
    };
    cashay.mutate('addBilling', {variables});

  };

  return (
    <DashModal onBackdropClick={onBackdropClick} inputModal>
      <div className={css(styles.modalBody)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="credit-card" style={cardIconStyles}/>
          </div>
        </div>
        <Type align="center" colorPalette="mid" lineHeight="1.875rem" marginBottom=".25rem" scale="s6">
          Update Credit Card
        </Type>
        <Type align="center" colorPalette="mid" lineHeight={appTheme.typography.s5} scale="s3">
          <FontAwesome name="lock" style={lockIconStyles}/> Secured by <b>Stripe</b>
        </Type>
        <form className={css(styles.cardInputs)} onSubmit={handleSubmit(updateStripeBilling)}>
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
              isBlock
              label="Cancel"
              size="small"
              onClick={onBackdropClick}
            />
          </div>
          <div className={css(styles.updateButton)}>
            <Button
              colorPalette="cool"
              isBlock
              label="Update"
              size="small"
              type="submit"
              onClick={handleSubmit(updateStripeBilling)}
            />
          </div>
        </div>
      </div>
    </DashModal>
  );
};

CreditCardModal.propTypes = {
  onBackdropClick: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
};

const avatarPlaceholderSize = '4rem';
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
    marginTop: '2rem',
    width: '100%'
  },

  cancelButton: {
    flexGrow: '1'
  },

  updateButton: {
    flexGrow: '2',
    marginLeft: '1rem'
  },

  creditCardNumber: {
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
  },
  cardDetails: {
    display: 'flex'
  },
  cardInputs: {
    border: `1px solid ${appTheme.palette.mid60l}`,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    margin: '1.25rem 0',
    // required for to clip 0 border radius for input
    overflow: 'hidden',
    width: '100%'
  },

  expiry: {
    borderRight: `1px solid ${appTheme.palette.mid20l}`
  },

  modalBody: {
    background: ui.dashBackgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  reassure: {
    marginBottom: '2rem'
  },

  stripeName: {
    fontWeight: 700
  }
});

const stripeCb = () => {
  const stripe = window.Stripe;
  console.log('set key', stripeKey)
  stripe.setPublishableKey(stripeKey);
  return {
    createToken: (fields) => new Promise((resolve) => {
      stripe.card.createToken(fields, (status, response) => {
        resolve(response);
      })
    })
  };
};
export default reduxForm({form: 'creditCardInfo', validate})(
  withAsync({'https://js.stripe.com/v2/': stripeCb})(
    withStyles(styleThunk)(
      CreditCardModal
    )
  )
);
