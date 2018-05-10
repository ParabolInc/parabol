export const stripeFieldLookup = {
  exp_year: 'expiry',
  exp_month: 'expiry',
  number: 'creditCardNumber',
  cvc: 'cvc'
};

export const CCValidationErrors = {
  creditCardNumber: 'Double check that credit card number',
  expiry: 'Double check that expiration',
  cvc: 'Double check that CVC'
};

export const cardTypeLookup = {
  Visa: 'cc-visa',
  MasterCard: 'cc-mastercard',
  'American Express': 'cc-amex',
  Discover: 'cc-discover',
  'Diners Club': 'cc-diners-club',
  JCB: 'cc-jcb',
  Unknown: 'credit-card'
};
