import legitify from './legitify';

export default function makeCreditCardSchema(stripeCard) {
  return legitify({
    creditCardNumber: (value) => value
      .required('You must enter a CC number')
      // Diners Club CC number has 14 digits
      // SEE: https://stripe.com/docs/testing
      .min(14, 'That credit card is missing some digits')
      .test((raw) => {
        return !stripeCard.validateCardNumber(raw) && 'Double check that credit card number';
      }),
    expiry: (value) => value
      .required('Please enter an expiration date')
      .test((raw) => {
        return !stripeCard.validateExpiry(raw) && 'Double check that expiration';
      }),
    cvc: (value) => value
      .required('You must enter a CVC code')
      .test((raw) => !stripeCard.validateCVC(raw) && 'Double check that CVC')
  });
}
