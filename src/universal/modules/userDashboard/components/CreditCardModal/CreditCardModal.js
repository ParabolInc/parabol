import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
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
  return (
    <DashModal onBackdropClick={onBackdropClick} inputModal>
      <div className={css(styles.modalBody)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="credit-card"/>
          </div>
        </div>
        <Type align="center" bold scale="s4">
          Update Credit Card
        </Type>
        <div className={css(styles.reassure)}>
          <FontAwesome name="lock"/>
          <span>Secured by
          <span className={css(styles.stripeName)}>Stripe</span>
        </span>
        </div>
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
        <div className={css(styles.inputGroup)}>

        </div>
        <IconLink
          colorPalette="warm"
          icon="arrow-circle-right"
          iconPlacement="right"
          label={`Remove ${preferredName}`}
          margin="1.5rem 0 0"
          onClick={handleClick}
          scale="large"
        />
      </div>
    </DashModal>
  );
};

CreditCardModal.propTypes = {
  onBackdropClick: PropTypes.func,
  orgId: PropTypes.string.isRequired,
};

const avatarPlaceholderSize = '2.75rem';
const styleThunk = () => ({
  // TODO this is copied from the add
  avatarPlaceholder: {
    backgroundColor: appTheme.palette.mid50l,
    borderRadius: '100%',
    // boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${appTheme.palette.mid10a}`,
    color: appTheme.palette.mid50l,
    fontSize: ui.iconSizeAvatar,
    height: avatarPlaceholderSize,
    lineHeight: avatarPlaceholderSize,
    padding: '1px',
    position: 'relative',
    textAlign: 'center',
    width: avatarPlaceholderSize,

    ':after': {
      border: '2px solid currentColor',
      borderRadius: '100%',
      content: '""',
      display: 'block',
      height: avatarPlaceholderSize,
      left: 0,
      position: 'absolute',
      top: 0,
      width: avatarPlaceholderSize
    }
  },

  avatarPlaceholderInner: {
    backgroundColor: '#fff',
    borderRadius: '100%',
    height: '2.625rem',
    // lineHeight: '2.625rem',
    overflow: 'hidden',
    width: '2.625rem'
  },

  creditCardNumber: {
    borderBottom: '1px solid lightgray',
    // borderRadius: '4px 4px 0 0'
  },
  cardDetails: {
    display: 'flex'
  },
  cardInputs: {
    border: '1px solid gray',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    // required for to clip 0 border radius for input
    overflow: 'hidden',
    width: '100%'
  },

  expiry: {
    borderRight: '1px solid lightgray'
  },

  modalBody: {
    background: ui.dashBackgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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

