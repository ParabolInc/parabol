import {errorObj} from '../utils/utils';

export default async function tryStripeCall(promise) {
  try {
    return await promise;
  } catch (e) {
    throw errorObj({_error: e.message});
  }
};
