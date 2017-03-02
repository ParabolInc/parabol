import mime from 'mime-types';
import {APP_MAX_AVATAR_FILE_SIZE, BILLING_LEADER} from '../../universal/utils/constants';


// Stringify an object to handle multiple errors
// Wrap it in a new Error type to avoid sending it twice via the originalError field
export const errorObj = obj => new Error(JSON.stringify(obj));

export const handleSchemaErrors = (errors, genericMessage) => {
  if (Object.keys(errors).length > 0) {
    errors._error = genericMessage || 'Server validation error';
    throw errorObj(errors);
  }
};

export function firstChange(possiblyUpdatedResult) {
  if (possiblyUpdatedResult.changes.length) {
    if (possiblyUpdatedResult.changes.length > 1) {
      console.warn('firstChange() detects more than 1 change, returning 1st.');
    }
    return possiblyUpdatedResult.changes[0];
  }
  return { new_val: undefined, old_val: undefined };
}

export function getOldVal(possiblyUpdatedResult) {
  return firstChange(possiblyUpdatedResult).old_val;
}

export function getNewVal(resultWithReturnChanges) {
  return firstChange(resultWithReturnChanges).new_val;
}

export function updatedOrOriginal(possiblyUpdatedResult, original) {
  /*
   * There will only be changes to return if there were changes made to the
   * DB. Therefore, we've got to check.
   */
  const originalReturn = (typeof original !== 'undefined') ?
    original : getOldVal(possiblyUpdatedResult);

  return getNewVal(possiblyUpdatedResult) || originalReturn;
}

// todo put this in a legitify schema
export function validateAvatarUpload(contentType, contentLength) {
  if (typeof process.env.CDN_BASE_URL === 'undefined') {
    throw errorObj({_error: 'CDN_BASE_URL environment variable is not defined'});
  }
  if (!contentType || !contentType.startsWith('image/')) {
    throw errorObj({_error: 'file must be an image'});
  }
  const ext = mime.extension(contentType);
  if (!ext) {
    throw errorObj({_error: `unable to determine extension for ${contentType}`});
  }
  if (contentLength > APP_MAX_AVATAR_FILE_SIZE) {
    throw errorObj({_error: 'avatar image is too large'});
  }
  return ext;
}

export function billingLeaderFilter(id) {
  return (orgUsers) => orgUsers.contains((orgUser) => orgUser('id').eq(id).and(orgUser('role').eq(BILLING_LEADER)));
}
