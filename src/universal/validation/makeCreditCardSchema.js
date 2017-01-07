import legitify from './legitify';
import luhn from 'fast-luhn';
import {cvcRegex, expiryRegex} from 'universal/validation/regex';

export default function makeCreditCardSchema() {
  return legitify({
    creditCardNumber: (value) => value
      .required('You must enter a CC number')
      .test((raw) => {
        return !luhn(raw) && 'Double check that credit card number'
      }),
    expiry: (value) => value
      .required('Please enter an expiration date')
      .matches(expiryRegex, 'That expiration looks invalid'),
    cvc: (value) => value
      .required('You must enter a CVC code')
      .matches(cvcRegex, 'That CVC looks invalid')
  });
}
