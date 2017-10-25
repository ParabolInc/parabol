import PropTypes from 'prop-types';
import raven from 'raven-js';
import React, {Component} from 'react';
import withAsync from 'react-async-hoc';
import portal from 'react-portal-hoc';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';
import UpdateCreditCardMutation from 'universal/mutations/UpdateCreditCardMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpgradeToProMutation from 'universal/mutations/UpgradeToProMutation';

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

const cardTypeLookup = {
  Visa: 'cc-visa',
  MasterCard: 'cc-mastercard',
  'American Express': 'cc-amex',
  Discover: 'cc-discover',
  'Diners Club': 'cc-diners-club',
  JCB: 'cc-jcb',
  Unknown: 'credit-card'
};

const mapStateToProps = (state) => {
  let syncFormError;
  const formState = state.form.creditCardInfo;
  if (formState) {
    const {syncErrors} = formState;
    if (syncErrors) {
      const firstErrorField = Object.keys(syncErrors)[0];
      const {touched} = formState.fields[firstErrorField] || {};
      if (touched) {
        syncFormError = syncErrors[firstErrorField];
      }
    }
  }
  return {syncFormError};
};

class CreditCardModalContainer extends Component {
  state = {
    cardTypeIcon: 'credit-card'
  };

  addStripeBilling = async (submittedData) => {
    const {
      atmosphere,
      closePortal,
      createToken,
      handleToken,
      isUpdate,
      orgId
    } = this.props;
    const {creditCardNumber: number, expiry, cvc} = submittedData;
    const [expMonth, expYear] = expiry.split('/');
    const {error, id: stripeToken, card} = await createToken({number, exp_month: expMonth, exp_year: expYear, cvc});
    if (error) {
      const errorMessage = {_error: error.message};
      const field = stripeFieldLookup[error.param];
      if (field) {
        errorMessage[field.name] = field.message;
      }
      raven.captureException(error);
      throw new SubmissionError(errorMessage);
    }
    if (handleToken) {
      // without an orgId, assume a cb is provided
      handleToken(stripeToken, card.last4);
      closePortal();
    }
    if (orgId) {
      const onError = (err) => {
        throw new SubmissionError(err);
      };
      const onCompleted = () => {
        closePortal();
      };
      if (isUpdate) {
        UpdateCreditCardMutation(atmosphere, orgId, stripeToken, onError, onCompleted);
      } else {
        UpgradeToProMutation(atmosphere, orgId, stripeToken, onError, onCompleted);
      }
    }
  };

  checkCardType = (e) => {
    const {stripeCard} = this.props;
    if (stripeCard && e.currentTarget.value) {
      const type = stripeCard.cardType(e.currentTarget.value);
      const cardTypeIcon = cardTypeLookup[type];
      if (cardTypeIcon !== this.state.cardTypeIcon) {
        this.setState({
          cardTypeIcon
        });
      }
    }
  };

  render() {
    const {isUpdate} = this.props;
    const crudAction = isUpdate ? 'Update' : 'Add';
    return (
      <CreditCardModal
        {...this.props}
        addStripeBilling={this.addStripeBilling}
        cardTypeIcon={this.state.cardTypeIcon}
        crudAction={crudAction}
        checkCardType={this.checkCardType}
      />
    );
  }
}

CreditCardModalContainer.propTypes = {
  createToken: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  isUpdate: PropTypes.bool,
  closePortal: PropTypes.func,
  handleToken: PropTypes.func,
  orgId: PropTypes.string,
  stripeCard: PropTypes.func
};

const stripeCb = () => {
  const stripe = window.Stripe;
  stripe.setPublishableKey(window.__ACTION__.stripe);
  return {
    createToken: (fields) => new Promise((resolve) => {
      stripe.card.createToken(fields, (status, response) => {
        resolve(response);
      });
    }),
    stripeCard: stripe.card
  };
};

export default portal({escToClose: true, closeAfter: 100})(
  withAtmosphere(
    withAsync({'https://js.stripe.com/v2/': stripeCb})(
      connect(mapStateToProps)(
        CreditCardModalContainer
      )
    )
  )
);
