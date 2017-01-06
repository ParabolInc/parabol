import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {reduxForm, Field} from 'redux-form';
import CreditCardField from './CreditCardField';
import FontAwesome from 'react-fontawesome';

const CreditCardModal = (props) => {
  const {handleSubmit, onBackdropClick, orgId, preferredName, styles, userId} = props;
  const handleClick = () => {
    const variables = {orgId, userId};
    cashay.mutate('removeBillingLeader', {variables});
  };
  const updateStripeBilling = () => {
  };
  const lockIconStyles = {
    lineHeight: appTheme.typography.s5,
    marginRight: '.2em'
  };
  const cardIconStyles = {
    display: 'block',
    fontSize: ui.iconSize2x,
    lineHeight: '3rem'
  };
  return (
    <DashModal onBackdropClick={onBackdropClick} inputModal>
      <div className={css(styles.modalBody)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="credit-card" style={cardIconStyles} />
          </div>
        </div>
        <Type align="center" colorPalette="mid" lineHeight="1.875rem" marginBottom=".25rem" scale="s6">
          Update Credit Card
        </Type>
        <Type align="center" colorPalette="mid" lineHeight={appTheme.typography.s5} scale="s3">
          <FontAwesome name="lock" style={lockIconStyles} /> Secured by <b>Stripe</b>
        </Type>
        <form className={css(styles.cardInputs)}>
          <div className={css(styles.creditCardNumber)}>
            <Field
              autoFocus
              component={CreditCardField}
              iconName="credit-card"
              name="creditCardNumber"
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
                name="expiry"
                placeholder="MM/YY"
                shortcutHint="Expiration date"
              />
            </div>
            <div>
              <Field
                component={CreditCardField}
                iconName="lock"
                name="cvc"
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
              onClick={updateStripeBilling}
            />
          </div>
        </div>
      </div>
    </DashModal>
  );
};

CreditCardModal.propTypes = {
  onBackdropClick: PropTypes.func,
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

export default reduxForm({form: 'creditCardInfo'})(
  withStyles(styleThunk)(
    CreditCardModal
  )
);
