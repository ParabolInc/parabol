export const stripeFieldLookup = {
  exp_year: 'expiry',
  exp_month: 'expiry',
  number: 'creditCardNumber',
  cvc: 'cvc'
}

export const CCValidationErrors = {
  creditCardNumber: 'Double check that credit card number',
  expiry: 'Double check that expiration',
  cvc: 'Double check that CVC'
}

export const cardTypeLookup = {
  Visa: 'cc-visa-brands',
  MasterCard: 'cc-mastercard-brands',
  'American Express': 'cc-amex-brands',
  Discover: 'cc-discover-brands',
  'Diners Club': 'cc-diners-club-brands',
  JCB: 'cc-jcb-brands',
  Unknown: 'credit_card'
}
